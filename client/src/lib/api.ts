// API Client for backend communication

const API_BASE = '/api';

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include', // Include session cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Admin Auth
export const adminAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => fetchAPI('/admin/logout', { method: 'POST' }),

  me: () => fetchAPI('/admin/me'),
};

// Users
export const usersAPI = {
  list: () => fetchAPI('/users'),
  get: (id: number) => fetchAPI(`/users/${id}`),
  update: (id: number, data: any) =>
    fetchAPI(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  register: (userData: any) =>
    fetchAPI('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

// Deposits
export const depositsAPI = {
  list: (status?: string) => fetchAPI(`/deposits${status ? `?status=${status}` : ''}`),
  listUser: (userId: number) => fetchAPI(`/users/${userId}/deposits`),
  create: (data: any) =>
    fetchAPI('/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: number) =>
    fetchAPI(`/deposits/${id}/approve`, {
      method: 'POST',
    }),
};

// Withdrawals
export const withdrawalsAPI = {
  list: (status?: string) => fetchAPI(`/withdrawals${status ? `?status=${status}` : ''}`),
  listUser: (userId: number) => fetchAPI(`/users/${userId}/withdrawals`),
  create: (data: any) =>
    fetchAPI('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  approve: (id: number) =>
    fetchAPI(`/withdrawals/${id}/approve`, {
      method: 'POST',
    }),
};

// Investment Plans
export const investmentPlansAPI = {
  list: () => fetchAPI('/investment-plans'),
  create: (data: any) =>
    fetchAPI('/investment-plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/investment-plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// User Investments
export const investmentsAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/investments`),
  create: (data: any) =>
    fetchAPI('/investments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// AI Bots
export const botsAPI = {
  list: () => fetchAPI('/bots'),
  get: (id: number) => fetchAPI(`/bots/${id}`),
  create: (data: any) =>
    fetchAPI('/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/bots/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// User Bot Subscriptions
export const userBotsAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/bots`),
  create: (data: any) =>
    fetchAPI('/user-bots', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Wallets
export const walletsAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/wallets`),
  create: (data: any) =>
    fetchAPI('/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI(`/wallets/${id}`, {
      method: 'DELETE',
    }),
};

// Crypto Addresses
export const addressesAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/addresses`),
  create: (data: any) =>
    fetchAPI('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    fetchAPI(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// Portfolio
export const portfolioAPI = {
  getUser: (userId: number) => fetchAPI(`/users/${userId}/portfolio`),
};

// Balance
export const balanceAPI = {
  getUser: (userId: number) => fetchAPI(`/users/${userId}/balance`),
};

// Support Tickets
export const ticketsAPI = {
  listAll: () => fetchAPI('/tickets'),
  listUser: (userId: number) => fetchAPI(`/users/${userId}/tickets`),
  create: (data: any) =>
    fetchAPI('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// System Settings
export const settingsAPI = {
  get: () => fetchAPI('/settings'),
  update: (data: any) =>
    fetchAPI('/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

// Assets
export const cryptoAssetsAPI = {
  list: () => fetchAPI('/crypto-assets'),
  create: (data: any) =>
    fetchAPI('/crypto-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/crypto-assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const forexAssetsAPI = {
  list: () => fetchAPI('/forex-assets'),
  create: (data: any) =>
    fetchAPI('/forex-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const stockAssetsAPI = {
  list: () => fetchAPI('/stock-assets'),
  create: (data: any) =>
    fetchAPI('/stock-assets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Transactions
export const transactionsAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/transactions`),
};

// Swaps
export const swapsAPI = {
  listUser: (userId: number) => fetchAPI(`/users/${userId}/swaps`),
  create: (data: any) =>
    fetchAPI('/swaps', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// KYC
export const kycAPI = {
  listPending: () => fetchAPI('/kyc/pending'),
  getUser: (userId: number) => fetchAPI(`/users/${userId}/kyc`),
  create: (data: any) =>
    fetchAPI('/kyc', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    fetchAPI(`/kyc/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
