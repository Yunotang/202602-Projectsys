from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Many-to-Many relationship table for Task and Resource (via Assignments)
# Although SDD defines 'assignments' as a table, we can model it explicitly if needed
# or use a table object for simple mapping. Here we'll model it as a class for flexibility.

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, index=True, nullable=False)
    pm_name = Column(String)
    target_date = Column(Date)

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String, nullable=False)
    stage = Column(String)  # EVT/DVT/PVT/MP
    start_date = Column(Date)
    end_date = Column(Date)
    duration = Column(Integer)
    dependencies = Column(String)  # Comma-separated IDs
    is_milestone = Column(Boolean, default=False)

    project = relationship("Project", back_populates="tasks")
    assignments = relationship("Assignment", back_populates="task", cascade="all, delete-orphan")

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String)  # Human / Equipment
    department = Column(String)

    assignments = relationship("Assignment", back_populates="resource", cascade="all, delete-orphan")

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    resource_id = Column(Integer, ForeignKey("resources.id"))

    task = relationship("Task", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")
