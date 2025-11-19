import json

with open('data/raw/cms_partd_2018_2022.json', 'r') as f:
    data = json.load(f)
    print(f'Downloaded {len(data)} records')
    if len(data) > 0:
        print(f'\nFirst drug: {data[0]["Gnrc_Name"]} ({data[0]["Brnd_Name"]})')
        print(f'Sample years available: 2018-2022')
        print(f'Example spending 2022: ${float(data[0]["Tot_Spndng_2022"]):,.2f}')
        print(f'\nLast drug: {data[-1]["Gnrc_Name"]} ({data[-1]["Brnd_Name"]})')
