export type Role = 'employee' | 'director' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  signature_url?: string;
}

export type VoucherStatus = 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Rejected';

export interface Voucher {
  id: string; // The DB uses integer IDs, but they get cast to string sometimes. Let's keep it string to avoid refactoring frontend. Actually the backend returns number id. Let's use any or string|number.
  voucher_number: string;
  voucher_date: string;
  expense_date: string;
  department: string;
  expense_title: string;
  expense_category: string;
  expense_description: string;
  amount: number;
  employee_id: number;
  employee_name: string;
  status: VoucherStatus;
  rejection_reason?: string;
  approval_date?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const apiLogin = async (email: string, password: string = 'password123'): Promise<{user: User, token: string} | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getVouchers = async (): Promise<Voucher[]> => {
  const res = await fetch(`${API_URL}/vouchers`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch vouchers');
  return res.json();
};

export const getVoucherById = async (id: string): Promise<Voucher> => {
  const res = await fetch(`${API_URL}/vouchers/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch voucher');
  return res.json();
};

export const createVoucher = async (formData: FormData): Promise<Voucher> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/vouchers`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData // FormData doesn't need Content-Type header
  });
  if (!res.ok) throw new Error('Failed to create voucher');
  return res.json();
};

export const updateVoucher = async (id: string, formData: FormData): Promise<Voucher> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/vouchers/${id}`, {
    method: 'PUT',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  if (!res.ok) throw new Error('Failed to update voucher');
  return res.json();
};

export const deleteVoucher = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/vouchers/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete voucher');
};

export const reviewVoucher = async (id: string, formData: FormData): Promise<Voucher> => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/vouchers/${id}/review`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  if (!res.ok) throw new Error('Failed to review voucher');
  return res.json();
};
