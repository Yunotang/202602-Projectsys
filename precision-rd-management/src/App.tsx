import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TableProperties, 
  Calendar as Timeline, 
  BarChart3, 
  FileUp, 
  Settings, 
  Languages, 
  Plus, 
  Search, 
  Bell, 
  HelpCircle,
  Menu,
  MoreHorizontal,
  Rocket,
  Flag,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Info,
  Download,
  X,
  Cpu,
  Factory
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, Project, Task, Resource, Conflict } from './api';

// --- Types ---
type ViewType = 'overview' | 'stages' | 'gantt' | 'resource' | 'import';

// --- Sub-components ---

const Sidebar = ({ currentView, onViewChange, onAction }: { 
  currentView: ViewType, 
  onViewChange: (v: ViewType) => void,
  onAction: (text: string) => void 
}) => {
  const navItems = [
    { id: 'overview', label: '專頁概覽', icon: LayoutDashboard },
    { id: 'stages', label: '階段管理', icon: TableProperties },
    { id: 'gantt', label: '甘特圖表', icon: Timeline },
    { id: 'resource', label: '資源負載', icon: BarChart3 },
    { id: 'import', label: '數據導入', icon: FileUp },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-surface-container-low shadow-sm flex flex-col py-6 px-4 z-20 hidden md:flex border-r border-outline-variant/30">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-lg bg-soft-blush flex items-center justify-center text-primary flex-shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-deep-burgundy text-lg leading-tight">專案開發</h1>
          <p className="text-xs text-on-surface-variant font-medium">Precision R&D</p>
        </div>
      </div>

      <button 
        onClick={() => onAction('SHOW_CREATE_MODAL')}
        className="w-full bg-primary text-on-primary py-2.5 px-4 rounded-full mb-6 hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
      >
        <Plus className="w-5 h-5" />
        <span className="font-semibold text-sm">新增專案</span>
      </button>

      <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id as ViewType)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-soft-blush text-primary font-bold shadow-soft' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'fill-primary/10' : ''}`} />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
        <button 
          onClick={() => onAction('開啟系統設定...')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all text-sm"
        >
          <Settings className="w-4 h-4" />
          <span>系統設定</span>
        </button>
      </div>
    </nav>
  );
};

const TopBar = ({ onBellClick }: { onBellClick: () => void }) => (
  <header className="fixed top-0 right-0 left-0 md:left-60 bg-surface border-b border-outline-variant/30 flex justify-between items-center px-8 h-16 z-10">
    <div className="flex items-center gap-6">
      <h2 className="text-xl font-bold text-primary hidden lg:block">硬體研發管理系統</h2>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
        <input 
          type="text" 
          placeholder="搜尋專案或料號..." 
          className="pl-10 pr-4 py-1.5 bg-surface-container-low border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button 
        onClick={onBellClick}
        className="p-2 text-on-surface-variant hover:bg-soft-blush hover:text-primary rounded-full transition-all relative"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-critical-orange rounded-full border border-surface"></span>
      </button>
      <button className="p-2 text-on-surface-variant hover:bg-soft-blush hover:text-primary rounded-full transition-all">
        <HelpCircle className="w-5 h-5" />
      </button>
      <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/50 ml-2 cursor-pointer hover:scale-105 transition-transform">
        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop" alt="Profile" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
);

// --- View: Overview ---

