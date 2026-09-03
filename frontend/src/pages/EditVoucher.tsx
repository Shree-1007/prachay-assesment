import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveVoucher, getVouchers, Voucher } from '../services/mockApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const EditVoucher: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<Voucher> | null>(null);
  const [signature, setSignature] = useState<File | null>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      const allVouchers = await getVouchers();
      const found = allVouchers.find(v => v.id === id);
      
      if (found) {
        if (user?.role === 'employee' && found.employeeId !== user.id) {
          return; // unauthorized
        }
        if (found.status !== 'Draft') {
          return; // Can only edit drafts
        }
        setFormData(found);
      }
    };
    fetchVoucher();
  }, [id, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignature(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Submitted') => {
    e.preventDefault();
    if (!formData) return;
    
    if (status === 'Submitted' && !signature) {
      alert("Employee signature is mandatory before submission.");
      return;
    }
    
    if (Number(formData.amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const updatedVoucher: Partial<Voucher> = {
      ...formData,
      amount: Number(formData.amount),
      status: status,
    };

    await saveVoucher(updatedVoucher);
    navigate('/dashboard/vouchers');
  };

  if (user?.role !== 'employee') {
    return <div className="p-8 text-destructive">Unauthorized: Only employees can edit vouchers.</div>;
  }

  if (!formData) {
    return <div className="p-8">Loading, Not Found, or Voucher is not in Draft status...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Draft Voucher</h1>
          <p className="text-muted-foreground mt-2">Update your expense reimbursement details.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/vouchers')}>Cancel</Button>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Expense Title *"
              name="expenseTitle"
              value={formData.expenseTitle || ''}
              onChange={handleChange}
              required
            />
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium leading-none">Expense Category *</label>
              <select
                name="expenseCategory"
                value={formData.expenseCategory || ''}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Department *"
              name="department"
              value={formData.department || ''}
              onChange={handleChange}
              required
            />
            <Input
              label="Expense Date *"
              name="expenseDate"
              type="date"
              value={formData.expenseDate || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Amount ($) *"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleChange}
              required
            />
            <Input
              label="Employee Signature (Image)"
              name="signature"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label className="text-sm font-medium leading-none">Description</label>
            <textarea
              name="expenseDescription"
              value={formData.expenseDescription || ''}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleSubmit(e, 'Draft')}
            >
              Update Draft
            </Button>
            <Button 
              type="button" 
              variant="primary"
              onClick={(e) => handleSubmit(e, 'Submitted')}
            >
              Submit for Approval
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
