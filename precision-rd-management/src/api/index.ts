const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Project {
  id: number;
  name: string;
  code: string;
  pm_name?: string;
  target_date?: string;
  tasks: Task[];
}

export interface Task {
  id: number;
  project_id: number;
  name: string;
  stage: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  dependencies?: string;
  is_milestone?: boolean;
}

export interface Resource {
  id: number;
  name: string;
  type: string;
  department?: string;
}

export interface Conflict {
  resource_id: number;
  resource_name: string;
  date: string;
  total_load: number;
  tasks: string[];
}

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    const url = `${API_BASE_URL}/projects`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  getProject: async (id: number): Promise<Project> => {
    const url = `${API_BASE_URL}/projects/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },
  createProject: async (project: Partial<Project>): Promise<Project> => {
    const url = `${API_BASE_URL}/projects`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },
  updateProject: async (id: number, project: Partial<Project>): Promise<Project> => {
    const url = `${API_BASE_URL}/projects/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },
  deleteProject: async (id: number) => {
    const url = `${API_BASE_URL}/projects/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },

  // Tasks
  updateTaskSchedule: async (taskId: number, startDate: string) => {
    const url = `${API_BASE_URL}/tasks/${taskId}/schedule?start_date=${startDate}`;
    const res = await fetch(url, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },
  deleteTask: async (id: number) => {
    const url = `${API_BASE_URL}/tasks/${id}`; // To be implemented in backend
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    return res.json();
  },

  // Resources & Conflicts
  getResources: async (): Promise<Resource[]> => {
    const url = `${API_BASE_URL}/resources`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },
  getConflicts: async (): Promise<Conflict[]> => {
    const url = `${API_BASE_URL}/conflicts`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${url}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  // Excel Import
  importExcel: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/import/${projectId}`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Excel Export
  exportProjectExcel: async (projectId: number) => {
    const url = `${API_BASE_URL}/projects/${projectId}/export`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Export failed: ${res.status}`);
    return res.blob(); // Return as blob for download
  }
};
