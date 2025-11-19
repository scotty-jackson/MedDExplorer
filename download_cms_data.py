#!/usr/bin/env python3
"""
Download full Medicare Part D dataset from CMS API
"""
import json
import urllib.request
import time

API_URL = "https://data.cms.gov/data-api/v1/dataset/87604795-a3e2-4190-9b3a-e39142221fcd/data"
PAGE_SIZE = 5000

all_records = []
offset = 0
page = 1

print("Downloading Medicare Part D data from CMS API...")

while True:
    url = f"{API_URL}?size={PAGE_SIZE}&offset={offset}"
    print(f"  Fetching page {page} (offset {offset})...", end=" ", flush=True)

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read())

        if not data or len(data) == 0:
            print("(no more data)")
            break

        all_records.extend(data)
        print(f"({len(data)} records, total: {len(all_records)})")

        if len(data) < PAGE_SIZE:
            # Last page
            break

        offset += PAGE_SIZE
        page += 1
        time.sleep(0.5)  # Be nice to the API

    except Exception as e:
        print(f"\nError: {e}")
        break

print(f"\nTotal records downloaded: {len(all_records)}")

# Save to JSON file
output_file = "data/raw/cms_partd_full.json"
with open(output_file, 'w') as f:
    json.dump(all_records, f)

print(f"Saved to {output_file}")
print(f"File size: {len(json.dumps(all_records)) / 1024 / 1024:.1f} MB")
