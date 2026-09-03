import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVouchers, Voucher } from '../services/mockApi';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export const VoucherDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      const allVouchers = await getVouchers();
      const found = allVouchers.find(v => v.id === id);
      
      if (found) {
        // Enforce employee restriction: can only view their own
        if (user?.role === 'employee' && found.employeeId !== user.id) {
          return; // unauthorized
        }
        setVoucher(found);
      }
    };
    fetchVoucher();
  }, [id, user]);

  if (!voucher) return <div className="p-8">Loading or Not Found...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Voucher Details</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-8">
        <div className="grid grid-cols-2 gap-y-6 gap-x-12">
          
          <div>
            <p className="text-sm text-muted-foreground">Voucher Number</p>
            <p className="font-medium text-lg">{voucher.voucherNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary mt-1">
              {voucher.status}
            </span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Employee Name</p>
            <p className="font-medium">{voucher.employeeName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-medium">{voucher.department}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expense Title</p>
            <p className="font-medium">{voucher.expenseTitle}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expense Category</p>
            <p className="font-medium">{voucher.expenseCategory}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Expense Date</p>
            <p className="font-medium">{voucher.expenseDate}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="font-bold text-xl">${voucher.amount.toFixed(2)}</p>
          </div>
        </div>
        
        {voucher.expenseDescription && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="mt-2 text-sm">{voucher.expenseDescription}</p>
          </div>
        )}

        {voucher.rejectionReason && (
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm font-semibold text-destructive">Rejection Reason</p>
            <p className="mt-2 text-sm text-destructive">{voucher.rejectionReason}</p>
          </div>
        )}
      </div>
    </div>
  );
};
