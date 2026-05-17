import pandas as pd
from sqlalchemy.orm import Session
from models import Project, Task, Resource, Assignment
from datetime import datetime

def process_excel_upload(db: Session, file_path: str, project_id: int):
    """
    Parses Excel and populates tasks for a specific project.
    Expected columns: Name, Stage, Start Date, End Date, Dependencies, Resource
    """
    try:
        df = pd.read_excel(file_path)
        
        # Validation: check for necessary columns
        required_cols = ["Name", "Stage", "Start Date", "End Date"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        tasks_created = []
        for _, row in df.iterrows():
            # Create Task
            new_task = Task(
                project_id=project_id,
                name=row["Name"],
                stage=row["Stage"],
                start_date=pd.to_datetime(row["Start Date"]).date(),
                end_date=pd.to_datetime(row["End Date"]).date(),
                duration=(pd.to_datetime(row["End Date"]) - pd.to_datetime(row["Start Date"])).days,
                dependencies=str(row.get("Dependencies", "")),
                is_milestone=bool(row.get("Is Milestone", False))
            )
            db.add(new_task)
            db.flush() # Get ID
            
            # Handle Resource Assignment if column exists
            if "Resource" in df.columns and pd.notna(row["Resource"]):
                res_name = str(row["Resource"])
                # Find or Create Resource
                resource = db.query(Resource).filter(Resource.name == res_name).first()
                if not resource:
                    resource = Resource(name=res_name, type="Human")
                    db.add(resource)
                    db.flush()
                
                # Create Assignment
                assignment = Assignment(task_id=new_task.id, resource_id=resource.id)
                db.add(assignment)
            
            tasks_created.append(new_task)
            
        db.commit()
        return len(tasks_created)
    except Exception as e:
        db.rollback()
        raise e
