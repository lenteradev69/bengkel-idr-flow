
import React, { useState } from 'react';
import { useApp, Product, ProductCategory } from '@/contexts/AppContext';
import { formatIDR } from '@/utils/currencyFormatter';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const ProductManagement: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const { toast } = useToast();
  
  // State for product dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // State for the form
  const [formState, setFormState] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'spare-part',
    price: 0,
    stock: 0,
    description: ''
  });
  
  // State for the product being edited
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price' || name === 'stock') {
      setFormState({
        ...formState,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };
  
  // Handle category change
  const handleCategoryChange = (value: ProductCategory) => {
    setFormState({
      ...formState,
      category: value
    });
  };
  
  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Open dialog for adding new product
  const openAddDialog = () => {
    setIsEditing(false);
    setCurrentProductId(null);
    setFormState({
      name: '',
      category: 'spare-part',
      price: 0,
      stock: 0,
      description: ''
    });
    setDialogOpen(true);
  };
  
  // Open dialog for editing product
  const openEditDialog = (product: Product) => {
    setIsEditing(true);
    setCurrentProductId(product.id);
    setFormState({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      description: product.description || ''
    });
    setDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Product name is required'
      });
      return;
    }
    
    if (isEditing && currentProductId) {
      updateProduct({
        id: currentProductId,
        ...formState
      });
      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });
    } else {
      addProduct(formState);
      toast({
        title: 'Success',
        description: 'Product added successfully'
      });
    }
    
    setDialogOpen(false);
  };
  
  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProduct(id);
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: ProductCategory): string => {
    const labels: Record<ProductCategory, string> = {
      'spare-part': 'Spare Part',
      'oil': 'Oil',
      'repair': 'Repair Service',
      'accessory': 'Accessory',
      'other': 'Other'
    };
    
    return labels[category] || category;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      {/* Search and Filter */}
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
      
      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    {product.name}
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                        {product.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{getCategoryLabel(product.category)}</TableCell>
                  <TableCell className="text-right currency">{formatIDR(product.price)}</TableCell>
                  <TableCell className="text-right">
                    {product.category === 'repair' ? 'N/A' : product.stock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(product.id, product.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Package className="h-12 w-12 text-muted mb-4" />
          <h3 className="text-lg font-medium">No products found</h3>
          <p className="text-muted-foreground mt-1">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter'
              : 'Add some products to get started'}
          </p>
        </div>
      )}
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formState.category}
                  onValueChange={(value) => handleCategoryChange(value as ProductCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spare-part">Spare Part</SelectItem>
                    <SelectItem value="oil">Oil</SelectItem>
                    <SelectItem value="repair">Repair Service</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="price">Price (IDR)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formState.price}
                  onChange={handleInputChange}
                  min={0}
                  required
                />
              </div>
              
              {formState.category !== 'repair' && (
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formState.stock}
                    onChange={handleInputChange}
                    min={0}
                    required
                  />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Add'} Product
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;
