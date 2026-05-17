# 專案實作 TODO 清單 (2026-05-17)

## 1. 後端開發 (FastAPI + SQLite)
- [x] 初始化後端目錄與虛擬環境 (CMD 相容) @backend
- [x] 定義資料庫模型 (models.py) - 根據 SDD 4.2 @backend
- [x] 實作資料庫連線與初始化 (database.py) @backend
- [x] 實作核心業務邏輯 (logic.py) - 時程計算、資源衝突偵測 @backend
- [x] 實作 Excel 導入邏輯 (importer.py) @backend
- [x] 建立 FastAPI 主程式與 API 路由 (main.py) @backend
    - [x] 專案 (Projects) CRUD
    - [x] 任務 (Tasks) CRUD
    - [x] 資源與分配 (Resources/Assignments) CRUD
    - [x] Excel 導入 API
    - [x] 資源衝突分析 API

## 2. 前端整合 (React + Vite)
- [x] 建立 API 服務層 (src/api/index.ts) @frontend
- [x] 重構 App.tsx 移除 Mock Data 並對接 API @frontend
    - [x] 概覽頁面數據對接
    - [x] 甘特圖數據對接與即時更新
    - [x] 資源負載圖數據對接
    - [x] Excel 導入功能實作
- [x] 實作錯誤處理與載入狀態 @frontend

## 3. 安全強化 (Security Hardening)
- [x] 修復路徑遍歷漏洞 (使用 UUID 處理上傳檔案)
- [x] 限制 CORS 策略 (限制特定 Origin)
- [x] 防止錯誤資訊外洩 (自定義錯誤訊息與內部 Log)
- [x] 鎖定依賴項版本 (requirements.txt 鎖定)
- [x] 加入後端 .gitignore 保護資料庫與憑證

## 4. 測試與驗證
- [ ] 撰寫後端單元測試 @backend
- [ ] 執行端對端 (E2E) 測試 (Excel 匯入 -> 甘特圖連動 -> 衝突預警)
- [ ] 效能驗證 (50+ 任務壓力測試)

## 4. 部署與清理
- [ ] 產生最終 requirements.txt
- [ ] 更新 README.md 提供啟動說明
- [ ] 執行 Git 本地 Commit
