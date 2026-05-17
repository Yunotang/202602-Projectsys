import os
import uuid
import logging
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import shutil
import pandas as pd

import models, schemas, database, logic, importer
from database import engine, get_db, init_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DB on startup
init_db()

app = FastAPI(title="Precision R&D Management API")

@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# CORS Setup - Restrict origins in production
# For now, let's allow common local dev ports
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Precision R&D Management API"}

@app.get("/debug-routes")
def get_routes():
    return [{"path": route.path, "name": route.name} for route in app.routes]

# --- Projects ---

@app.post("/projects", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating project: {project.name}")
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: int, project_update: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.name = project_update.name
    db_project.code = project_update.code
    db_project.pm_name = project_update.pm_name
    db_project.target_date = project_update.target_date
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}

# --- Tasks ---

@app.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    # Trigger initial schedule calculation
    if db_task.start_date:
        logic.calculate_schedule(db, db_task.id, db_task.start_date)
    return db_task

@app.put("/tasks/{task_id}/schedule")
def update_task_schedule(task_id: int, start_date: str, db: Session = Depends(get_db)):
    from datetime import datetime
    try:
        dt = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    logic.calculate_schedule(db, task_id, dt)
    return {"message": "Schedule updated successfully"}

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted successfully"}

# --- Resources & Conflicts ---

@app.get("/resources", response_model=List[schemas.Resource])
def read_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()

@app.get("/conflicts", response_model=List[schemas.Conflict])
def get_conflicts(db: Session = Depends(get_db)):
    return logic.detect_resource_conflicts(db)

from fastapi.responses import StreamingResponse
import io

# --- Excel Export ---

@app.get("/projects/{project_id}/export")
def export_project_excel(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Prepare data for DataFrame
    tasks_data = []
    for t in project.tasks:
        tasks_data.append({
            "Name": t.name,
            "Stage": t.stage,
            "Start Date": t.start_date,
            "End Date": t.end_date,
            "Duration (Days)": t.duration,
            "Dependencies": t.dependencies,
            "Is Milestone": t.is_milestone
        })
    
    df = pd.DataFrame(tasks_data)
    
    # Save to memory buffer
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='WBS')
    output.seek(0)
    
    headers = {
        'Content-Disposition': f'attachment; filename="Project_{project.code}_WBS.xlsx"'
    }
    return StreamingResponse(output, headers=headers, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

# --- Excel Import ---

@app.post("/import/{project_id}")
async def upload_excel(project_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Fix: Secure filename using UUID to prevent Path Traversal
    file_ext = os.path.splitext(file.filename)[1]
    if file_ext.lower() not in ['.xlsx', '.xls', '.csv']:
         raise HTTPException(status_code=400, detail="Unsupported file format")
         
    temp_filename = f"import_{uuid.uuid4()}{file_ext}"
    temp_path = os.path.join(os.getcwd(), temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        count = importer.process_excel_upload(db, temp_path, project_id)
        return {"message": f"Successfully imported {count} tasks", "project_id": project_id}
    except Exception as e:
        # Fix: Log the error internally and return a generic message
        logger.error(f"Excel import error: {str(e)}")
        raise HTTPException(status_code=400, detail="Failed to process Excel file. Please check the data format.")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Failed to remove temp file: {str(e)}")
