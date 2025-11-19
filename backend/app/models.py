"""
SQLAlchemy database models for Medicare Part D drug spending data.
"""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Index, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base


class DrugClass(Base):
    """
    Drug classification/category table (e.g., GLP-1, Statin, Oncology).
    """
    __tablename__ = "drug_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    drugs = relationship("Drug", back_populates="drug_class")

    def __repr__(self):
        return f"<DrugClass(id={self.id}, name='{self.name}')>"


class Drug(Base):
    """
    Drug master table containing drug identifiers and classifications.
    """
    __tablename__ = "drugs"

    id = Column(Integer, primary_key=True, index=True)
    generic_name = Column(String(500), nullable=False, index=True)
    brand_name = Column(String(500), nullable=True, index=True)

    # Drug identifiers
    ndc = Column(String(50), nullable=True)  # National Drug Code
    hcpcs_code = Column(String(50), nullable=True)  # Healthcare Common Procedure Coding System

    # Classification
    drug_class_id = Column(Integer, ForeignKey("drug_classes.id"), nullable=True, index=True)

    # SEO-friendly slug for URLs
    slug = Column(String(500), unique=True, nullable=True, index=True)

    # Relationships
    drug_class = relationship("DrugClass", back_populates="drugs")
    year_stats = relationship("DrugYearStat", back_populates="drug", cascade="all, delete-orphan")

    # Indexes for search optimization
    __table_args__ = (
        Index("idx_drug_generic_name_trgm", generic_name, postgresql_using="gin", postgresql_ops={"generic_name": "gin_trgm_ops"}),
        Index("idx_drug_brand_name_trgm", brand_name, postgresql_using="gin", postgresql_ops={"brand_name": "gin_trgm_ops"}),
    )

    def __repr__(self):
        return f"<Drug(id={self.id}, generic='{self.generic_name}', brand='{self.brand_name}')>"


class DrugYearStat(Base):
    """
    Annual statistics for each drug including spending, claims, and beneficiaries.
    """
    __tablename__ = "drug_year_stats"

    id = Column(Integer, primary_key=True, index=True)
    drug_id = Column(Integer, ForeignKey("drugs.id"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)

    # Raw metrics from CMS data
    total_spending = Column(Float, nullable=False)  # Gross drug cost
    total_claims = Column(Integer, nullable=False)
    beneficiaries_count = Column(Integer, nullable=True)

    # Derived metrics
    spending_per_claim = Column(Float, nullable=True)  # total_spending / total_claims
    spending_per_beneficiary = Column(Float, nullable=True)  # total_spending / beneficiaries_count

    # Year-over-year growth metrics (calculated during ETL)
    yoy_spending_growth = Column(Float, nullable=True)  # Percentage change from prior year
    yoy_beneficiary_growth = Column(Float, nullable=True)  # Percentage change from prior year
    yoy_claims_growth = Column(Float, nullable=True)  # Percentage change from prior year

    # Additional useful metrics
    avg_cost_per_unit = Column(Float, nullable=True)  # If unit data is available
    total_dosage_units = Column(Float, nullable=True)  # If available in dataset

    # Relationships
    drug = relationship("Drug", back_populates="year_stats")

    # Composite unique constraint: one record per drug per year
    __table_args__ = (
        UniqueConstraint("drug_id", "year", name="uq_drug_year"),
        Index("idx_year_stats_year_spending", year, total_spending.desc()),
        Index("idx_year_stats_year_growth", year, yoy_spending_growth.desc()),
        Index("idx_year_stats_drug_year", drug_id, year),
    )

    def __repr__(self):
        return f"<DrugYearStat(drug_id={self.drug_id}, year={self.year}, spending=${self.total_spending:,.0f})>"
