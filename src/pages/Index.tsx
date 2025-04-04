
import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ProductManagement from '@/components/ProductManagement';
import POS from '@/components/POS';
import CustomerManagement from '@/components/CustomerManagement';
import TransactionHistory from '@/components/TransactionHistory';
import { AppProvider, useApp } from '@/contexts/AppContext';

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
    <main className="flex-1 p-4 md:p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {renderView()}
      </div>
    </main>
  );
};

// App layout component
const AppLayout: React.FC = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex-1 md:ml-64 flex flex-col">
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
