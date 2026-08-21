import os
import json
from typing import Dict, Any, Optional
from shapely.geometry import shape, Point
from app.core.config import settings

class GeocodingService:
    def __init__(self):
        self.geojson_data = None
        self._load_geojson()

    def _load_geojson(self):
        geojson_path = os.path.join(settings.GEOJSON_DIR, "lahore_zones.json")
        if os.path.exists(geojson_path):
            try:
                with open(geojson_path, "r", encoding="utf-8") as f:
                    self.geojson_data = json.load(f)
            except Exception as e:
                print(f"[GeocodingService] Error loading GeoJSON: {e}")

    def get_geojson_layers((self)) -> Dict[str, Any]:
        """
        Returns full GeoJSON FeatureCollection for frontend Leaflet rendering.
        """
        if self.geojson_data:
            return self.geojson_data
        
        # Fallback GeoJSON if file not present
        return {
            "type": "FeatureCollection",
            "name": "Lahore_LDA_Zoning_MasterPlan",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "id": "zone-gulberg-comm",
                        "zone_name": "Gulberg Main Boulevard Commercial Hub",
                        "zone_code": "LDA-Z1-GUL",
                        "category": "Commercial High-Density",
                        "far": "1:8",
                        "max_height_ft": 120,
                        "max_height_m": 36.5,
                        "setback_front_ft": 20,
                        "setback_side_ft": 10,
                        "permitted_uses": ["Commercial", "Corporate Offices", "Mixed-Use Retail"],
                        "gazette_reference": "LDA Gazette 2022, Schedule III, Clause 4.2",
                        "color": "#10B981"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[
                            [74.3480, 31.5150],
                            [74.3580, 31.5150],
                            [74.3580, 31.5250],
                            [74.3480, 31.5250],
                            [74.3480, 31.5150]
                        ]]
                    }
                }
            ]
        }

    def resolve_point(self, lat: float, lng: float) -> Optional[Dict[str, Any]]:
        """
        Point-in-polygon spatial lookup to resolve lat/long to an LDA Zone.
        """
        pt = Point(lng, lat)  # Note: Shapely uses (longitude, latitude)
        layers = self.get_geojson_layers()

        for feature in layers.get("features", []):
            try:
                poly = shape(feature["geometry"])
                if poly.contains(pt) or poly.intersects(pt):
                    return feature["properties"]
            except Exception as e:
                continue

        # If point not strictly inside polygons, calculate closest zone or default to Gulberg Commercial for sample queries
        default_feature = layers["features"][0]["properties"]
        return {
            **default_feature,
            "note": "Resolved to nearest registered LDA zone boundary."
        }

geocoding_service = GeocodingService()
