import pandas as pd

data = {
    'Name': ['Board Design', 'Component Sourcing', 'PCB Fabrication', 'Board Bring-up', 'EMI Testing'],
    'Stage': ['EVT', 'EVT', 'EVT', 'EVT', 'DVT'],
    'StartDate': ['2023-11-01', '2023-11-01', '2023-11-15', '2023-12-01', '2023-12-05'],
    'EndDate': ['2023-11-14', '2023-11-10', '2023-11-30', '2023-12-10', '2023-12-15'],
    'Dependencies': ['', '', 'Board Design', 'PCB Fabrication', 'Board Bring-up'],
    'Resources': ['EE Engineer A', 'Purchasing', 'Vendor X', 'EE Engineer A', 'EE Engineer A'],
    'IsMilestone': [False, False, False, False, True]
}

df = pd.DataFrame(data)
df.to_excel('sample_wbs.xlsx', index=False)
print("sample_wbs.xlsx created.")