const OverviewView = ({ projects, conflicts, onNavigate, onExport, onCreateClick, onEditClick, onDeleteClick }: { 
  projects: Project[],
  conflicts: Conflict[],
  onNavigate: (v: ViewType) => void,
  onExport: () => void,
  onCreateClick: () => void,
  onEditClick: (p: Project) => void,
  onDeleteClick: (id: number) => void
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">專頁概覽</h1>
          <p className="text-on-surface-variant mt-1">目前活躍專案狀態與資源概況</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCreateClick}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> 新增專案
          </button>
          <button 
            onClick={onExport}
            className="px-4 py-2 bg-surface-lowest border border-outline-variant rounded-lg text-sm flex items-center gap-2 hover:bg-surface-container transition-colors"
          >
            匯出報告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10 flex justify-between items-center group hover:border-primary/20 transition-all">
          <div>
            <p className="text-on-surface-variant text-sm font-medium">活躍專案總數</p>
            <h3 className="text-4xl font-bold mt-1">{(projects || []).length} <span className="text-base text-on-surface-variant font-normal">個</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-soft-blush flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Rocket className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10 flex justify-between items-center group hover:border-primary/20 transition-all">
          <div>
            <p className="text-on-surface-variant text-sm font-medium">總任務數</p>
            <h3 className="text-4xl font-bold mt-1">{(projects || []).reduce((acc, p) => acc + (p.tasks?.length || 0), 0)} <span className="text-base text-on-surface-variant font-normal">項</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Flag className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-alert border border-error-container/30 flex justify-between items-center relative overflow-hidden group hover:border-resource-conflict/30 transition-all">
          <div className="relative z-10">
            <p className="text-resource-conflict text-sm font-bold">資源衝突警告</p>
            <h3 className="text-3xl font-bold mt-1">{new Set((conflicts || []).map(c => c.resource_id)).size} <span className="text-base text-on-surface-variant font-normal">位工程師超載</span></h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-error-container flex items-center justify-center text-resource-conflict relative z-10 group-hover:animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-container/20 rounded-bl-full -mr-4 -mt-4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-soft border border-outline-variant/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-container flex justify-between items-center">
            <h3 className="text-lg font-bold text-deep-burgundy">專案進度 (Task Overview)</h3>
            <button className="text-on-surface-variant hover:text-primary"><MoreHorizontal /></button>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-xs border-b border-surface-container">
                  <th className="pb-3 px-2">專案名稱</th>
                  <th className="pb-3 text-center">任務數</th>
                  <th className="pb-3 text-center">階段</th>
                  <th className="pb-3 text-right">動作</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(projects || []).map(prj => (
                  <tr key={prj.id} className="border-b border-surface-container/50 hover:bg-surface-bright transition-colors group">
                    <td className="py-4 px-2">
                      <div className="font-bold group-hover:text-primary transition-colors">{prj.name}</div>
                      <div className="text-[10px] font-mono text-on-surface-variant opacity-60 uppercase">{prj.code}</div>
                    </td>
                    <td className="text-center font-bold">
                      {prj.tasks?.length || 0}
                    </td>
                    <td className="text-center">
                      {Array.from(new Set((prj.tasks || []).map(t => t.stage))).join(' / ') || '未啟動'}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => onEditClick(prj)}
                          className="p-2 hover:bg-soft-blush hover:text-primary rounded-full transition-all"
                          title="修改名稱"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteClick(prj.id)}
                          className="p-2 hover:bg-error-container/20 hover:text-resource-conflict rounded-full transition-all"
                          title="刪除專案"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10">
            <h3 className="font-bold text-deep-burgundy flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5" /> 關鍵資源負載
            </h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">EE Team (電子工程)</span>
                  <span className="font-bold text-resource-conflict">115%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: '85%' }}></div>
                  <div className="bg-resource-conflict h-full heatmap-overload" style={{ width: '15%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium">ME Team (機構工程)</span>
                  <span className="font-bold">85%</span>
                </div>
                <div className="h-3 bg-surface-container rounded-full overflow-hidden">
                  <div className="bg-secondary h-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('resource')}
              className="w-full mt-6 py-2 border border-outline-variant/50 rounded-xl text-xs font-bold text-primary hover:bg-soft-blush transition-all"
            >
              檢視詳細資源熱區圖
            </button>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10">
             <h3 className="font-bold text-on-surface mb-4">系統通知</h3>
             <div className="space-y-3">
               <div className="flex gap-3 p-3 bg-error-container/20 rounded-xl border border-error-container/30">
                 <AlertTriangle className="w-4 h-4 text-resource-conflict shrink-0" />
                 <div className="text-xs">
                   <p className="font-bold text-on-surface">張工程師 負載過高</p>
                   <p className="text-on-surface-variant mt-1 leading-relaxed">Quantum Sensor Hub 提前進入 PVT，導致階段重疊。</p>
                 </div>
               </div>
               <div className="flex gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-on-surface">時程數據匯入成功</p>
                  <p className="text-on-surface-variant mt-1">Neural Edge AI Module V2 已建立關聯。</p>
                </div>
               </div>

             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- View: Stages Management ---

const StagesView = ({ projects }: { projects: Project[] }) => {
  const getStageProgress = (project: Project, stage: string) => {
    const stageTasks = (project.tasks || []).filter(t => t.stage === stage);
    if (stageTasks.length === 0) return 0;
    // Simple mock logic: if end_date exists and is in the past, consider it done
    // In a real app, you'd use a 'status' or 'progress' field
    const completed = stageTasks.filter(t => t.end_date && new Date(t.end_date) < new Date()).length;
    return Math.round((completed / stageTasks.length) * 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">階段管理 (Stage-Gate)</h1>
          <p className="text-on-surface-variant mt-1">追蹤各專案 NPI 流程的完整性與過關狀態</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {(projects || []).map(prj => (
          <div key={prj.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {prj.code.substring(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{prj.name}</h3>
                  <p className="text-xs text-on-surface-variant uppercase">{prj.code}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-soft-blush text-primary rounded-full text-xs font-bold">
                PM: {prj.pm_name || '未指定'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Progress Connector Lines */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-surface-container -translate-y-1/2 z-0"></div>
              
              {['EVT', 'DVT', 'PVT'].map((stage, idx) => {
                const progress = getStageProgress(prj, stage);
                return (
                  <div key={stage} className="relative z-10 flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black transition-all ${
                      progress === 100 ? 'bg-primary border-primary text-white' : 'bg-white border-surface-container text-on-surface-variant'
                    }`}>
                      {progress === 100 ? '✓' : `${progress}%`}
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-bold text-sm">{stage} 階段</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">
                        {(prj.tasks || []).filter(t => t.stage === stage).length} 項任務
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {(projects || []).length === 0 && (
          <div className="py-20 text-center text-on-surface-variant opacity-50 border-2 border-dashed border-outline-variant/30 rounded-3xl">
             目前沒有專案資料，請先新增專案並導入時程。
          </div>
        )}
      </div>
    </motion.div>
  );
};


// --- View: Resource Load ---

const ResourceView = ({ conflicts }: { conflicts: Conflict[] }) => {
  const weeks = ['W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37', 'W38'];
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">資源負載分析</h1>
          <p className="text-on-surface-variant mt-1 italic">紅色區塊代表產能超載，需重新評估排期。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-soft border border-outline-variant/10">
          <div className="flex items-center gap-2 text-resource-conflict mb-4">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">系統衝突清單 ({conflicts.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {conflicts.map((c, i) => (
              <div key={i} className="p-4 bg-soft-blush rounded-2xl border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-resource-conflict"></div>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-sm">{c.resource_name}</p>
                  <p className="font-mono font-bold text-resource-conflict">{(c.total_load * 100).toFixed(0)}%</p>
                </div>
                <p className="text-[10px] text-on-surface-variant mb-3">{c.date}</p>
                <div className="space-y-1.5 border-t border-primary/5 pt-2">
                  {c.tasks.map((t, ti) => (
                    <div key={ti} className="flex items-center gap-2 text-[10px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-stage-evt"></div>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {conflicts.length === 0 && (
              <div className="col-span-full py-20 text-center text-on-surface-variant opacity-50">
                目前無資源衝突
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- View: Import ---

// --- View: Import ---

const ImportView = ({ projects, onComplete }: { projects: Project[], onComplete: () => void }) => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Select Project & Map, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<number | null>(null);

  const resetUpload = () => {
    setStep(1);
    setIsProcessing(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedFile || !targetProjectId) {
      alert('請先選擇專案');
      return;
    }
    setIsProcessing(true);
    try {
      await api.importExcel(targetProjectId, selectedFile);
      setStep(3);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      alert('導入失敗: ' + error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">專案時程 (WBS) 導入</h1>
          <p className="text-on-surface-variant mt-1">上傳 Excel 並映射欄位，自動更新資源負載。</p>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                s <= step ? 'bg-primary border-primary text-white' : 'border-outline-variant text-on-surface-variant'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 rounded-full ${s < step ? 'bg-primary' : 'bg-outline-variant'}`}></div>}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div 
          className="bg-surface-container-lowest p-20 rounded-3xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all group relative"
        >
          <input 
            type="file" 
            className="absolute inset-0 opacity-0 cursor-pointer" 
            accept=".xlsx,.csv"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-2xl bg-soft-blush flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
            <FileUp className="w-8 h-8" />
          </div>
          <p className="font-bold text-lg">點擊或拖拽檔案至此</p>
          <p className="text-sm text-on-surface-variant mt-1">支援 .xlsx, .csv 格式 (最大 20MB)</p>
        </div>
      )}

      {step >= 2 && selectedFile && (
        <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/10 shadow-soft relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-soft-blush flex items-center justify-center text-primary">
                <FileUp className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedFile.name}</h3>
                <p className="text-sm text-on-surface-variant mt-1.5 flex items-center gap-2">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • <span className="text-primary font-bold">待導入</span>
                </p>
              </div>
            </div>
            <button 
              onClick={resetUpload}
              className="flex items-center gap-2 text-on-surface-variant hover:text-resource-conflict font-bold text-sm transition-colors"
            >
              <X className="w-4 h-4" /> 重新上傳
            </button>
          </div>
          
          <div className="mt-8 space-y-4">
            <label className="text-sm font-bold block text-on-surface-variant">選擇目標專案</label>
            <select 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
              value={targetProjectId || ''}
              onChange={(e) => setTargetProjectId(Number(e.target.value))}
            >
              <option value="">-- 請選擇專案 --</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex justify-end gap-4 pt-6 border-t border-outline-variant/30">
          <button 
            onClick={resetUpload}
            className="px-8 py-2.5 rounded-full font-bold text-sm border border-outline-variant hover:bg-surface-container-high transition-all"
          >
            取消
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing || !targetProjectId}
            className={`px-10 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
              isProcessing ? 'bg-surface-container-highest cursor-wait' : 'bg-primary text-on-primary shadow-lg hover:bg-primary-container active:scale-95 disabled:opacity-50'
            }`}
          >
            {isProcessing ? '導入中...' : '確認導入'}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="bg-surface-container-lowest p-20 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
            <Info className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">導入成功</h2>
          <p className="text-on-surface-variant mt-2">資料已成功匯入並更新時程與資源負載。</p>
        </div>
      )}
    </motion.div>
  );
};


// --- View: Gantt Chart ---

// --- View: Gantt Chart ---

const GanttView = ({ projects, onSave, onExport }: { 
  projects: Project[],
  onSave: () => void,
  onExport: () => void 
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [taskForm, setTaskForm] = useState<Partial<Task>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedTask = (projects || [])
    .flatMap(p => p.tasks || [])
    .find(t => t.id === selectedTaskId);

  // Sync taskForm when selection changes
  useEffect(() => {
    if (selectedTask) {
      setTaskForm({
        start_date: selectedTask.start_date || '',
        name: selectedTask.name
      });
    }
  }, [selectedTaskId, selectedTask]);

  const handleUpdate = async () => {
    if (!selectedTaskId || !taskForm.start_date) return;
    setIsUpdating(true);
    try {
      await api.updateTaskSchedule(selectedTaskId, taskForm.start_date);
      onSave();
      setSelectedTaskId(null);
    } catch (error) {
      alert('更新失敗: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId || !window.confirm('確定要刪除此任務嗎？')) return;
    setIsUpdating(true);
    try {
      await api.deleteTask(selectedTaskId);
      onSave();
      setSelectedTaskId(null);
    } catch (error) {
      alert('刪除失敗: ' + error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-12rem)] flex flex-col bg-surface-container-lowest rounded-3xl shadow-soft border border-outline-variant/10 overflow-hidden"
    >
      <div className="bg-surface-bright/50 border-b border-surface-container flex justify-between items-center px-6 h-14 shrink-0">
        <div className="flex gap-4">
          <h3 className="font-bold text-lg">全專案甘特圖</h3>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={onExport}
            className="bg-soft-blush text-primary text-xs font-bold px-5 py-2 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            匯出 Excel
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 shrink-0 border-r border-surface-container flex flex-col bg-white z-10 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
          <div className="grid grid-cols-[1fr_80px_60px] bg-deep-burgundy text-white text-[10px] font-bold p-3 sticky top-0 uppercase tracking-widest">
            <div>任務名稱 (WBS)</div>
            <div className="text-right">階段</div>
            <div className="text-right">天數</div>
          </div>
          <div className="overflow-y-auto flex-1 font-sans text-xs">
            {(projects || []).map(prj => (
              <div key={prj.id}>
                <div className="p-3 bg-soft-blush/20 border-b border-outline-variant/10 flex items-center gap-2 font-bold text-deep-burgundy">
                  <ChevronDown className="w-4 h-4" /> {prj.name}
                </div>
                {(prj.tasks || []).map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => {
                      setSelectedTaskId(task.id);
                    }}
                    className={`grid grid-cols-[1fr_80px_60px] p-3 border-b border-outline-variant/10 cursor-pointer transition-all hover:bg-surface-bright ${selectedTaskId === task.id ? 'bg-primary/5 text-primary border-l-4 border-l-primary' : 'pl-7'}`}
                  >
                    <div className="truncate">{task.name}</div>
                    <div className="text-right text-on-surface-variant opacity-60">{task.stage}</div>
                    <div className="text-right font-mono font-bold">{task.duration}d</div>
                  </div>
                ))}
                {(!prj.tasks || prj.tasks.length === 0) && (
                   <div className="p-3 text-[10px] text-on-surface-variant italic pl-7 opacity-50">尚無任務</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#f8fafc]/50 relative" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px)', backgroundSize: '100px 100%' }}>
          <div className="min-w-[1200px] p-10 space-y-4">
            {(projects || []).flatMap(p => p.tasks || []).map((task, i) => (
              <div key={task.id} className="h-10 flex items-center">
                <div 
                  className="h-6 bg-primary/20 border border-primary/30 rounded-md relative flex items-center px-2 min-w-[100px]"
                  style={{ marginLeft: `${i * 20}px`, width: `${(task.duration || 1) * 20}px` }}
                >
                  <span className="text-[9px] font-bold text-primary truncate">{task.name}</span>
                </div>
                <span className="ml-3 text-[10px] text-on-surface-variant">{task.start_date || '未定'} ~ {task.end_date || '未定'}</span>
              </div>
            ))}
            {(projects || []).every(p => !p.tasks || p.tasks.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full opacity-30 mt-20">
                <Timeline className="w-12 h-12 mb-2" />
                <p>請先導入 WBS 資料以顯示甘特圖</p>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedTaskId && selectedTask && (
            <motion.div 
              initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
              className="w-80 bg-white border-l border-outline-variant/20 flex flex-col shadow-[-8px_0_24px_rgba(0,0,0,0.05)] z-30"
            >
              <div className="h-14 border-b border-surface-container flex items-center justify-between px-6 shrink-0">
                <h4 className="font-bold">任務排程編輯</h4>
                <button onClick={() => setSelectedTaskId(null)} className="p-1 hover:bg-surface-container rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">任務名稱</label>
                    <p className="font-bold text-sm">{selectedTask.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">當前開始日期</label>
                    <input 
                      type="date" 
                      className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                      value={taskForm.start_date || ''}
                      onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant italic">* 更新開始日期會自動連動下游任務。</p>
                  
                  <div className="pt-4 border-t border-outline-variant/20">
                    <button 
                      onClick={handleDeleteTask}
                      className="w-full py-2 rounded-xl text-xs font-bold text-resource-conflict border border-resource-conflict/30 hover:bg-error-container/20 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> 刪除此任務
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-auto p-6 bg-surface-bright flex gap-3">
                 <button onClick={() => setSelectedTaskId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors">取消</button>
                 <button 
                  onClick={handleUpdate}
                  disabled={isUpdating || !taskForm.start_date}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-white shadow-md hover:bg-primary-container active:scale-95 transition-all disabled:opacity-50"
                 >
                   {isUpdating ? '更新中...' : '儲存並連動'}
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


// --- Main App Component ---

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [notifications, setNotifications] = useState<{id: number, text: string}[]>([]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  // New/Edit project form state
  const [projectForm, setProjectForm] = useState({ name: '', code: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projData, confData] = await Promise.all([
        api.getProjects(),
        api.getConflicts()
      ]);
      setProjects(projData);
      setConflicts(confData);
    } catch (error) {
      addNotification('獲取數據失敗: ' + error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadExcel = async (projectId: number) => {
    addNotification('Excel 匯出處理中...請稍候');
    try {
      const blob = await api.exportProjectExcel(projectId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Project_Export_${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      addNotification('Excel 匯出成功！');
    } catch (error) {
      addNotification('匯出失敗: ' + error);
    }
  };

  const addNotification = (text: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const handleSaveProject = async () => {
    if (!projectForm.name || !projectForm.code) return;
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, projectForm);
        addNotification('專案更新成功！');
      } else {
        await api.createProject(projectForm);
        addNotification('新專案已成功建立！');
      }
      setShowCreateModal(false);
      setEditingProject(null);
      setProjectForm({ name: '', code: '' });
      fetchData();
    } catch (error) {
      addNotification('操作失敗: ' + error);
    }
  };

  const startEdit = (p: Project) => {
    setEditingProject(p);
    setProjectForm({ name: p.name, code: p.code });
    setShowCreateModal(true);
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('確定要刪除此專案嗎？這將會移除所有相關任務與資源分配，且無法復原。')) return;
    try {
      await api.deleteProject(id);
      addNotification('專案已成功刪除');
      fetchData();
    } catch (error) {
      addNotification('刪除失敗: ' + error);
    }
  };

  const renderContent = () => {
    if (loading && projects.length === 0) {
      return (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    const handleGeneralExport = () => {
      if (projects.length > 0) {
        downloadExcel(projects[0].id); // Export the first one as demo
      } else {
        addNotification('尚無專案可供匯出');
      }
    };

    switch (currentView) {
      case 'overview': return (
        <OverviewView 
          projects={projects} 
          conflicts={conflicts} 
          onNavigate={setCurrentView} 
          onExport={handleGeneralExport} 
          onCreateClick={() => { setEditingProject(null); setProjectForm({ name: '', code: '' }); setShowCreateModal(true); }}
          onEditClick={startEdit}
          onDeleteClick={handleDeleteProject}
        />
      );
      case 'stages': return <StagesView projects={projects} />;
      case 'resource': return <ResourceView conflicts={conflicts} />;
      case 'gantt': return (
        <GanttView 
          projects={projects} 
          onSave={() => { fetchData(); addNotification('任務更新已儲存！'); }} 
          onExport={handleGeneralExport} 
        />
      );
      case 'import': return <ImportView projects={projects} onComplete={() => { fetchData(); addNotification('數據導入成功'); setCurrentView('overview'); }} />;
      default: return (
        <div className="flex flex-col items-center justify-center p-20 text-on-surface-variant border-2 border-dashed border-outline-variant/30 rounded-3xl">
          <Factory className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-bold text-lg">視圖開發中...</p>
          <p className="text-sm mt-1">此功能模組正在由研發團隊完善，即將推出。</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onAction={(action) => {
          if (action === 'SHOW_CREATE_MODAL') { setEditingProject(null); setProjectForm({ name: '', code: '' }); setShowCreateModal(true); }
          else addNotification(action);
        }}
      />
      <TopBar onBellClick={() => addNotification('目前沒有新的通知')} />
      
      <main className="md:ml-60 pt-24 p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Notifications Toast */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[100]">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div 
              key={n.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-tertiary px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-xl flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              {n.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create/Edit Project Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-bright">
                <h3 className="font-bold text-xl text-deep-burgundy">{editingProject ? '修改專案資訊' : '建立新專案'}</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-soft-blush rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">專案名稱</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                    placeholder="輸入專案名稱..." 
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">專案代號</label>
                  <input 
                    type="text" 
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" 
                    placeholder="e.g. PRJ-2026-001" 
                    value={projectForm.code}
                    onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                  />
                </div>
              </div>
              <div className="p-6 bg-surface-bright flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-2xl font-bold bg-surface-container text-on-surface-variant"
                >
                  取消
                </button>
                <button 
                  onClick={handleSaveProject}
                  className="flex-1 py-3 rounded-2xl font-bold bg-primary text-white shadow-lg disabled:opacity-50"
                  disabled={!projectForm.name || !projectForm.code}
                >
                  {editingProject ? '儲存變更' : '確認建立'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Nav Overlay (simplified) */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
