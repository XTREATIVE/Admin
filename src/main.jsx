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
import {PaymentProvider} from './context/paymentcontext'
import { LoansProvider } from './context/loanscontext';
import {ClaimsProvider} from './context/claimscontext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

<LoansProvider>
    <PaymentProvider>
 <AllProductsProvider>
<OrdersProvider>
<ClaimsProvider>
    <UserProvider>

    <ProductProvider>
      <BrowserRouter>
      <App />
    </BrowserRouter>
    </ProductProvider>
    </UserProvider>
    </ClaimsProvider>
    </OrdersProvider>
    </AllProductsProvider>
    </PaymentProvider>
    </LoansProvider>
   
  </React.StrictMode>
);
