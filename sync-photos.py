import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, 'assets')
data_file = os.path.join(base_dir, 'photos-data.js')

trips = [
    "common", "boulder-1", "estes-park", "garden", "ny", 
    "boulder-2", "vail", "aspen", "mumbai"
]

photos = {}

for trip in trips:
    trip_path = os.path.join(assets_dir, trip)
    if os.path.exists(trip_path):
        files = [f for f in os.listdir(trip_path) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif'))]
        photos[trip] = [f"assets/{trip}/{f}" for f in files]
    else:
        photos[trip] = []

content = f"""// This file is auto-generated. Do not edit manually.
var tripPhotos = {json.dumps(photos, indent=4)};

if (typeof module !== 'undefined' && module.exports) {{
    module.exports = tripPhotos;
}}
"""

with open(data_file, 'w') as f:
    f.write(content)

print("Photos sync complete! Manifest updated via Python.")
