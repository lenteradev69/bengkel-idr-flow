
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatIDR } from '@/utils/currencyFormatter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Calendar, 
  ChevronDown, 
  Receipt,
  DownloadCloud
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const TransactionHistory: React.FC = () => {
  const { transactions, customers } = useApp();
  const { toast } = useToast();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  
  // Filtered transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.includes(searchTerm) ||
      (transaction.customerName && 
        transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCustomer = 
      selectedCustomerId === 'all' || 
      transaction.customerId === selectedCustomerId;
    
    const transactionDate = new Date(transaction.date);
    
    const matchesDateFrom = 
      !dateFrom || 
      transactionDate >= new Date(dateFrom);
    
    const matchesDateTo = 
      !dateTo || 
      transactionDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesCustomer && matchesDateFrom && matchesDateTo;
  });
  
  // View receipt
  const viewReceipt = (transaction: any) => {
    setSelectedTransaction(transaction);
    setReceiptDialogOpen(true);
  };
  
  // Handle print receipt
  const printReceipt = () => {
    // In a real app, this would connect to a printer
    // For now, we'll just show a toast
    toast({
      title: 'Success',
      description: 'Receipt printed successfully'
    });
  };
  
  // Handle export transactions
  const exportTransactions = () => {
    // In a real app, this would generate a CSV/Excel file
    // For now, we'll just show a toast
    toast({
      title: 'Success',
      description: 'Transactions exported successfully'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <Button variant="outline" onClick={exportTransactions}>
          <DownloadCloud className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Search and Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select 
          value={selectedCustomerId} 
          onValueChange={(value) => setSelectedCustomerId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Customers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers.map(customer => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="Date from"
            className="pl-9"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="Date to"
            className="pl-9"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>
      
      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Receipt #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                    <div className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.id}</TableCell>
                  <TableCell>
                    {transaction.customerName || 'Walk-in Customer'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="mr-1">{transaction.items.length}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium currency">
                    {formatIDR(transaction.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewReceipt(transaction)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Receipt className="h-12 w-12 text-muted mb-4" />
          <h3 className="text-lg font-medium">No transactions found</h3>
          <p className="text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
      
      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold">Bengkel POS</h3>
                <p className="text-muted-foreground">
                  Receipt #{selectedTransaction.id}
                </p>
                <p className="text-muted-foreground">
                  {new Date(selectedTransaction.date).toLocaleString()}
                </p>
              </div>
              
              <div>
                <p><strong>Customer:</strong> {selectedTransaction.customerName || 'Walk-in Customer'}</p>
              </div>
              
              <div className="border-t border-b py-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Item</th>
                      <th className="text-right py-1">Price</th>
                      <th className="text-right py-1">Qty</th>
                      <th className="text-right py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.items.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-1">{item.name}</td>
                        <td className="text-right py-1 currency">{formatIDR(item.price)}</td>
                        <td className="text-right py-1">{item.quantity}</td>
                        <td className="text-right py-1 currency">{formatIDR(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="currency">{formatIDR(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="currency">{formatIDR(selectedTransaction.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="currency">{formatIDR(selectedTransaction.discount)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="currency">{formatIDR(selectedTransaction.total)}</span>
                </div>
              </div>
              
              <div className="text-center text-muted-foreground text-sm pt-4 border-t">
                <p>Thank you for your business!</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={printReceipt}>
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionHistory;
