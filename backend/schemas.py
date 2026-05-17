from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class TaskBase(BaseModel):
    name: str
    stage: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    duration: Optional[int] = 0
    dependencies: Optional[str] = ""
    is_milestone: Optional[bool] = False

class TaskCreate(TaskBase):
    project_id: int

class Task(TaskBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    code: str
    pm_name: Optional[str] = None
    target_date: Optional[date] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    tasks: List[Task] = []

    class Config:
        from_attributes = True

class ResourceBase(BaseModel):
    name: str
    type: str
    department: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int

    class Config:
        from_attributes = True

class Conflict(BaseModel):
    resource_id: int
    resource_name: str
    date: date
    total_load: float
    tasks: List[str]
