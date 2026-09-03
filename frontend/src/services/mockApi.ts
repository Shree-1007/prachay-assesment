// Mock API for Frontend Development

export type Role = 'employee' | 'director' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
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

// Initial mock users
const MOCK_USERS: User[] = [
  { id: 1, name: 'Alice Employee', email: 'employee@test.com', role: 'employee' },
  { id: 2, name: 'Bob Director', email: 'director@test.com', role: 'director' },
  { id: 3, name: 'Charlie Accounts', email: 'accounts@test.com', role: 'accounts' }
];

export const mockLogin = async (email: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email);
      resolve(user || null);
    }, 500); // simulate network delay
  });
};

export const getVouchers = async (): Promise<Voucher[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = localStorage.getItem('vouchers');
      resolve(data ? JSON.parse(data) : []);
    }, 300);
  });
};

export const saveVoucher = async (voucher: Partial<Voucher>): Promise<Voucher> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const vouchers = await getVouchers();
      if (voucher.id) {
        // Update
        const index = vouchers.findIndex(v => v.id === voucher.id);
        if (index > -1) {
          vouchers[index] = { ...vouchers[index], ...voucher, updatedAt: new Date().toISOString() } as Voucher;
          localStorage.setItem('vouchers', JSON.stringify(vouchers));
          resolve(vouchers[index]);
          return;
        }
      }
      // Create
      const newVoucher: Voucher = {
        ...voucher,
        id: Math.random().toString(36).substr(2, 9),
        voucherNumber: `VCH-${Math.floor(Math.random() * 10000)}`,
        status: voucher.status || 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Voucher;
      vouchers.push(newVoucher);
      localStorage.setItem('vouchers', JSON.stringify(vouchers));
      resolve(newVoucher);
    }, 300);
  });
};
