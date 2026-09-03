import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getVouchers, Voucher } from '../services/mockApi';
import { FileText, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const PendingApprovals: React.FC = () => {
  const { user } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      const data = await getVouchers();
      // Directors only see 'Submitted' (or 'Pending Approval' depending on terminology) vouchers in this queue
      const pendingData = data.filter(v => v.status === 'Submitted');
      // Sort by oldest first for queue
      setVouchers(pendingData.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setIsLoading(false);
    };
    
    if (user) {
      fetchVouchers();
    }
  }, [user]);

  if (user?.role !== 'director') {
    return <div className="p-8 text-destructive">Unauthorized: Only directors can access this view.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve employee expense vouchers.</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading queue...</div>
        ) : vouchers.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
              <CheckSquare size={24} />
            </div>
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-muted-foreground mt-1 mb-4">There are no vouchers pending your approval right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Voucher No.</th>
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vouchers.map((voucher) => (
                  <tr key={voucher.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{voucher.voucherNumber}</td>
                    <td className="px-6 py-4">{voucher.employeeName}</td>
                    <td className="px-6 py-4 text-muted-foreground">{voucher.voucherDate}</td>
                    <td className="px-6 py-4 font-medium">${voucher.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/dashboard/vouchers/${voucher.id}`}>
                        <Button variant="primary" size="sm" className="h-8">Review</Button>
                      </Link>
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
