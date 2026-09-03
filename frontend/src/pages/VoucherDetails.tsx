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
  const [signature, setSignature] = useState<File | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignature(e.target.files[0]);
    }
  };

  const handleReview = async (newStatus: 'Approved' | 'Rejected') => {
    if (!voucher) return;
    
    if (newStatus === 'Approved' && !signature) {
      alert("Director signature is mandatory to approve the voucher.");
      return;
    }

    if (newStatus === 'Rejected' && !rejectionReason.trim()) {
      alert("A reason must be provided when rejecting a voucher.");
      return;
    }

    const updatedVoucher: Partial<Voucher> = {
      id: voucher.id,
      status: newStatus,
    };

    if (newStatus === 'Rejected') {
      updatedVoucher.rejectionReason = rejectionReason;
    }

    // In a real app we would upload the signature file here.
    
    // Using mockApi save logic (which updates if id is present)
    // Wait, saveVoucher needs the full voucher object or it will overwrite with empty?
    // Let's import saveVoucher and use it
    
    // Oh, saveVoucher does a partial update based on ID in our mockApi.ts
    // Let's add saveVoucher to our imports
    
    await import('../services/mockApi').then(m => m.saveVoucher(updatedVoucher));
    
    // Re-fetch to update view
    const allVouchers = await getVouchers();
    const found = allVouchers.find(v => v.id === id);
    if(found) setVoucher(found);
    
    alert(`Voucher ${newStatus}!`);
    navigate('/dashboard/pending');
  };

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

        {/* Director Review Actions */}
        {user?.role === 'director' && voucher.status === 'Submitted' && (
          <div className="mt-8 border-t border-border pt-6 space-y-4">
            <h3 className="text-lg font-medium">Director Review</h3>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="text-sm font-medium leading-none mb-1.5 block">Director Signature (Image) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {!signature && <p className="text-xs text-muted-foreground mt-1">Signature is required to approve.</p>}
                </div>
                
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-sm font-medium leading-none">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={2}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Required if rejecting..."
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  variant="primary" 
                  onClick={() => handleReview('Approved')}
                  className="w-32 bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleReview('Rejected')}
                  className="w-32"
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
