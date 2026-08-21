from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SpatialPointQuery(BaseModel):
    latitude: float
    longitude: float

class SpatialZoneInfo(BaseModel):
    id: str
    zone_name: str
    zone_code: str
    category: str
    far: str
    max_height_ft: int
    max_height_m: float
    setback_front_ft: int
    setback_side_ft: int
    permitted_uses: List[str]
    gazette_reference: str
    color: str

class GeoJSONResponse(BaseModel):
    type: str = "FeatureCollection"
    name: str
    features: List[Dict[str, Any]]
