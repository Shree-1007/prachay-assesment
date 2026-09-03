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
  id: string; 
  voucherNumber: string;
  voucherDate: string;
  expenseDate: string;
  department: string;
  expenseTitle: string;
  expenseCategory: string;
  expenseDescription: string;
  amount: number;
  employeeId: number;
  employeeName: string;
  status: VoucherStatus;
  rejectionReason?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const toCamel = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const camelObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      camelObj[camelKey] = toCamel(obj[key]);
    }
  }
  return camelObj;
};

const toSnake = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  const snakeObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      snakeObj[snakeKey] = toSnake(obj[key]);
    }
  }
  return snakeObj;
};

export const mockLogin = async (email: string, password: string = 'password123'): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    return toCamel(data.user);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getVouchers = async (): Promise<Voucher[]> => {
  const res = await fetch(`${API_URL}/vouchers`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch vouchers');
  const data = await res.json();
  return toCamel(data);
};

export const getVoucherById = async (id: string): Promise<Voucher> => {
  const res = await fetch(`${API_URL}/vouchers/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to fetch voucher');
  const data = await res.json();
  return toCamel(data);
};

export const saveVoucher = async (voucher: Partial<Voucher>, signatureFile?: File): Promise<Voucher> => {
  const token = localStorage.getItem('token');
  const method = voucher.id ? 'PUT' : 'POST';
  const url = voucher.id ? `${API_URL}/vouchers/${voucher.id}` : `${API_URL}/vouchers`;

  const snakeVoucher = toSnake(voucher);
  const formData = new FormData();
  
  for (const key in snakeVoucher) {
    if (snakeVoucher[key] !== undefined && snakeVoucher[key] !== null) {
      formData.append(key, snakeVoucher[key].toString());
    }
  }
  
  if (signatureFile) {
    formData.append('signature', signatureFile);
  }

  const res = await fetch(url, {
    method,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to save voucher');
  }

  const data = await res.json();
  return toCamel(data);
};

export const deleteVoucher = async (id: string): Promise<void> => {
  const res = await fetch(`${API_URL}/vouchers/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete voucher');
};

export const reviewVoucher = async (id: string, status: string, rejectionReason: string, signatureFile?: File): Promise<Voucher> => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('status', status);
  if (rejectionReason) formData.append('rejection_reason', rejectionReason);
  if (signatureFile) formData.append('signature', signatureFile);

  const res = await fetch(`${API_URL}/vouchers/${id}/review`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to review voucher');
  }
  
  const data = await res.json();
  return toCamel(data);
};
