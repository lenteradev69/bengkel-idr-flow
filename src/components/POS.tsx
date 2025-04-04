import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatIDR } from '@/utils/currencyFormatter';
import { printReceipt, downloadReceiptAsPDF } from '@/utils/receiptUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Receipt } from '@/components/ui/receipt';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  X,
  Receipt as ReceiptIcon,
  Tag,
  Printer,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const POS: React.FC = () => {
  const { 
    products, 
    customers, 
    cartItems, 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart,
    cartSubtotal,
    cartTotal,
    cartTax,
    cartDiscount,
    setCartTax,
    setCartDiscount,
    checkout
  } = useApp();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);
  
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleAddToCart = (product: any) => {
    if (product.category !== 'repair' && product.stock <= 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'This product is out of stock'
      });
      return;
    }
    
    addToCart(product, 1);
    toast({
      title: 'Added to cart',
      description: `${product.name} added to cart`
    });
  };
  
  const handleQuantityChange = (item: any, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(item.id);
      return;
    }
    
    const product = products.find(p => p.id === item.productId);
    if (product && product.category !== 'repair' && newQuantity > product.stock) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Only ${product.stock} units available in stock`
      });
      return;
    }
    
    updateCartItem(item.id, newQuantity);
  };
  
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cart is empty'
      });
      return;
    }
    
    setCheckoutDialogOpen(true);
  };
  
  const processCheckout = () => {
    const receipt = checkout({
      customerId: selectedCustomerId || undefined,
      discount: (cartSubtotal * cartDiscount) / 100,
      tax: (cartSubtotal * cartTax) / 100
    });
    
    setCurrentReceipt(receipt);
    setCheckoutDialogOpen(false);
    setReceiptDialogOpen(true);
    setCheckoutComplete(true);
  };
  
  const handlePrintReceipt = () => {
    printReceipt(receiptRef);
    
    toast({
      title: 'Success',
      description: 'Receipt sent to printer'
    });
  };
  
  const handleDownloadReceipt = () => {
    if (currentReceipt) {
      downloadReceiptAsPDF(receiptRef, currentReceipt);
      
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully'
      });
    }
  };
  
  const handleNewTransaction = () => {
    setReceiptDialogOpen(false);
    setCheckoutComplete(false);
    setSelectedCustomerId('');
  };
  
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => setSelectedCategory(value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="spare-part">Spare Parts</SelectItem>
                <SelectItem value="oil">Oil</SelectItem>
                <SelectItem value="repair">Repair Services</SelectItem>
                <SelectItem value="accessory">Accessories</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Tabs defaultValue="all" onValueChange={setSelectedCategory} value={selectedCategory}>
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="spare-part">Spare Parts</TabsTrigger>
              <TabsTrigger value="oil">Oil</TabsTrigger>
              <TabsTrigger value="repair">Services</TabsTrigger>
              <TabsTrigger value="accessory">Accessories</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:border-primary/50 transition-colors glass-card"
                onClick={() => handleAddToCart(product)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <Badge variant={product.category === 'repair' ? 'default' : 'outline'} className="animate-fade-in">
                      {product.category === 'spare-part' ? 'Part' : 
                       product.category === 'repair' ? 'Service' : 
                       product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </div>
                  
                  {product.description && (
                    <CardDescription className="line-clamp-2 min-h-[32px]">
                      {product.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="font-bold currency">
                    {formatIDR(product.price)}
                  </div>
                  
                  {product.category !== 'repair' && (
                    <div className={`text-sm ${product.stock <= 0 ? 'text-destructive' : ''}`}>
                      {product.stock <= 0 ? 'Out of stock' : `${product.stock} in stock`}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center border rounded-lg">
                <Search className="h-12 w-12 text-muted mb-4" />
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col glass-card shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" /> 
                  Cart
                </CardTitle>
                
                {cartItems.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-muted-foreground"
                    onClick={clearCart}
                  >
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              {cartItems.length > 0 ? (
                <ul className="space-y-3">
                  {cartItems.map(item => (
                    <li key={item.id} className="border-b pb-3 last:border-0 animate-fade-in">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground currency">
                            {formatIDR(item.price)} × {item.quantity}
                          </div>
                        </div>
                        <div className="font-medium currency whitespace-nowrap">
                          {formatIDR(item.price * item.quantity)}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-10 text-center">{item.quantity}</span>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="h-12 w-12 text-muted mb-4" />
                  <h3 className="text-lg font-medium">Your cart is empty</h3>
                  <p className="text-muted-foreground mt-1">
                    Add products to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer (Optional)</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Walk-in customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="walk-in">Walk-in customer</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="currency">{formatIDR(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({cartTax}%):</span>
                <span className="currency">{formatIDR((cartSubtotal * cartTax) / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({cartDiscount}%):</span>
                <span className="currency">{formatIDR((cartSubtotal * cartDiscount) / 100)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total:</span>
                <span className="currency">{formatIDR(cartTotal)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processCheckout}>
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
          </DialogHeader>
          
          {currentReceipt && (
            <div className="space-y-4">
              <Receipt 
                ref={receiptRef}
                transaction={currentReceipt}
              />
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handlePrintReceipt}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleDownloadReceipt}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex sm:justify-between">
            <Button variant="default" onClick={handleNewTransaction}>
              New Transaction
            </Button>
            
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
