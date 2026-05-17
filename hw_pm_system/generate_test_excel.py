import pandas as pd

# 建立更真實的硬體開發任務清單
data = {
    'Name': [
        'Architecture Review', 'Schematic Design', 'PCB Layout', 'Long Lead Component PO', 
        'PCB Fabrication', 'SMT Assembly', 'EVT Bring-up', 'EVT Power Test', 
        'EVT Thermal Test', 'EVT Exit Review',
        'DVT Design Fix', 'DVT PCB Layout', 'DVT SMT', 'DVT Functional Test', 
        'EMI Pre-test', 'DVT Exit Review',
        'PVT Tooling Setup', 'PVT Pilot Run', 'PVT Reliability Test', 'MP Start'
    ],
    'Stage': [
        'EVT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT', 'EVT',
        'DVT', 'DVT', 'DVT', 'DVT', 'DVT', 'DVT',
        'PVT', 'PVT', 'PVT', 'MP'
    ],
    'StartDate': [
        '2024-03-01', '2024-03-05', '2024-03-20', '2024-03-01', '2024-04-10', 
        '2024-04-20', '2024-05-01', '2024-05-05', '2024-05-05', '2024-05-20',
        '2024-06-01', '2024-06-10', '2024-07-01', '2024-07-10', '2024-07-10', 
        '2024-07-30', '2024-08-01', '2024-08-15', '2024-08-20', '2024-09-01'
    ],
    'EndDate': [
        '2024-03-04', '2024-03-19', '2024-04-09', '2024-04-15', '2024-04-19', 
        '2024-04-25', '2024-05-04', '2024-05-15', '2024-05-15', '2024-05-20',
        '2024-06-09', '2024-06-30', '2024-07-09', '2024-07-25', '2024-07-25', 
        '2024-07-30', '2024-08-14', '2024-08-19', '2024-08-30', '2024-09-01'
    ],
    'Dependencies': [
        '', 'Architecture Review', 'Schematic Design', '', 'PCB Layout', 
        'PCB Fabrication', 'SMT Assembly', 'EVT Bring-up', 'EVT Bring-up', 'EVT Power Test',
        'EVT Exit Review', 'DVT Design Fix', 'DVT PCB Layout', 'DVT SMT', 'DVT SMT', 
        'DVT Functional Test', 'DVT Exit Review', 'PVT Tooling Setup', 'PVT Pilot Run', 'PVT Reliability Test'
    ],
    'Resources': [
        'EE Manager', 'EE Engineer A', 'Layout Team', 'Purchasing', 'Vendor X', 
        'Factory A', 'EE Engineer A', 'EE Engineer A', 'ME Engineer B', 'PM',
        'EE Engineer A', 'Layout Team', 'Factory A', 'EE Engineer A', 'EMI Lab', 'PM',
        'Tooling Dept', 'Factory A', 'QA Team', 'PM'
    ],
    'IsMilestone': [
        False, False, False, False, False, False, False, False, False, True,
        False, False, False, False, False, True, False, False, False, True
    ]
}

df = pd.DataFrame(data)
file_path = 'Hardware_Project_Template.xlsx'
df.to_excel(file_path, index=False)
print(f"'{file_path}' has been generated successfully.")
