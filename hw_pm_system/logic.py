import pandas as pd
from datetime import timedelta
from sqlalchemy.orm import Session
from models import Task, Assignment, Resource

def calculate_schedule_cascade(db: Session, task_id: int):
    """
    遞迴更新下游任務的日期。
    """
    target_task = db.query(Task).get(task_id)
    if not target_task:
        return
    
    # 找出所有依賴於此任務的後續任務
    # 注意：這裡假設 dependencies 欄位存儲的是前置任務的名稱或 ID 字串
    # MVP 簡化版：搜尋 dependencies 包含當前 task_id 的任務
    downstream_tasks = db.query(Task).filter(Task.dependencies.like(f"%{task_id}%")).all()
    
    for child in downstream_tasks:
        # 計算新的開始日期 (前置任務結束日 + 1)
        new_start = target_task.end_date + timedelta(days=1)
        if child.start_date != new_start:
            duration = (child.end_date - child.start_date).days
            child.start_date = new_start
            child.end_date = new_start + timedelta(days=duration)
            db.add(child)
            # 遞迴更新
            calculate_schedule_cascade(db, child.id)
    
    db.commit()

def detect_resource_conflicts(db: Session):
    """
    掃描全系統任務，找出資源衝突。
    回傳一個 DataFrame 供 Heatmap 使用。
    """
    assignments = db.query(Assignment).all()
    data = []
    
    for assign in assignments:
        task = assign.task
        resource = assign.resource
        
        # 將任務期間的每一天展開
        current_date = task.start_date
        while current_date <= task.end_date:
            data.append({
                'Resource': resource.name,
                'Date': current_date,
                'Load': 1.0, # MVP 假設每個任務佔用 100% 負載
                'Project': task.project.name,
                'Task': task.name
            })
            current_date += timedelta(days=1)
            
    if not data:
        return pd.DataFrame(columns=['Resource', 'Date', 'Load'])
        
    df = pd.DataFrame(data)
    # 按資源與日期加總負載
    daily_load = df.groupby(['Resource', 'Date']).agg({
        'Load': 'sum',
        'Project': lambda x: ', '.join(set(x)),
        'Task': lambda x: ', '.join(x)
    }).reset_index()
    
    return daily_load
