
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ProductManagement from '@/components/ProductManagement';
import POS from '@/components/POS';
import CustomerManagement from '@/components/CustomerManagement';
import TransactionHistory from '@/components/TransactionHistory';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Main content component
const MainContent: React.FC = () => {
  const { activeView } = useApp();
  
  // Render the appropriate component based on the active view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'pos':
        return <POS />;
      case 'customers':
        return <CustomerManagement />;
      case 'transactions':
        return <TransactionHistory />;
      default:
        return <Dashboard />;
    }
  };
  
  return (
    <main className="flex-1 p-3 md:p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {renderView()}
      </div>
    </main>
  );
};

// Mobile header component
const MobileHeader: React.FC<{
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}> = ({ isMobileOpen, setMobileOpen }) => {
  const { activeView } = useApp();
  
  // Convert view name to display title
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return 'Dashboard';
      case 'products':
        return 'Product Management';
      case 'pos':
        return 'Point of Sale';
      case 'customers':
        return 'Customer Management';
      case 'transactions':
        return 'Transaction History';
      default:
        return 'Dashboard';
    }
  };
  
  return (
    <div className="md:hidden flex items-center justify-between bg-sidebar-background text-sidebar-foreground p-4 shadow-md">
      <button 
        onClick={() => setMobileOpen(!isMobileOpen)}
        className="p-2 rounded-md hover:bg-sidebar-accent/20"
      >
        <Menu size={24} />
      </button>
      <h1 className="text-lg font-semibold">{getViewTitle()}</h1>
      <div className="w-8"></div> {/* Placeholder for balance */}
    </div>
  );
};

// App layout component
const AppLayout: React.FC = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    if (!isMobile && isMobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, isMobileOpen]);
  
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 flex flex-col h-screen">
        <MobileHeader isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
        <MainContent />
      </div>
    </div>
  );
};

// Main Index component wrapped with AppProvider
const Index: React.FC = () => {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;
