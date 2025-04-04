
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  History, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setMobileOpen }) => {
  const { activeView, setActiveView } = useApp();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: History },
  ];
  
  const handleNavigation = (viewId: string) => {
    setActiveView(viewId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-64 bg-sidebar flex flex-col transition-transform md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with Logo */}
        <div className="h-16 px-4 flex items-center border-b border-sidebar-border">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-sidebar-foreground">Bengkel POS</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-sidebar-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={cn(
                    "sidebar-item w-full text-left",
                    activeView === item.id && "active"
                  )}
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer with Settings */}
        <div className="p-3 border-t border-sidebar-border">
          <button className="sidebar-item w-full text-left">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile Menu Toggle */}
      <Button 
        variant="outline" 
        size="icon"
        className="fixed bottom-4 right-4 z-40 md:hidden shadow-lg rounded-full"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>
    </>
  );
};

export default Sidebar;
