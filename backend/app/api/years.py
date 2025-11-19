"""
API routes for year-related endpoints.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import distinct

from ..database import get_db
from ..models import DrugYearStat
from ..schemas import YearResponse

router = APIRouter(prefix="/years", tags=["years"])


@router.get("", response_model=YearResponse)
def get_available_years(db: Session = Depends(get_db)):
    """
    Get list of all years with available data.

    Returns years in ascending order.
    """
    years = db.query(distinct(DrugYearStat.year)).order_by(DrugYearStat.year).all()
    year_list = [year[0] for year in years]

    return YearResponse(years=year_list)
