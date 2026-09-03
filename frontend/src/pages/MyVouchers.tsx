import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVouchers, Voucher } from '../services/mockApi';
import { FileText, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const MyVouchers: React.FC = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      const data = await getVouchers();
      // Employee sees only their own, others see all
      const myData = user?.role === 'employee' 
        ? data.filter(v => v.employeeId === user.id) 
        : data;
      // Sort by newest first
      setVouchers(myData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setIsLoading(false);
    };
    
    if (user) {
      fetchVouchers();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Pending Approval': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      const updatedVouchers = vouchers.filter(v => v.id !== id);
      setVouchers(updatedVouchers);
      localStorage.setItem('vouchers', JSON.stringify(updatedVouchers));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {user?.role === 'employee' ? 'My Vouchers' : 'All Vouchers'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {user?.role === 'employee' 
              ? 'Track the status of your expense reimbursement requests.'
              : 'View all expense reimbursement requests in the system.'}
          </p>
        </div>
        {user?.role === 'employee' && (
          <Link to="/dashboard/create">
            <Button className="flex items-center gap-2">
              <PlusCircle size={16} />
              Create New
            </Button>
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading vouchers...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-medium">No vouchers found</h3>
            <p className="text-muted-foreground mt-1 mb-4">You haven't created any expense vouchers yet.</p>
            <Link to="/dashboard/create">
              <Button variant="outline">Create your first voucher</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Voucher No.</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{voucher.voucherNumber}</td>
                    <td className="px-6 py-4 text-muted-foreground">{voucher.voucherDate}</td>
                    <td className="px-6 py-4">{voucher.expenseTitle}</td>
                    <td className="px-6 py-4 font-medium">${voucher.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(voucher.status)}`}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link to={`/dashboard/vouchers/${voucher.id}`}>
                        <Button variant="outline" size="sm" className="h-8">View</Button>
                      </Link>
                      {voucher.status === 'Draft' && (
                        <>
                          <Link to={`/dashboard/edit/${voucher.id}`}>
                            <Button variant="secondary" size="sm" className="h-8">Edit</Button>
                          </Link>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleDelete(voucher.id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
