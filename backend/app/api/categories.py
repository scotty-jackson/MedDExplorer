"""
API routes for drug category/class endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, distinct

from ..database import get_db
from ..models import DrugClass, Drug, DrugYearStat
from ..schemas import DrugClass as DrugClassSchema, CategorySummaryResponse, TopDrugItem

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[DrugClassSchema])
def get_categories(db: Session = Depends(get_db)):
    """
    Get list of all drug categories/classes.
    """
    categories = db.query(DrugClass).order_by(DrugClass.name).all()
    return categories


@router.get("/{category_id}/summary", response_model=CategorySummaryResponse)
def get_category_summary(
    category_id: int,
    year: int = Query(..., description="Year to get summary for"),
    top_drugs_limit: int = Query(10, ge=1, le=50, description="Number of top drugs to include"),
    db: Session = Depends(get_db)
):
    """
    Get aggregated summary for a drug category in a specific year.

    Includes:
    - Total spending for the category
    - Total claims and beneficiaries
    - Number of drugs in the category
    - Top drugs by spending
    - Time series data across all available years
    """
    # Get category
    category = db.query(DrugClass).filter(DrugClass.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Get aggregated stats for the specified year
    year_stats = db.query(
        func.sum(DrugYearStat.total_spending).label('total_spending'),
        func.sum(DrugYearStat.total_claims).label('total_claims'),
        func.sum(DrugYearStat.beneficiaries_count).label('total_beneficiaries'),
        func.count(distinct(DrugYearStat.drug_id)).label('drug_count')
    ).join(
        Drug, DrugYearStat.drug_id == Drug.id
    ).filter(
        Drug.drug_class_id == category_id,
        DrugYearStat.year == year
    ).first()

    if not year_stats or year_stats.total_spending is None:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for category {category.name} in year {year}"
        )

    # Get top drugs in this category for the year
    top_drugs_query = db.query(
        DrugYearStat,
        Drug
    ).join(
        Drug, DrugYearStat.drug_id == Drug.id
    ).filter(
        Drug.drug_class_id == category_id,
        DrugYearStat.year == year
    ).order_by(
        desc(DrugYearStat.total_spending)
    ).limit(top_drugs_limit)

    top_drugs = [
        TopDrugItem(
            drug_id=drug.id,
            generic_name=drug.generic_name,
            brand_name=drug.brand_name,
            slug=drug.slug,
            drug_class_name=category.name,
            metric_value=stat.total_spending,
            year=year
        )
        for stat, drug in top_drugs_query.all()
    ]

    # Get time series data (aggregated by year)
    time_series_query = db.query(
        DrugYearStat.year,
        func.sum(DrugYearStat.total_spending).label('total_spending'),
        func.sum(DrugYearStat.total_claims).label('total_claims'),
        func.sum(DrugYearStat.beneficiaries_count).label('total_beneficiaries')
    ).join(
        Drug, DrugYearStat.drug_id == Drug.id
    ).filter(
        Drug.drug_class_id == category_id
    ).group_by(
        DrugYearStat.year
    ).order_by(
        DrugYearStat.year
    ).all()

    time_series = [
        {
            'year': row.year,
            'total_spending': float(row.total_spending) if row.total_spending else 0,
            'total_claims': int(row.total_claims) if row.total_claims else 0,
            'total_beneficiaries': int(row.total_beneficiaries) if row.total_beneficiaries else None
        }
        for row in time_series_query
    ]

    return CategorySummaryResponse(
        category_id=category.id,
        category_name=category.name,
        year=year,
        total_spending=float(year_stats.total_spending),
        total_claims=int(year_stats.total_claims),
        total_beneficiaries=int(year_stats.total_beneficiaries) if year_stats.total_beneficiaries else None,
        drug_count=int(year_stats.drug_count),
        top_drugs=top_drugs,
        time_series=time_series
    )
