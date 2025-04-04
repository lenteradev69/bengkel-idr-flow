
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type ProductCategory = 'spare-part' | 'oil' | 'repair' | 'accessory' | 'other';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  vehicles: Vehicle[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

// Default data
const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Oil Filter',
    category: 'spare-part',
    price: 45000,
    stock: 20,
    description: 'High quality oil filter for most Japanese vehicles'
  },
  {
    id: '2',
    name: 'Engine Oil (1L)',
    category: 'oil',
    price: 85000,
    stock: 15,
    description: '10W-40 synthetic engine oil, 1 liter'
  },
  {
    id: '3',
    name: 'Basic Service',
    category: 'repair',
    price: 250000,
    stock: 999,
    description: 'Basic service including oil change and inspection'
  },
  {
    id: '4',
    name: 'Brake Pad Set',
    category: 'spare-part',
    price: 375000,
    stock: 8,
    description: 'Front brake pad set for most sedan models'
  },
  {
    id: '5',
    name: 'Air Filter',
    category: 'spare-part',
    price: 65000,
    stock: 12,
    description: 'Standard air filter for most vehicles'
  }
];

const defaultCustomers: Customer[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    phone: '081234567890',
    vehicles: [
      {
        id: '1',
        make: 'Toyota',
        model: 'Avanza',
        year: 2018,
        licensePlate: 'B 1234 CD'
      }
    ]
  },
  {
    id: '2',
    name: 'Dewi Kusuma',
    phone: '087654321098',
    vehicles: [
      {
        id: '1',
        make: 'Honda',
        model: 'Jazz',
        year: 2020,
        licensePlate: 'B 5678 EF'
      }
    ]
  }
];

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-12-01T10:30:00',
    customerId: '1',
    customerName: 'Budi Santoso',
    items: [
      {
        id: '1',
        productId: '2',
        name: 'Engine Oil (1L)',
        price: 85000,
        quantity: 4
      },
      {
        id: '2',
        productId: '1',
        name: 'Oil Filter',
        price: 45000,
        quantity: 1
      }
    ],
    subtotal: 385000,
    discount: 0,
    tax: 38500,
    total: 423500
  }
];

// Context type
interface AppContextType {
  // Data
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  cartItems: CartItem[];
  
  // View state
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  
  // Cart operations
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  
  // Transaction operations
  checkout: (data: { customerId?: string; discount?: number; tax?: number }) => Transaction;
  
  // Calculations
  cartSubtotal: number;
  cartTax: number;
  cartDiscount: number;
  cartTotal: number;
  setCartTax: (tax: number) => void;
  setCartDiscount: (discount: number) => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  PRODUCTS: 'workshop-pos-products',
  CUSTOMERS: 'workshop-pos-customers',
  TRANSACTIONS: 'workshop-pos-transactions'
};

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App view state
  const [activeView, setActiveView] = useState('dashboard');
  
  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTax, setCartTax] = useState(10); // 10% tax rate
  const [cartDiscount, setCartDiscount] = useState(0);
  
  // Load data from localStorage on initial mount
  useEffect(() => {
    const loadedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const loadedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    const loadedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    
    setProducts(loadedProducts ? JSON.parse(loadedProducts) : defaultProducts);
    setCustomers(loadedCustomers ? JSON.parse(loadedCustomers) : defaultCustomers);
    setTransactions(loadedTransactions ? JSON.parse(loadedTransactions) : defaultTransactions);
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);
  
  // Product operations
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  // Customer operations
  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = {
      ...customer,
      id: Date.now().toString(),
    };
    setCustomers([...customers, newCustomer]);
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  // Cart operations
  const addToCart = (product: Product, quantity: number) => {
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      updateCartItem(existingItem.id, existingItem.quantity + quantity);
    } else {
      setCartItems([
        ...cartItems,
        {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity
        }
      ]);
    }
  };
  
  const updateCartItem = (id: string, quantity: number) => {
    setCartItems(
      cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCartItems([]);
  };
  
  // Cart calculations
  const cartSubtotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 0
  );
  
  const calculatedCartTax = (cartSubtotal * cartTax) / 100;
  const calculatedCartDiscount = (cartSubtotal * cartDiscount) / 100;
  const cartTotal = cartSubtotal + calculatedCartTax - calculatedCartDiscount;
  
  // Checkout function
  const checkout = (data: { customerId?: string; discount?: number; tax?: number }) => {
    const customer = data.customerId 
      ? customers.find(c => c.id === data.customerId) 
      : undefined;
      
    const discount = data.discount !== undefined ? data.discount : calculatedCartDiscount;
    const tax = data.tax !== undefined ? data.tax : calculatedCartTax;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerId: customer?.id,
      customerName: customer?.name,
      items: [...cartItems],
      subtotal: cartSubtotal,
      discount,
      tax,
      total: cartSubtotal + tax - discount
    };
    
    // Update stock levels
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && product.category !== 'repair') {
        updateProduct({
          ...product,
          stock: Math.max(0, product.stock - item.quantity)
        });
      }
    });
    
    // Add transaction to history
    setTransactions([transaction, ...transactions]);
    
    // Clear cart after checkout
    clearCart();
    
    return transaction;
  };
  
  const value: AppContextType = {
    // Data
    products,
    customers,
    transactions,
    cartItems,
    
    // View state
    activeView,
    setActiveView,
    
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Cart operations
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    
    // Transaction operations
    checkout,
    
    // Calculations
    cartSubtotal,
    cartTax,
    cartDiscount,
    cartTotal,
    setCartTax,
    setCartDiscount
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
