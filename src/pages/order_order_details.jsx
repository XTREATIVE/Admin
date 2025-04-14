
import React from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/header";
import Order from "../components/order_left_section";

const Order_Details = () => {
  return (
    <div className="h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 bg-gray-100 ml-[80px]">
          <Order />
        </main>
      </div>
    </div>
  );
};

export default Order_Details;
