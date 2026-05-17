import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from models import Project, Task, Resource, Assignment

def process_excel_upload(file, db: Session, project_info: dict):
    # 讀取 Excel
    df = pd.read_excel(file)
    
    # 建立專案
    new_project = Project(
        name=project_info['name'],
        code=project_info['code'],
        pm_name=project_info.get('pm_name'),
        target_date=project_info.get('target_date')
    )
    db.add(new_project)
    db.flush() # 取得 project.id
    
    # 任務資料清洗與匯入
    # 假設 Excel 欄位: Name, Stage, StartDate, EndDate, Dependencies, Resources
    tasks_created = {}
    
    for index, row in df.iterrows():
        # 日期處理
        start_date = pd.to_datetime(row['StartDate']).date() if pd.notnull(row['StartDate']) else None
        end_date = pd.to_datetime(row['EndDate']).date() if pd.notnull(row['EndDate']) else None
        
        task = Task(
            project_id=new_project.id,
            name=row['Name'],
            stage=row.get('Stage'),
            start_date=start_date,
            end_date=end_date,
            dependencies=str(row.get('Dependencies', '')),
            is_milestone=bool(row.get('IsMilestone', False))
        )
        db.add(task)
        db.flush()
        tasks_created[index] = task.id
        
        # 資源指派 (簡單處理：假設資源名稱以逗號分隔)
        resource_names = str(row.get('Resources', '')).split(',')
        for r_name in resource_names:
            r_name = r_name.strip()
            if not r_name: continue
            
            # 查找或建立資源
            resource = db.query(Resource).filter(Resource.name == r_name).first()
            if not resource:
                resource = Resource(name=r_name, type='Unknown')
                db.add(resource)
                db.flush()
            
            assignment = Assignment(task_id=task.id, resource_id=resource.id)
            db.add(assignment)

    db.commit()
    return new_project.id

def validate_excel_columns(file):
    required_columns = ['Name', 'StartDate', 'EndDate']
    try:
        df = pd.read_excel(file, nrows=0)
        missing = [col for col in required_columns if col not in df.columns]
        return missing == [], missing
    except Exception:
        return False, ["Invalid File"]
