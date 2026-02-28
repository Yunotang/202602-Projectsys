from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    pm_name = Column(String)
    target_date = Column(Date)
    
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = 'tasks'
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    name = Column(String, nullable=False)
    stage = Column(String) # EVT/DVT/PVT/MP
    start_date = Column(Date)
    end_date = Column(Date)
    duration = Column(Integer)
    dependencies = Column(String) # Comma-separated Task IDs
    is_milestone = Column(Boolean, default=False)
    
    project = relationship("Project", back_populates="tasks")
    assignments = relationship("Assignment", back_populates="task", cascade="all, delete-orphan")

class Resource(Base):
    __tablename__ = 'resources'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String) # Human / Equipment
    department = Column(String)
    
    assignments = relationship("Assignment", back_populates="resource")

class Assignment(Base):
    __tablename__ = 'assignments'
    
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey('tasks.id'), nullable=False)
    resource_id = Column(Integer, ForeignKey('resources.id'), nullable=False)
    
    task = relationship("Task", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")
