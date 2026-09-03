import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  LogOut,
  User as UserIcon,
  PlusCircle,
  Menu
} from 'lucide-react';
import { Button } from "../ui/Button";

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Define navigation based on role
  const navItems = React.useMemo(() => {
    const items = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ];

    if (user?.role === 'employee') {
      items.push({ name: 'Create Voucher', path: '/dashboard/create', icon: PlusCircle });
      items.push({ name: 'My Vouchers', path: '/dashboard/vouchers', icon: FileText });
    } else if (user?.role === 'director') {
      items.push({ name: 'Pending Approvals', path: '/dashboard/pending', icon: CheckSquare });
      items.push({ name: 'All Vouchers', path: '/dashboard/vouchers', icon: FileText });
    } else if (user?.role === 'accounts') {
      items.push({ name: 'All Vouchers', path: '/dashboard/vouchers', icon: FileText });
    }

    return items;
  }, [user]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-border">
            <div className="flex items-center gap-2 font-bold text-lg text-foreground">
              <FileText className="text-primary" />
              <span>Expense System</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/dashboard');
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon size={20} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                <UserIcon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-none text-foreground">{user?.name}</span>
                <span className="text-xs text-muted-foreground mt-1 capitalize">{user?.role}</span>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start mt-2 text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut size={20} className="mr-3" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 md:hidden">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <FileText className="text-primary" />
            <span>Expense System</span>
          </div>
          <Button variant="ghost" size="sm" onClick={toggleMobileMenu} className="-mr-3">
            <Menu size={24} />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
