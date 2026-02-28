import streamlit as st
import pandas as pd
from database import init_db, SessionLocal
from models import Project, Task, Resource
from importer import process_excel_upload, validate_excel_columns
from logic import detect_resource_conflicts
import plotly.express as px
import plotly.figure_factory as ff

# 初始化資料庫
init_db()

st.set_page_config(page_title="硬體研發專案管理系統", layout="wide")

def main():
    st.sidebar.title("🧭 導覽選單")
    menu = st.sidebar.radio("前往頁面", ["📊 儀表板總覽", "📅 專案甘特圖", "📥 Excel 匯入", "🔥 資源負載地圖", "👥 資源管理"])
    
    db = SessionLocal()
    
    if menu == "📊 儀表板總覽":
        render_dashboard(db)
    elif menu == "📅 專案甘特圖":
        render_gantt_page(db)
    elif menu == "📥 Excel 匯入":
        render_import_page(db)
    elif menu == "🔥 資源負載地圖":
        render_resource_heatmap(db)
    elif menu == "👥 資源管理":
        render_resource_mgmt(db)
        
    db.close()

def render_dashboard(db):
    st.title("📊 研發專案儀表板")
    projects = db.query(Project).all()
    
    if not projects:
        st.info("目前尚無專案，請先前往 'Excel 匯入' 建立專案。")
        return
    
    col1, col2, col3 = st.columns(3)
    col1.metric("進行中專案", len(projects))
    col2.metric("資源總數", db.query(Resource).count())
    
    st.subheader("專案清單")
    project_data = []
    for p in projects:
        project_data.append({
            "專案編號": p.code,
            "專案名稱": p.name,
            "負責 PM": p.pm_name,
            "目標上市日期": p.target_date,
            "任務數量": len(p.tasks)
        })
    st.table(pd.DataFrame(project_data))

def render_gantt_page(db):
    st.title("📅 專案甘特圖")
    projects = db.query(Project).all()
    if not projects:
        st.warning("請先匯入專案資料。")
        return
        
    project_names = {p.name: p.id for p in projects}
    selected_p_name = st.selectbox("選擇專案", list(project_names.keys()))
    p_id = project_names[selected_p_name]
    
    tasks = db.query(Task).filter(Task.project_id == p_id).all()
    if not tasks:
        st.write("該專案尚無任務。")
        return
        
    df_gantt = []
    for t in tasks:
        df_gantt.append(dict(Task=t.name, Start=t.start_date, Finish=t.end_date, Resource=t.stage))
    
    fig = px.timeline(df_gantt, x_start="Start", x_end="Finish", y="Task", color="Resource", title=f"{selected_p_name} 時程規劃")
    fig.update_yaxes(autorange="reversed")
    st.plotly_chart(fig, width='stretch')

def render_import_page(db):
    st.title("📥 Excel 智慧匯入")
    st.markdown("""
    請上傳包含 `Name`, `StartDate`, `EndDate`, `Stage`, `Dependencies`, `Resources` 欄位的 Excel 檔案。
    """)
    
    with st.form("import_form"):
        p_name = st.text_input("專案名稱")
        p_code = st.text_input("專案編號")
        pm_name = st.text_input("負責 PM")
        target_date = st.date_input("目標上市日期")
        
        uploaded_file = st.file_uploader("選擇 Excel 檔案", type=["xlsx"])
        submit = st.form_submit_button("執行匯入")
        
        if submit:
            if not p_name or not p_code or not uploaded_file:
                st.error("請填寫完整資訊並上傳檔案。")
            else:
                is_valid, msg = validate_excel_columns(uploaded_file)
                if not is_valid:
                    st.error(f"Excel 格式錯誤: 缺少欄位 {msg}")
                else:
                    p_info = {'name': p_name, 'code': p_code, 'pm_name': pm_name, 'target_date': target_date}
                    new_id = process_excel_upload(uploaded_file, db, p_info)
                    st.success(f"專案匯入成功！ID: {new_id}")

def render_resource_heatmap(db):
    st.title("🔥 資源負載地圖")
    df_conflict = detect_resource_conflicts(db)
    
    if df_conflict.empty:
        st.success("目前無資源衝突。")
        return
    
    # 使用 Plotly 繪製 Heatmap
    fig = px.density_heatmap(
        df_conflict, 
        x="Date", 
        y="Resource", 
        z="Load",
        color_continuous_scale="Reds",
        title="資源每日負載狀況 (>1.0 表示衝突)",
        hover_data=["Project", "Task"]
    )
    st.plotly_chart(fig, width='stretch')
    
    # 列出衝突清單
    conflicts = df_conflict[df_conflict['Load'] > 1.0]
    if not conflicts.empty:
        st.error("⚠️ 偵測到資源過載衝突！")
        st.dataframe(conflicts)

def render_resource_mgmt(db):
    st.title("👥 資源管理")
    resources = db.query(Resource).all()
    res_data = [{"ID": r.id, "名稱": r.name, "類型": r.type, "部門": r.department} for r in resources]
    st.dataframe(pd.DataFrame(res_data))

if __name__ == "__main__":
    main()
