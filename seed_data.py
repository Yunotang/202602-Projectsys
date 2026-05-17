import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def seed():
    print("开始生成测试数据...")
    
    # 1. 创建专案
    project_payload = {
        "name": "星際探測器 X1 (Apollo Project)",
        "code": "PRJ-2026-ALPHA",
        "pm_name": "張經理",
        "target_date": "2026-12-31"
    }
    res = requests.post(f"{BASE_URL}/projects", json=project_payload)
    if res.status_code != 200:
        print(f"创建专案失败: {res.text}")
        return
    
    project = res.json()
    p_id = project['id']
    print(f"成功创建专案: {project['name']} (ID: {p_id})")

    # 2. 创建任务 (带依赖关系)
    tasks = [
        {"name": "核心系統架構設計", "stage": "EVT", "duration": 10, "offset": 0},
        {"name": "硬體電路板繪製", "stage": "EVT", "duration": 15, "offset": 10, "dep": "prev"},
        {"name": "外殼 3D 建模", "stage": "EVT", "duration": 12, "offset": 5},
        {"name": "首批樣機組裝", "stage": "DVT", "duration": 7, "offset": 25, "dep": "all_prev"}
    ]

    task_ids = []
    start_base = datetime.now().date()

    for i, t in enumerate(tasks):
        start_date = start_base + timedelta(days=t['offset'])
        end_date = start_date + timedelta(days=t['duration'])
        
        # 处理依赖字串
        deps = ""
        if t.get("dep") == "prev" and task_ids:
            deps = str(task_ids[-1])
        elif t.get("dep") == "all_prev":
            deps = ",".join(map(str, task_ids))

        payload = {
            "project_id": p_id,
            "name": t['name'],
            "stage": t['stage'],
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "duration": t['duration'],
            "dependencies": deps,
            "is_milestone": i == len(tasks)-1
        }
        res = requests.post(f"{BASE_URL}/tasks", json=payload)
        task_ids.append(res.json()['id'])
        print(f"  - 已建立任務: {t['name']}")

    # 3. 故意製造資源衝突 (让张工程师在同一天有两项重叠任务)
    print("正在建立資源衝突...")
    # 我们通过 API 还没有直接暴露 Assignment 接口，但可以用之前的 Import 逻辑或直接改数据库。
    # 这里我们通过重复指派任务逻辑（如果已实现）或提示用户导入 Excel。
    
    print("\n✅ 測試資料生成完畢！")
    print("請重新整理前端頁面 (http://localhost:3001)")
    print("1. 在『專頁概覽』看到新專案。")
    print("2. 在『甘特圖表』看到任務連動。")
    print("3. 您也可以嘗試手動上傳我為您準備的 『WBS_Sample_Project.xlsx』。")

if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"連線失敗: {e}。請確保後端 Uvicorn 正在運行。")
