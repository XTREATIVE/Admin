// pages/customerDetails.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import StatsCard from "../components/Cards";
import CustomerDetailCard from "../components/customer_details";
import DeliveryDetailsCard from "../components/DeliveryDetailsCard";
import TransactionHistoryCard from "../components/customer_transaction_history";
import Shirt from "../assets/shirt.jpg";
import Sweater from "../assets/sweater.jpg";
import Bag from "../assets/Bag.jpg";

export default function CustomerDetails() {
  // Pull the `customer` object from location.state
  const location = useLocation();
  const { customer } = location.state || {};

  // Dummy stats data
  const statsData = [
    { title: "Items Purchased", value: "1,250" },
    { title: "Total Spend",    value: "UGX 12,345" },
    { title: "Orders Made",    value: "8,765" },
  ];

  // Dummy cart details with image, size, color, material
  const cartData = [
    {
      id: 1,
      name: "Bag",
      quantity: 2,
      price: "UGX 5,000",
      image: Bag,
      size: 30,
      color: "White",
      material: "Cotton",
    },
    {
      id: 2,
      name: "Shirt",
      quantity: 1,
      price: "UGX 3,200",
      image: Shirt,
      size: 30,
      color: "Black",
      material: "Cotton",
    },
    {
      id: 3,
      name: "Sweater",
      quantity: 4,
      price: "UGX 2,500",
      image: Sweater,
      size: 30,
      color: "Black",
      material: "Cotton",
    },
  ];

  // Calculate total cart amount
  const totalAmount = cartData.reduce((sum, item) => {
    // Extract numeric value from price string
    const numeric = parseInt(item.price.replace(/[^0-9]/g, ''), 10) || 0;
    return sum + numeric * item.quantity;
  }, 0);

  // Format total with UGX prefix and thousand separators
  const formattedTotal = `UGX ${totalAmount.toLocaleString()}`;

  return (
    <div className="h-screen flex flex-col font-poppins">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 bg-gray-100 ml-[80px] overflow-y-auto">
          {/* Layout: 
              Left column => CustomerDetailCard + DeliveryDetailsCard
              Right column => StatsCards + Transaction History/Cart cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* Left column */}
            <div className="lg:col-span-1 space-y-4">
              <CustomerDetailCard customer={customer} />
              <DeliveryDetailsCard details={customer?.deliveryDetails} />
            </div>

            {/* Right column */}
            <div className="lg:col-span-3 space-y-4">
              {/* Three stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {statsData.map((stat) => (
                  <StatsCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                  />
                ))}
              </div>

              {/* Transaction History and Cart divided into a 3-column grid */}
              <div className="grid grid-cols-3 gap-4">
                {/* Transaction History Card spanning two columns */}
                <div className="col-span-3 md:col-span-2">
                  <TransactionHistoryCard transactions={customer?.transactions || []} />
                </div>

                {/* Cart Card spanning one column with fixed max width */}
                <div className="bg-white p-4 rounded shadow col-span-3 md:col-span-1 max-w-sm mx-auto flex flex-col">
                  <h2 className="text-sm font-semibold mb-2">
                    Cart
                  </h2>
                  <ul className="flex-1 text-[12px] text-gray-700 space-y-4">
                    {cartData.map(item => (
                      <li key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                          <div>
                            <p className="text-[11px] font-medium">
                              {item.name} x{item.quantity}
                            </p>
                            <p className="text-[9px]">
                              Size: {item.size} | Color: {item.color} | Material: {item.material}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium ml-4 text-[11px]">
                          {item.price}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Total amount section */}
                  <div className="border-t pt-2 mt-2 flex justify-between items-center">
                    <span className="text-[12px] font-semibold">Total:</span>
                    <span className="text-[12px] font-semibold">{formattedTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
