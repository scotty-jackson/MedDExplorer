#!/usr/bin/env python3
"""
Convert CMS Medicare Part D JSON data (wide format) to CSV (long format)
"""
import json
import csv

# Read the JSON data
print("Loading CMS data...")
with open('data/raw/cms_partd_full.json', 'r') as f:
    data = json.load(f)

print(f"Loaded {len(data)} drug records")

# Convert wide format to long format
# Each drug has data for years 2018-2022, so we'll create one row per drug-year
rows = []

for record in data:
    # Only process "Overall" manufacturer records to avoid duplicates
    # CMS data has separate rows for each manufacturer plus an aggregate
    mftr_name = record.get('Mftr_Name', '')
    if mftr_name != 'Overall':
        continue

    generic_name = record.get('Gnrc_Name', '')
    brand_name = record.get('Brnd_Name', '')

    # Process each year (2018-2022)
    for year in range(2018, 2023):
        year_str = str(year)

        # Get the spending, claims, and beneficiaries for this year
        total_spending = record.get(f'Tot_Spndng_{year_str}', '')
        total_claims = record.get(f'Tot_Clms_{year_str}', '')
        total_benes = record.get(f'Tot_Benes_{year_str}', '')

        # Skip if no data for this year
        if not total_spending or total_spending == '':
            continue

        # Create a row for this drug-year combination
        row = {
            'generic_name': generic_name,
            'brand_name': brand_name,
            'year': year,
            'total_spending': total_spending,
            'total_claims': total_claims,
            'beneficiaries_count': total_benes if total_benes else ''
        }

        rows.append(row)

print(f"Created {len(rows)} drug-year records")

# Write to CSV
output_file = 'data/raw/medicare_partd_2018_2022.csv'
print(f"Writing to {output_file}...")

with open(output_file, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['generic_name', 'brand_name', 'year', 'total_spending', 'total_claims', 'beneficiaries_count'])
    writer.writeheader()
    writer.writerows(rows)

print(f"Done! Created CSV with {len(rows)} rows")
print(f"\nSample data:")
print(f"  Years: 2018-2022")
print(f"  Unique drugs: {len(data)}")
print(f"  Drug-year combinations: {len(rows)}")
