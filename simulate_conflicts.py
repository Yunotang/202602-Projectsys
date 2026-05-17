import requests
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000"

def simulate():
    print("🚀 開始模擬資源衝突專案資料...")
    
    # 1. 建立兩個平行專案
    p1 = requests.post(f"{BASE_URL}/projects", json={"name": "核心處理器升級案", "code": "CPU-V2"}).json()
    p2 = requests.post(f"{BASE_URL}/projects", json={"name": "新感測器整合案", "code": "SNS-V1"}).json()
    
    print(f"✅ 已建立專案: {p1['name']} 與 {p2['name']}")

    # 2. 準備任務資料 (故意讓日期完全重疊)
    start_date = datetime.now().date() + timedelta(days=2)
    
    # 專案 1 的任務
    t1_payload = {
        "project_id": p1['id'],
        "name": "處理器效能模擬",
        "stage": "EVT",
        "start_date": start_date.isoformat(),
        "duration": 10
    }
    t1 = requests.post(f"{BASE_URL}/tasks", json=t1_payload).json()

    # 專案 2 的任務 (日期重疊)
    t2_payload = {
        "project_id": p2['id'],
        "name": "感測器訊號測試",
        "stage": "EVT",
        "start_date": start_date.isoformat(),
        "duration": 10
    }
    t2 = requests.post(f"{BASE_URL}/tasks", json=t2_payload).json()

    # 3. 模擬資源指派 (透過 Excel 導入邏輯的 API 來達成衝突)
    # 這裡我們手動產生一個 Excel 並上傳，因為 Import 接口會自動處理 Resource 建立與指派
    import pandas as pd
    import io

    # 建立一個包含衝突的 WBS Excel
    conflict_data = [
        {"Name": "處理器效能模擬", "Stage": "EVT", "Start Date": start_date.isoformat(), "End Date": (start_date + timedelta(days=10)).isoformat(), "Resource": "張工程師 (EE)"},
        {"Name": "感測器訊號測試", "Stage": "EVT", "Start Date": start_date.isoformat(), "End Date": (start_date + timedelta(days=10)).isoformat(), "Resource": "張工程師 (EE)"}
    ]
    
    df = pd.DataFrame(conflict_data)
    excel_file = io.BytesIO()
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    excel_file.seek(0)

    # 透過 API 導入到專案 1 (這會建立資源並關聯任務)
    files = {'file': ('conflict.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    requests.post(f"{BASE_URL}/import/{p1['id']}", files=files)
    
    # 再導入一次到專案 2，使用同一個資源名稱
    excel_file.seek(0)
    files = {'file': ('conflict.xlsx', excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
    requests.post(f"{BASE_URL}/import/{p2['id']}", files=files)

    print("\n⚠️ 資源衝突模擬完成！")
    print("原因：『張工程師 (EE)』在同一段時間被指派了兩個不同專案的任務。")
    print("請重新整理前端頁面：")
    print("1. 首頁概覽應顯示『1 位工程師超載』。")
    print("2. 資源負載頁面應顯示紅色衝突區塊。")

if __name__ == "__main__":
    simulate()
