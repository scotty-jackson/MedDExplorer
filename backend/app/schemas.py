"""
Pydantic schemas for API request/response validation and serialization.
"""
from typing import Optional, List
from pydantic import BaseModel, Field


# ===========================
# DrugClass Schemas
# ===========================

class DrugClassBase(BaseModel):
    name: str
    description: Optional[str] = None


class DrugClassCreate(DrugClassBase):
    pass


class DrugClass(DrugClassBase):
    id: int

    class Config:
        from_attributes = True


# ===========================
# Drug Schemas
# ===========================

class DrugBase(BaseModel):
    generic_name: str
    brand_name: Optional[str] = None
    ndc: Optional[str] = None
    hcpcs_code: Optional[str] = None
    drug_class_id: Optional[int] = None
    slug: Optional[str] = None


class DrugCreate(DrugBase):
    pass


class Drug(DrugBase):
    id: int
    drug_class: Optional[DrugClass] = None

    class Config:
        from_attributes = True


class DrugSummary(BaseModel):
    """Lightweight drug representation for search results and lists."""
    id: int
    generic_name: str
    brand_name: Optional[str] = None
    slug: Optional[str] = None
    drug_class_name: Optional[str] = None

    class Config:
        from_attributes = True


# ===========================
# DrugYearStat Schemas
# ===========================

class DrugYearStatBase(BaseModel):
    drug_id: int
    year: int
    total_spending: float
    total_claims: int
    beneficiaries_count: Optional[int] = None
    spending_per_claim: Optional[float] = None
    spending_per_beneficiary: Optional[float] = None
    yoy_spending_growth: Optional[float] = None
    yoy_beneficiary_growth: Optional[float] = None
    yoy_claims_growth: Optional[float] = None
    avg_cost_per_unit: Optional[float] = None
    total_dosage_units: Optional[float] = None


class DrugYearStatCreate(DrugYearStatBase):
    pass


class DrugYearStat(DrugYearStatBase):
    id: int

    class Config:
        from_attributes = True


class DrugYearStatWithDrug(DrugYearStat):
    """Year stat with drug information included."""
    drug: DrugSummary

    class Config:
        from_attributes = True


# ===========================
# API Response Schemas
# ===========================

class YearResponse(BaseModel):
    """Response for available years endpoint."""
    years: List[int] = Field(description="List of years with data available")


class DrugSearchResponse(BaseModel):
    """Response for drug search endpoint."""
    drugs: List[DrugSummary]
    total: int
    limit: int
    offset: int


class TopDrugItem(BaseModel):
    """Individual item in top drugs list."""
    drug_id: int
    generic_name: str
    brand_name: Optional[str] = None
    slug: Optional[str] = None
    drug_class_name: Optional[str] = None
    metric_value: float = Field(description="Value of the metric being ranked by")
    year: int


class TopDrugsResponse(BaseModel):
    """Response for top drugs endpoint."""
    drugs: List[TopDrugItem]
    year: int
    metric: str
    limit: int


class TimeSeriesDataPoint(BaseModel):
    """Single data point in time series."""
    year: int
    total_spending: float
    total_claims: int
    beneficiaries_count: Optional[int] = None
    spending_per_claim: Optional[float] = None
    spending_per_beneficiary: Optional[float] = None
    yoy_spending_growth: Optional[float] = None
    yoy_beneficiary_growth: Optional[float] = None
    yoy_claims_growth: Optional[float] = None


class DrugTimeSeriesResponse(BaseModel):
    """Response for drug time series endpoint."""
    drug: DrugSummary
    data: List[TimeSeriesDataPoint]


class CategorySummaryResponse(BaseModel):
    """Response for category summary endpoint."""
    category_id: int
    category_name: str
    year: int
    total_spending: float
    total_claims: int
    total_beneficiaries: Optional[int] = None
    drug_count: int
    top_drugs: List[TopDrugItem]
    time_series: List[dict]  # year -> aggregated metrics
