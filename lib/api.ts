export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'ADMIN';
}

export interface Submission {
  id: number;
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string | null;
  studentId: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg =
      data.message || data.errors?.[0]?.message || `Error ${response.status}: Request failed`;
    const error = new Error(errorMsg);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    return apiRequest<{
      success: boolean;
      data: { user: User; token: string };
      message?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'STUDENT' | 'MENTOR';
  }) => {
    return apiRequest<{
      success: boolean;
      data: { user: User; token: string };
      message?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return apiRequest<{
      success: boolean;
      data: { user: User };
    }>('/auth/me');
  },
};

export const submissionApi = {
  create: async (data: {
    projectName: string;
    repoUrl: string;
    liveLink: string;
    description: string;
  }) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: Submission;
    }>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMy: async () => {
    return apiRequest<{
      success: boolean;
      data: { submissions: Submission[] };
    }>('/submissions/my');
  },

  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{
      success: boolean;
      data: {
        submissions: Submission[];
        pagination: Pagination;
      };
    }>(`/submissions${queryString}`);
  },

  updateStatus: async (
    id: number,
    data: { status: 'APPROVED' | 'REJECTED'; feedback?: string }
  ) => {
    return apiRequest<{
      success: boolean;
      message: string;
      data: Submission;
    }>(`/submissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getStats: async () => {
    return apiRequest<{
      success: boolean;
      data: { stats: Stats };
    }>('/submissions/stats');
  },
};
