from fastapi import APIRouter
from app.schemas.spatial import SpatialPointQuery, GeoJSONResponse, SpatialZoneInfo
from app.services.geocoding import geocoding_service

router = APIRouter()

@router.get("/geojson")
async def get_lahore_geojson():
    return geocoding_service.get_geojson_layers()

@router.post("/resolve-point", response_model=SpatialZoneInfo)
async def resolve_spatial_point(query: SpatialPointQuery):
    zone_data = geocoding_service.resolve_point(query.latitude, query.longitude)
    return SpatialZoneInfo(**zone_data)
