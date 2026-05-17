from datetime import timedelta, date
from sqlalchemy.orm import Session
from models import Task, Assignment, Resource
import pandas as pd

def calculate_schedule(db: Session, task_id: int, new_start_date: date):
    """
    Recursively updates task dates based on dependencies (Finish-to-Start).
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return

    # 1. Update current task
    old_start = task.start_date
    task.start_date = new_start_date
    task.end_date = new_start_date + timedelta(days=task.duration)
    db.add(task)
    db.commit()

    # 2. Find downstream tasks (those that depend on this task)
    # Note: SDD says dependencies are comma-separated IDs in the task itself.
    # So we need to find tasks where this task_id is in their dependencies list.
    downstream_tasks = db.query(Task).filter(Task.project_id == task.project_id).all()
    
    for dt in downstream_tasks:
        if not dt.dependencies:
            continue
            
        dep_ids = [int(x.strip()) for x in dt.dependencies.split(",") if x.strip().isdigit()]
        if task_id in dep_ids:
            # This task (dt) depends on the updated task
            # The earliest dt can start is the end_date of the parent task
            if dt.start_date < task.end_date:
                calculate_schedule(db, dt.id, task.end_date)

def detect_resource_conflicts(db: Session):
    """
    Scans all assignments and detects daily overload (> 1.0).
    """
    assignments = db.query(Assignment).all()
    if not assignments:
        return []

    data = []
    for assign in assignments:
        task = assign.task
        res = assign.resource
        if not task.start_date or not task.end_date:
            continue
            
        # Expand task into daily records
        curr = task.start_date
        while curr < task.end_date:
            data.append({
                "resource_id": res.id,
                "resource_name": res.name,
                "date": curr,
                "task_id": task.id,
                "task_name": task.name,
                "load": 1.0  # Default 100% load per assignment
            })
            curr += timedelta(days=1)

    if not data:
        return []

    df = pd.DataFrame(data)
    # Group by resource and date, sum the load
    daily_load = df.groupby(["resource_id", "resource_name", "date"])["load"].sum().reset_index()
    
    # Filter conflicts (load > 1.0)
    conflicts = daily_load[daily_load["load"] > 1.0]
    
    result = []
    for _, row in conflicts.iterrows():
        # Get tasks contributing to this conflict
        conflict_tasks = df[(df["resource_id"] == row["resource_id"]) & (df["date"] == row["date"])]["task_name"].tolist()
        result.append({
            "resource_id": row["resource_id"],
            "resource_name": row["resource_name"],
            "date": row["date"],
            "total_load": row["load"],
            "tasks": conflict_tasks
        })
        
    return result
