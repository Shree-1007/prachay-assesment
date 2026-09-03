import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveVoucher, Voucher } from '../services/mockApi';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const CreateVoucher: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    expenseDate: '',
    department: '',
    expenseTitle: '',
    expenseCategory: 'Travel',
    expenseDescription: '',
    amount: ''
  });
  
  // For signature we'd normally use a file upload, but for now we'll simulate it
  const [signature, setSignature] = useState<File | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSignature(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Submitted') => {
    e.preventDefault();
    
    if (status === 'Submitted' && !signature) {
      alert("Employee signature is mandatory before submission.");
      return;
    }
    
    if (Number(formData.amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    const newVoucher: Partial<Voucher> = {
      ...formData,
      amount: Number(formData.amount),
      voucherDate: new Date().toISOString().split('T')[0],
      employeeId: user?.id,
      employeeName: user?.name,
      status: status,
    };

    await saveVoucher(newVoucher);
    navigate('/dashboard/vouchers');
  };

  if (user?.role !== 'employee') {
    return <div className="p-8 text-destructive">Unauthorized: Only employees can create vouchers.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Create Voucher</h1>
        <p className="text-muted-foreground mt-2">Fill out the details for your expense reimbursement.</p>
      </div>

      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
        <form className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Expense Title *"
              name="expenseTitle"
              value={formData.expenseTitle}
              onChange={handleChange}
              required
              placeholder="e.g. Client Dinner"
            />
            <div className="flex flex-col space-y-1.5 w-full">
              <label className="text-sm font-medium leading-none">Expense Category *</label>
              <select
                name="expenseCategory"
                value={formData.expenseCategory}
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
              value={formData.department}
              onChange={handleChange}
              required
              placeholder="e.g. Sales"
            />
            <Input
              label="Expense Date *"
              name="expenseDate"
              type="date"
              value={formData.expenseDate}
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
              value={formData.amount}
              onChange={handleChange}
              required
              placeholder="0.00"
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
              value={formData.expenseDescription}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Provide additional details..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={(e) => handleSubmit(e, 'Draft')}
            >
              Save as Draft
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
