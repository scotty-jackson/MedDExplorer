"""
API routes for drug-related endpoints.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func

from ..database import get_db
from ..models import Drug, DrugYearStat, DrugClass
from ..schemas import (
    DrugSearchResponse,
    DrugSummary,
    TopDrugsResponse,
    TopDrugItem,
    DrugTimeSeriesResponse,
    TimeSeriesDataPoint
)

router = APIRouter(prefix="/drugs", tags=["drugs"])


@router.get("/search", response_model=DrugSearchResponse)
def search_drugs(
    q: str = Query(..., description="Search query for drug name"),
    limit: int = Query(20, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: Session = Depends(get_db)
):
    """
    Search for drugs by generic or brand name.

    Returns drugs matching the search query with pagination.
    """
    # Base query
    query = db.query(Drug).outerjoin(DrugClass)

    # Apply search filter (case-insensitive partial match)
    search_filter = or_(
        Drug.generic_name.ilike(f"%{q}%"),
        Drug.brand_name.ilike(f"%{q}%")
    )
    query = query.filter(search_filter)

    # Get total count
    total = query.count()

    # Apply pagination and ordering
    drugs = query.order_by(Drug.generic_name).offset(offset).limit(limit).all()

    # Convert to response format
    drug_summaries = [
        DrugSummary(
            id=drug.id,
            generic_name=drug.generic_name,
            brand_name=drug.brand_name,
            slug=drug.slug,
            drug_class_name=drug.drug_class.name if drug.drug_class else None
        )
        for drug in drugs
    ]

    return DrugSearchResponse(
        drugs=drug_summaries,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/top", response_model=TopDrugsResponse)
def get_top_drugs(
    year: int = Query(..., description="Year to get top drugs for"),
    metric: str = Query(
        "total_spending",
        description="Metric to rank by (total_spending, spending_per_beneficiary, yoy_spending_growth)"
    ),
    limit: int = Query(10, ge=1, le=100, description="Number of drugs to return"),
    db: Session = Depends(get_db)
):
    """
    Get top N drugs for a given year and metric.

    Metrics available:
    - total_spending: Total gross drug cost
    - spending_per_beneficiary: Cost per beneficiary
    - yoy_spending_growth: Year-over-year spending growth percentage
    - total_claims: Total number of claims
    """
    # Validate metric
    valid_metrics = [
        'total_spending',
        'spending_per_beneficiary',
        'yoy_spending_growth',
        'total_claims',
        'spending_per_claim'
    ]
    if metric not in valid_metrics:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid metric. Must be one of: {', '.join(valid_metrics)}"
        )

    # Build query
    query = db.query(
        DrugYearStat,
        Drug,
        DrugClass
    ).join(
        Drug, DrugYearStat.drug_id == Drug.id
    ).outerjoin(
        DrugClass, Drug.drug_class_id == DrugClass.id
    ).filter(
        DrugYearStat.year == year
    )

    # Order by metric (descending)
    metric_column = getattr(DrugYearStat, metric)

    # Filter out nulls for the metric
    query = query.filter(metric_column.isnot(None))

    # Order and limit
    query = query.order_by(desc(metric_column)).limit(limit)

    results = query.all()

    # Convert to response format
    top_drugs = [
        TopDrugItem(
            drug_id=drug.id,
            generic_name=drug.generic_name,
            brand_name=drug.brand_name,
            slug=drug.slug,
            drug_class_name=drug_class.name if drug_class else None,
            metric_value=getattr(stat, metric),
            year=year
        )
        for stat, drug, drug_class in results
    ]

    return TopDrugsResponse(
        drugs=top_drugs,
        year=year,
        metric=metric,
        limit=limit
    )


@router.get("/{drug_id}/timeseries", response_model=DrugTimeSeriesResponse)
def get_drug_timeseries(
    drug_id: int,
    db: Session = Depends(get_db)
):
    """
    Get time series data for a specific drug across all available years.

    Returns annual statistics including spending, claims, beneficiaries,
    and year-over-year growth metrics.
    """
    # Get drug
    drug = db.query(Drug).filter(Drug.id == drug_id).first()
    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    # Get all year stats for this drug, ordered by year
    stats = db.query(DrugYearStat).filter(
        DrugYearStat.drug_id == drug_id
    ).order_by(DrugYearStat.year).all()

    if not stats:
        raise HTTPException(
            status_code=404,
            detail="No statistics found for this drug"
        )

    # Get drug class name
    drug_class_name = None
    if drug.drug_class:
        drug_class_name = drug.drug_class.name

    # Convert to response format
    time_series_data = [
        TimeSeriesDataPoint(
            year=stat.year,
            total_spending=stat.total_spending,
            total_claims=stat.total_claims,
            beneficiaries_count=stat.beneficiaries_count,
            spending_per_claim=stat.spending_per_claim,
            spending_per_beneficiary=stat.spending_per_beneficiary,
            yoy_spending_growth=stat.yoy_spending_growth,
            yoy_beneficiary_growth=stat.yoy_beneficiary_growth,
            yoy_claims_growth=stat.yoy_claims_growth
        )
        for stat in stats
    ]

    drug_summary = DrugSummary(
        id=drug.id,
        generic_name=drug.generic_name,
        brand_name=drug.brand_name,
        slug=drug.slug,
        drug_class_name=drug_class_name
    )

    return DrugTimeSeriesResponse(
        drug=drug_summary,
        data=time_series_data
    )


@router.get("/{drug_id}", response_model=DrugSummary)
def get_drug(
    drug_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific drug.
    """
    drug = db.query(Drug).outerjoin(DrugClass).filter(Drug.id == drug_id).first()

    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    return DrugSummary(
        id=drug.id,
        generic_name=drug.generic_name,
        brand_name=drug.brand_name,
        slug=drug.slug,
        drug_class_name=drug.drug_class.name if drug.drug_class else None
    )


@router.get("/slug/{slug}", response_model=DrugSummary)
def get_drug_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """
    Get drug information by URL slug.
    """
    drug = db.query(Drug).outerjoin(DrugClass).filter(Drug.slug == slug).first()

    if not drug:
        raise HTTPException(status_code=404, detail="Drug not found")

    return DrugSummary(
        id=drug.id,
        generic_name=drug.generic_name,
        brand_name=drug.brand_name,
        slug=drug.slug,
        drug_class_name=drug.drug_class.name if drug.drug_class else None
    )
