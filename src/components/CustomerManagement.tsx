import React, { useState } from 'react';
import { useApp, Customer, Vehicle } from '@/contexts/AppContext';
import { formatIDR } from '@/utils/currencyFormatter';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Plus, Edit, Trash2, User, Car, History, X } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const CustomerManagement: React.FC = () => {
  const { customers, transactions, addCustomer, updateCustomer, deleteCustomer } = useApp();
  const { toast } = useToast();
  
  // State for customer dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  // State for the form
  const [formState, setFormState] = useState<{
    name: string;
    phone: string;
    vehicles: Vehicle[];
  }>({
    name: '',
    phone: '',
    vehicles: []
  });
  
  // State for vehicle form
  const [vehicleForm, setVehicleForm] = useState<Omit<Vehicle, 'id'>>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: ''
  });
  
  // Current customer
  const currentCustomer = selectedCustomerId 
    ? customers.find(c => c.id === selectedCustomerId) 
    : null;
  
  // Customer's transactions
  const customerTransactions = selectedCustomerId
    ? transactions.filter(t => t.customerId === selectedCustomerId)
    : [];
  
  // Filtered customers
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };
  
  // Handle vehicle input changes
  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'year') {
      setVehicleForm({
        ...vehicleForm,
        year: parseInt(value) || new Date().getFullYear()
      });
    } else {
      setVehicleForm({
        ...vehicleForm,
        [name]: value
      });
    }
  };
  
  // Open dialog for adding new customer
  const openAddDialog = () => {
    setIsEditing(false);
    setFormState({
      name: '',
      phone: '',
      vehicles: []
    });
    setDialogOpen(true);
  };
  
  // Open dialog for editing customer
  const openEditDialog = (customer: Customer) => {
    setIsEditing(true);
    setFormState({
      name: customer.name,
      phone: customer.phone,
      vehicles: [...customer.vehicles]
    });
    setDialogOpen(true);
  };
  
  // Add vehicle to form
  const addVehicleToForm = () => {
    if (!vehicleForm.make || !vehicleForm.model || !vehicleForm.licensePlate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all vehicle fields'
      });
      return;
    }
    
    setFormState({
      ...formState,
      vehicles: [
        ...formState.vehicles,
        {
          id: Date.now().toString(),
          ...vehicleForm
        }
      ]
    });
    
    // Reset vehicle form
    setVehicleForm({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: ''
    });
  };
  
  // Remove vehicle from form
  const removeVehicleFromForm = (id: string) => {
    setFormState({
      ...formState,
      vehicles: formState.vehicles.filter(v => v.id !== id)
    });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.name || !formState.phone) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Name and phone are required'
      });
      return;
    }
    
    if (isEditing && selectedCustomerId) {
      updateCustomer({
        id: selectedCustomerId,
        ...formState
      });
      toast({
        title: 'Success',
        description: 'Customer updated successfully'
      });
    } else {
      addCustomer(formState);
      toast({
        title: 'Success',
        description: 'Customer added successfully'
      });
    }
    
    setDialogOpen(false);
  };
  
  // Handle delete
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteCustomer(id);
      
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
        setViewMode('list');
      }
      
      toast({
        title: 'Success',
        description: 'Customer deleted successfully'
      });
    }
  };
  
  // View customer details
  const viewCustomerDetails = (id: string) => {
    setSelectedCustomerId(id);
    setViewMode('detail');
  };
  
  // Back to list view
  const backToList = () => {
    setViewMode('list');
    setSelectedCustomerId(null);
  };
  
  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        /* List View */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Customer Management</h1>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Customers Table */}
          {filteredCustomers.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map(customer => (
                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => viewCustomerDetails(customer.id)}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.vehicles.length > 0 ? customer.vehicles.length : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(customer)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(customer.id, customer.name)}
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
              <User className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Add some customers to get started'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Detail View */
        <>
          {currentCustomer && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={backToList}>
                  <X className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold">{currentCustomer.name}</h1>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Customer Info */}
                <div className="flex-1 space-y-4">
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{currentCustomer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{currentCustomer.phone}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Vehicles</h2>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDialog(currentCustomer)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </div>
                    
                    {currentCustomer.vehicles.length > 0 ? (
                      <div className="space-y-3">
                        {currentCustomer.vehicles.map(vehicle => (
                          <div key={vehicle.id} className="border rounded p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                                <div className="text-sm text-muted-foreground">
                                  License Plate: {vehicle.licensePlate}
                                </div>
                              </div>
                              <Car className="h-5 w-5 text-muted" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Car className="h-8 w-8 text-muted mb-2" />
                        <p className="text-muted-foreground">No vehicles added yet</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Transaction History */}
                <div className="flex-1">
                  <div className="border rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
                    
                    {customerTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {customerTransactions.map(tx => (
                          <div key={tx.id} className="border rounded p-3">
                            <div className="flex justify-between">
                              <div className="font-medium">
                                {new Date(tx.date).toLocaleDateString()}
                              </div>
                              <div className="font-medium currency">{formatIDR(tx.total)}</div>
                            </div>
                            
                            <div className="mt-2 text-sm">
                              <h4 className="text-muted-foreground mb-1">Items:</h4>
                              <ul className="space-y-1">
                                {tx.items.map(item => (
                                  <li key={item.id} className="flex justify-between">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span className="currency">{formatIDR(item.price * item.quantity)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <History className="h-8 w-8 text-muted mb-2" />
                        <p className="text-muted-foreground">No transactions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Add/Edit Customer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="info">Customer Info</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="mt-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Customer Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="vehicles" className="mt-4">
                <div className="space-y-4">
                  {/* Existing Vehicles */}
                  {formState.vehicles.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      <h3 className="text-sm font-medium">Customer Vehicles</h3>
                      {formState.vehicles.map(vehicle => (
                        <div key={vehicle.id} className="flex items-center justify-between border p-3 rounded-md">
                          <div>
                            <div className="font-medium">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle.licensePlate}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeVehicleFromForm(vehicle.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border rounded-md text-muted-foreground mb-6">
                      No vehicles added yet
                    </div>
                  )}
                  
                  {/* Add New Vehicle */}
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-4">Add Vehicle</h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="make">Make</Label>
                          <Input
                            id="make"
                            name="make"
                            value={vehicleForm.make}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="model">Model</Label>
                          <Input
                            id="model"
                            name="model"
                            value={vehicleForm.model}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            name="year"
                            type="number"
                            value={vehicleForm.year}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="licensePlate">License Plate</Label>
                          <Input
                            id="licensePlate"
                            name="licensePlate"
                            value={vehicleForm.licensePlate}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={addVehicleToForm}
                        className="w-full mt-2"
                      >
                        Add Vehicle
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update' : 'Add'} Customer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerManagement;
