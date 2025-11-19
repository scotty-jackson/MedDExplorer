"""
ETL script for Medicare Part D drug spending data.

This script:
1. Reads CMS Part D CSV/TSV files from a specified directory
2. Normalizes and validates the data
3. Calculates derived metrics (per-claim costs, YoY growth, etc.)
4. Upserts data into the PostgreSQL database

Usage:
    python -m app.etl.etl_partd --data-dir /path/to/cms/data
"""

import os
import sys
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Optional
import pandas as pd
import re
from sqlalchemy.orm import Session
from sqlalchemy import and_

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal, engine
from app.models import Drug, DrugClass, DrugYearStat, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MedicarePartDETL:
    """ETL processor for Medicare Part D drug spending data."""

    def __init__(self, data_dir: str):
        """
        Initialize the ETL processor.

        Args:
            data_dir: Directory containing CMS Part D CSV/TSV files
        """
        self.data_dir = Path(data_dir)
        self.db: Session = SessionLocal()
        self.stats = {
            'files_processed': 0,
            'drugs_created': 0,
            'drugs_updated': 0,
            'stats_created': 0,
            'stats_updated': 0,
            'errors': 0
        }

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db.close()

    def create_slug(self, name: str) -> str:
        """
        Create a URL-friendly slug from a drug name.

        Args:
            name: Drug name (generic or brand)

        Returns:
            URL-friendly slug
        """
        if not name:
            return ""

        # Convert to lowercase and replace spaces/special chars with hyphens
        slug = re.sub(r'[^\w\s-]', '', name.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')

    def normalize_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize column names from CMS files to standard format.

        CMS files may have varying column names across years.
        This function maps them to our standard schema.

        Args:
            df: Raw DataFrame from CMS file

        Returns:
            DataFrame with normalized column names
        """
        # Common column name mappings (update based on actual CMS files)
        column_map = {
            # Drug identifiers
            'Brnd_Name': 'brand_name',
            'Brand Name': 'brand_name',
            'BrandName': 'brand_name',
            'Gnrc_Name': 'generic_name',
            'Generic Name': 'generic_name',
            'GenericName': 'generic_name',

            # Year
            'Year': 'year',
            'Yr': 'year',

            # Spending metrics
            'Tot_Spndng': 'total_spending',
            'Total Spending': 'total_spending',
            'TotalSpending': 'total_spending',
            'Tot_Drug_Cst': 'total_spending',

            # Claims
            'Tot_Clms': 'total_claims',
            'Total Claims': 'total_claims',
            'TotalClaims': 'total_claims',
            'Claim_Cnt': 'total_claims',

            # Beneficiaries
            'Tot_Benes': 'beneficiaries_count',
            'Total Beneficiaries': 'beneficiaries_count',
            'TotalBeneficiaries': 'beneficiaries_count',
            'Bene_Cnt': 'beneficiaries_count',

            # Dosage units
            'Tot_Day_Suply': 'total_dosage_units',
            'Total Day Supply': 'total_dosage_units',
        }

        # Rename columns
        df_renamed = df.rename(columns=column_map)

        # Convert column names to lowercase
        df_renamed.columns = df_renamed.columns.str.lower().str.replace(' ', '_')

        return df_renamed

    def load_csv_files(self) -> List[pd.DataFrame]:
        """
        Load all CSV/TSV files from the data directory.

        Returns:
            List of DataFrames, one per file
        """
        dataframes = []

        if not self.data_dir.exists():
            logger.error(f"Data directory does not exist: {self.data_dir}")
            return dataframes

        # Find all CSV and TSV files
        patterns = ['*.csv', '*.tsv', '*.txt']
        files = []
        for pattern in patterns:
            files.extend(self.data_dir.glob(pattern))

        if not files:
            logger.warning(f"No CSV/TSV files found in {self.data_dir}")
            return dataframes

        logger.info(f"Found {len(files)} files to process")

        for file_path in files:
            try:
                logger.info(f"Loading file: {file_path.name}")

                # Try to detect delimiter
                delimiter = '\t' if file_path.suffix == '.tsv' else ','

                # Read file
                df = pd.read_csv(file_path, delimiter=delimiter, low_memory=False)

                # Normalize column names
                df = self.normalize_column_names(df)

                dataframes.append(df)
                self.stats['files_processed'] += 1

                logger.info(f"  Loaded {len(df)} rows from {file_path.name}")

            except Exception as e:
                logger.error(f"Error loading file {file_path}: {e}")
                self.stats['errors'] += 1

        return dataframes

    def process_drug(self, row: pd.Series) -> Optional[Drug]:
        """
        Create or update a Drug record.

        Args:
            row: DataFrame row with drug information

        Returns:
            Drug object or None if error
        """
        try:
            generic_name = str(row.get('generic_name', '')).strip()
            brand_name = str(row.get('brand_name', '')).strip()

            if not generic_name and not brand_name:
                logger.warning("Skipping row with no drug name")
                return None

            # Use generic name as primary identifier, fallback to brand
            primary_name = generic_name if generic_name else brand_name

            # Create slug based on both generic and brand name for uniqueness
            slug_base = f"{primary_name}-{brand_name}" if brand_name else primary_name
            slug = self.create_slug(slug_base)

            # Check if drug exists (by BOTH generic name AND brand name for uniqueness)
            # Different brands of the same generic should be separate drug records
            drug = self.db.query(Drug).filter(
                Drug.generic_name == generic_name,
                Drug.brand_name == brand_name
            ).first()

            if drug:
                # Drug already exists, just return it
                self.stats['drugs_updated'] += 1
            else:
                # Create new drug
                drug = Drug(
                    generic_name=generic_name if generic_name else brand_name,
                    brand_name=brand_name if brand_name else None,
                    slug=slug
                )
                self.db.add(drug)
                self.db.flush()  # Get the drug ID
                self.stats['drugs_created'] += 1

            return drug

        except Exception as e:
            logger.error(f"Error processing drug: {e}")
            self.stats['errors'] += 1
            return None

    def calculate_derived_metrics(self, row: pd.Series) -> Dict:
        """
        Calculate derived metrics from raw data.

        Args:
            row: DataFrame row with raw metrics

        Returns:
            Dictionary of derived metrics
        """
        metrics = {}

        total_spending = float(row.get('total_spending', 0) or 0)
        total_claims = int(row.get('total_claims', 0) or 0)
        beneficiaries = int(row.get('beneficiaries_count', 0) or 0)

        # Spending per claim
        if total_claims > 0:
            metrics['spending_per_claim'] = total_spending / total_claims
        else:
            metrics['spending_per_claim'] = None

        # Spending per beneficiary
        if beneficiaries > 0:
            metrics['spending_per_beneficiary'] = total_spending / beneficiaries
        else:
            metrics['spending_per_beneficiary'] = None

        return metrics

    def calculate_yoy_growth(self, drug_id: int, year: int) -> Dict:
        """
        Calculate year-over-year growth metrics.

        Args:
            drug_id: Drug ID
            year: Current year

        Returns:
            Dictionary of YoY growth metrics
        """
        growth = {}

        # Get prior year stats
        prior_year_stat = self.db.query(DrugYearStat).filter(
            and_(
                DrugYearStat.drug_id == drug_id,
                DrugYearStat.year == year - 1
            )
        ).first()

        if not prior_year_stat:
            return {
                'yoy_spending_growth': None,
                'yoy_beneficiary_growth': None,
                'yoy_claims_growth': None
            }

        # Get current year stats
        current_year_stat = self.db.query(DrugYearStat).filter(
            and_(
                DrugYearStat.drug_id == drug_id,
                DrugYearStat.year == year
            )
        ).first()

        if current_year_stat:
            # Calculate spending growth
            if prior_year_stat.total_spending > 0:
                growth['yoy_spending_growth'] = (
                    (current_year_stat.total_spending - prior_year_stat.total_spending) /
                    prior_year_stat.total_spending * 100
                )
            else:
                growth['yoy_spending_growth'] = None

            # Calculate beneficiary growth
            if prior_year_stat.beneficiaries_count and current_year_stat.beneficiaries_count:
                if prior_year_stat.beneficiaries_count > 0:
                    growth['yoy_beneficiary_growth'] = (
                        (current_year_stat.beneficiaries_count - prior_year_stat.beneficiaries_count) /
                        prior_year_stat.beneficiaries_count * 100
                    )
                else:
                    growth['yoy_beneficiary_growth'] = None
            else:
                growth['yoy_beneficiary_growth'] = None

            # Calculate claims growth
            if prior_year_stat.total_claims > 0:
                growth['yoy_claims_growth'] = (
                    (current_year_stat.total_claims - prior_year_stat.total_claims) /
                    prior_year_stat.total_claims * 100
                )
            else:
                growth['yoy_claims_growth'] = None

        return growth

    def process_year_stat(self, drug: Drug, row: pd.Series) -> Optional[DrugYearStat]:
        """
        Create or update a DrugYearStat record.

        Args:
            drug: Drug object
            row: DataFrame row with year statistics

        Returns:
            DrugYearStat object or None if error
        """
        try:
            year = int(row.get('year', 0))
            if year == 0:
                logger.warning("Skipping row with no year")
                return None

            # Get raw metrics
            total_spending = float(row.get('total_spending', 0) or 0)
            total_claims = int(row.get('total_claims', 0) or 0)
            beneficiaries_count = row.get('beneficiaries_count')

            if beneficiaries_count:
                beneficiaries_count = int(beneficiaries_count)
            else:
                beneficiaries_count = None

            # Calculate derived metrics
            derived = self.calculate_derived_metrics(row)

            # Check if stat exists
            stat = self.db.query(DrugYearStat).filter(
                and_(
                    DrugYearStat.drug_id == drug.id,
                    DrugYearStat.year == year
                )
            ).first()

            if stat:
                # Update existing stat
                stat.total_spending = total_spending
                stat.total_claims = total_claims
                stat.beneficiaries_count = beneficiaries_count
                stat.spending_per_claim = derived['spending_per_claim']
                stat.spending_per_beneficiary = derived['spending_per_beneficiary']
                self.stats['stats_updated'] += 1
            else:
                # Create new stat
                stat = DrugYearStat(
                    drug_id=drug.id,
                    year=year,
                    total_spending=total_spending,
                    total_claims=total_claims,
                    beneficiaries_count=beneficiaries_count,
                    spending_per_claim=derived['spending_per_claim'],
                    spending_per_beneficiary=derived['spending_per_beneficiary']
                )
                self.db.add(stat)
                self.stats['stats_created'] += 1

            return stat

        except Exception as e:
            logger.error(f"Error processing year stat: {e}")
            self.stats['errors'] += 1
            return None

    def update_yoy_growth_metrics(self):
        """
        Update year-over-year growth metrics for all drugs and years.
        This should be run after all data is loaded.
        """
        logger.info("Calculating year-over-year growth metrics...")

        # Get all unique drug_id and year combinations
        stats = self.db.query(DrugYearStat).order_by(
            DrugYearStat.drug_id,
            DrugYearStat.year
        ).all()

        for stat in stats:
            growth = self.calculate_yoy_growth(stat.drug_id, stat.year)
            stat.yoy_spending_growth = growth.get('yoy_spending_growth')
            stat.yoy_beneficiary_growth = growth.get('yoy_beneficiary_growth')
            stat.yoy_claims_growth = growth.get('yoy_claims_growth')

        self.db.commit()
        logger.info("Year-over-year growth metrics updated")

    def process_dataframes(self, dataframes: List[pd.DataFrame]):
        """
        Process all DataFrames and load into database.

        Args:
            dataframes: List of DataFrames to process
        """
        for idx, df in enumerate(dataframes, 1):
            logger.info(f"Processing DataFrame {idx}/{len(dataframes)} ({len(df)} rows)")

            for row_idx, row in df.iterrows():
                try:
                    # Process drug
                    drug = self.process_drug(row)
                    if not drug:
                        continue

                    # Process year stat
                    stat = self.process_year_stat(drug, row)

                    # Commit every 1000 rows
                    if row_idx % 1000 == 0:
                        self.db.commit()
                        logger.info(f"  Processed {row_idx} rows...")

                except Exception as e:
                    logger.error(f"Error processing row {row_idx}: {e}")
                    self.stats['errors'] += 1
                    self.db.rollback()

            # Commit after each file
            self.db.commit()
            logger.info(f"DataFrame {idx} processing complete")

    def run(self):
        """Execute the full ETL pipeline."""
        logger.info("Starting Medicare Part D ETL process")
        logger.info(f"Data directory: {self.data_dir}")

        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        # Load CSV files
        dataframes = self.load_csv_files()
        if not dataframes:
            logger.error("No data to process")
            return

        # Process dataframes
        self.process_dataframes(dataframes)

        # Update YoY growth metrics
        self.update_yoy_growth_metrics()

        # Print summary
        logger.info("=" * 50)
        logger.info("ETL Process Complete")
        logger.info("=" * 50)
        logger.info(f"Files processed: {self.stats['files_processed']}")
        logger.info(f"Drugs created: {self.stats['drugs_created']}")
        logger.info(f"Drugs updated: {self.stats['drugs_updated']}")
        logger.info(f"Year stats created: {self.stats['stats_created']}")
        logger.info(f"Year stats updated: {self.stats['stats_updated']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info("=" * 50)


def main():
    """Main entry point for ETL script."""
    parser = argparse.ArgumentParser(
        description='ETL script for Medicare Part D drug spending data'
    )
    parser.add_argument(
        '--data-dir',
        type=str,
        default=os.getenv('DATA_DIR', './data/raw'),
        help='Directory containing CMS Part D CSV/TSV files'
    )

    args = parser.parse_args()

    with MedicarePartDETL(args.data_dir) as etl:
        etl.run()


if __name__ == '__main__':
    main()
