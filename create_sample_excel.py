import pandas as pd
from datetime import datetime, timedelta

# Create sample data for hardware development (Stage-Gate)
data = [
    {
        "Name": "PCB Schematic Design",
        "Stage": "EVT",
        "Start Date": "2026-06-01",
        "End Date": "2026-06-15",
        "Dependencies": "",
        "Resource": "张工程师 (EE)",
        "Is Milestone": False
    },
    {
        "Name": "Component Procurement",
        "Stage": "EVT",
        "Start Date": "2026-06-10",
        "End Date": "2026-06-25",
        "Dependencies": "",
        "Resource": "采购部",
        "Is Milestone": False
    },
    {
        "Name": "PCB Layout & Routing",
        "Stage": "EVT",
        "Start Date": "2026-06-16",
        "End Date": "2026-06-30",
        "Dependencies": "1", # Assuming first task ID will be 1
        "Resource": "张工程师 (EE)",
        "Is Milestone": False
    },
    {
        "Name": "Mechanical Housing Prototype",
        "Stage": "EVT",
        "Start Date": "2026-06-05",
        "End Date": "2026-06-20",
        "Dependencies": "",
        "Resource": "林工程師 (ME)",
        "Is Milestone": False
    },
    {
        "Name": "EVT Sample Assembly",
        "Stage": "EVT",
        "Start Date": "2026-07-01",
        "End Date": "2026-07-10",
        "Dependencies": "3,4",
        "Resource": "林工程師 (ME)",
        "Is Milestone": True
    }
]

df = pd.DataFrame(data)
df.to_excel("WBS_Sample_Project.xlsx", index=False)
print("WBS_Sample_Project.xlsx created successfully.")
