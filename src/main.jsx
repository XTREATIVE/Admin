// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import './index.css';

import "leaflet/dist/leaflet.css";
import { ProductProvider } from "./context/productcontext";
import { UserProvider } from "./context/usercontext";
import { OrdersProvider } from "./context/orderscontext";
import { AllProductsProvider } from './context/allproductscontext';
import { PaymentProvider } from './context/paymentcontext'
import { LoansProvider } from './context/loanscontext';
import { ClaimsProvider } from './context/claimscontext';
import { PayoutsProvider } from './context/payoutscontext'
import { CurrencyProvider } from './context/currencycontext'
import { DateProvider } from './context/datecontext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrencyProvider>
      <DateProvider>
        <UserProvider>
          <ProductProvider>
            <AllProductsProvider>
              <OrdersProvider>
                <ClaimsProvider>
                  <LoansProvider>
                    <PayoutsProvider>
                      <PaymentProvider>
                        <BrowserRouter>
                          <App />
                        </BrowserRouter>
                        <ToastContainer position="bottom-right" autoClose={3000} />
                      </PaymentProvider>
                    </PayoutsProvider>
                  </LoansProvider>
                </ClaimsProvider>
              </OrdersProvider>
            </AllProductsProvider>
          </ProductProvider>
        </UserProvider>
      </DateProvider>
    </CurrencyProvider>
  </React.StrictMode>
);