
import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatIDR } from '@/utils/currencyFormatter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpRight, 
  Users, 
  Package, 
  Receipt, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

const Dashboard: React.FC = () => {
  const { transactions, products, customers } = useApp();
  
  // Calculate today's revenue
  const today = new Date().toISOString().split('T')[0];
  const todayRevenue = transactions
    .filter(t => t.date.startsWith(today))
    .reduce((sum, t) => sum + t.total, 0);
  
  // Calculate this month's revenue
  const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  const monthlyRevenue = transactions
    .filter(t => t.date.startsWith(thisMonth))
    .reduce((sum, t) => sum + t.total, 0);
  
  // Low stock items
  const lowStockThreshold = 5;
  const lowStockItems = products
    .filter(p => p.stock < lowStockThreshold && p.category !== 'repair')
    .slice(0, 5);
  
  // Last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const dailyData = last7Days.map(date => {
    const dayRevenue = transactions
      .filter(t => t.date.startsWith(date))
      .reduce((sum, t) => sum + t.total, 0);
      
    return {
      date: date.slice(5), // Just show MM-DD
      revenue: dayRevenue
    };
  });
  
  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="text-sm">{`Date: ${label}`}</p>
          <p className="text-sm font-semibold">{`Revenue: ${formatIDR(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold currency">
                {formatIDR(todayRevenue)}
              </div>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold currency">
                {formatIDR(monthlyRevenue)}
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {products.length}
              </div>
              <Package className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {customers.length}
              </div>
              <Users className="h-4 w-4 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    tickFormatter={(value) => formatIDR(value).substring(0, 4)} 
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#3670ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Transactions & Low Stock */}
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockItems.length > 0 ? (
              <ul className="space-y-3">
                {lowStockItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.stock} units left
                      </div>
                    </div>
                    <div className={`py-1 px-2 rounded-full text-xs ${
                      item.stock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.stock === 0 ? 'Out of stock' : 'Low stock'}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Package className="h-10 w-10 mb-2 text-muted" />
                <p>No low stock items</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Date</th>
                    <th className="text-left py-3 font-medium">Customer</th>
                    <th className="text-right py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 5).map(tx => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="py-3">{tx.customerName || 'Walk-in Customer'}</td>
                      <td className="py-3 text-right currency">{formatIDR(tx.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
              <Receipt className="h-10 w-10 mb-2 text-muted" />
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
