<<<<<<< HEAD
// src/main.jsx
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
import { DateProvider } from './context/datecontext'
=======
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CurrencyProvider>
<<<<<<< HEAD
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
=======
      <LoansProvider>
        <PayoutsProvider>
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
        </PayoutsProvider>
      </LoansProvider>
    </CurrencyProvider>
    <ToastContainer position="bottom-right" autoClose={3000} />
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  </React.StrictMode>
);