import React, { createContext, useState, useEffect } from "react";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    async function fetchPaymentMethods() {
      try {
        const response = await fetch(
          "https://api-xtreative.onrender.com/customers/payment-methods/"
        );
        const data = await response.json();
        setPaymentMethods(data);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    }
    fetchPaymentMethods();
  }, []);

  return (
    <PaymentContext.Provider value={{ paymentMethods }}>
      {children}
    </PaymentContext.Provider>
  );
};
