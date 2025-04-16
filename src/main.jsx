import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
 import './index.css';

 import "leaflet/dist/leaflet.css";
 import { ProductProvider } from "./context/productcontext";
 import { UserProvider } from "./context/usercontext";
 import { OrdersProvider } from "./context/orderscontext";
import { AllProductsProvider } from './context/allproductscontext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
 <AllProductsProvider>
<OrdersProvider>
    <UserProvider>

    <ProductProvider>
      <BrowserRouter>
      <App />
    </BrowserRouter>
    </ProductProvider>
    </UserProvider>
 
    </OrdersProvider>
    </AllProductsProvider>

  </React.StrictMode>
);
