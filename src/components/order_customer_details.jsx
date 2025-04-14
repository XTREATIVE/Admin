import React from "react";
import mtn from "../assets/mtn.jpg";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function OrderSummaryCard() {
  // Order details (could come from props or state)
  const subTotal = 50000; // in UGX
  const discountPercent = 0; // discount percent
  const deliveryCharge = 3000; // in UGX
  const taxPercent = 2.5; // tax percentage

  // Calculate discount and tax amounts automatically
  const discountAmount = subTotal * (discountPercent / 100);
  const taxAmount = subTotal * (taxPercent / 100);
  const totalAmount = subTotal - discountAmount + deliveryCharge + taxAmount;

  // Optional: Format values to a locale string (if needed)
  const formatPrice = (price) => `UGX ${price.toFixed(0)}`;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-[12px] font-semibold text-gray-800">Order Summary</h2>
      </div>
      {/* Order Summary Details */}
      <div className="p-6 border-t border-gray-200">
        <div className="text-[11px] text-gray-600 space-y-1">
          <p>
            Sub Total:
            <span className="float-right font-medium">{formatPrice(subTotal)}</span>
          </p>
          <p>
            Discount:
            <span className="float-right font-medium text-green-600">{discountPercent}%</span>
          </p>
          <p>
            Delivery Charge:
            <span className="float-right font-medium">{formatPrice(deliveryCharge)}</span>
          </p>
          <p>
            Estimated Tax ({taxPercent}%):
            <span className="float-right font-medium">{formatPrice(taxAmount)}</span>
          </p>
          <hr />
          <p className="font-semibold">
            Total Amount:
            <span className="float-right text-gray-800">{formatPrice(totalAmount)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentInformationCard() {
  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-[12px] font-semibold text-gray-800">Payment Information</h2>
      </div>
      {/* Payment Information Details */}
      <div className="p-6">
        {/* Payment Method Section */}
        <div className="flex items-center gap-4">
          <img src={mtn} alt="MTN logo" className="w-8 h-8" />
          <div>
            <p className="text-[11px] font-semibold text-gray-500">MTN Mobile Money</p>
            <p className="text-[11px] text-gray-600">+256 701 234567</p>
          </div>
        </div>
        {/* Divider */}
        <div className="mt-4 border-t border-dotted border-gray-200 pt-4">
          <div className="grid grid-cols-1 gap-2">
            <p className="text-[11px]">
              <span className="font-medium text-gray-600">Txn ID:</span>{" "}
              <span className="text-gray-600">#MTN768139059</span>
            </p>
            <p className="text-[11px]">
              <span className="font-medium text-gray-600">Account Holder Name:</span>{" "}
              <span className="text-gray-600">Alinatwe Ian</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailsPlaceholderCard() {
  const customerName = "Alinatwe James";
  // Extract the initials from the first two words and uppercase them
  const initials = customerName
    .split(" ")
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-[12px] font-semibold text-gray-800">Customer Details</h2>
      </div>
      {/* Customer Details */}
      <div className="p-6">
        {/* Top Section: Avatar, Name, and Email */}
        <div className="flex items-center space-x-4">
          {/* Avatar with Initials */}
          <div className="w-12 h-12 rounded-full bg-[#f9622c] flex items-center justify-center text-lg font-medium text-[#280300]">
            {initials}
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-800">{customerName}</p>
            <p className="text-[10px] text-gray-600">alitwejames@gmail.com</p>
          </div>
        </div>
        {/* Divider */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          {/* Contact Details */}
          <div className="mb-3">
            <p className="text-[10px] font-medium text-gray-600">Contact Number</p>
            <p className="text-[10px] text-gray-600">0774788071</p>
          </div>
          {/* Shipping Address */}
          <div>
            <p className="text-[10px] font-medium text-gray-800">Delivery Address</p>
            <p className="text-[10px] text-gray-600">
              1 Burton Street, P.O. Box 651
              <br />
              Pioneer Mall
              <br />
              Kampala, Uganda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


function MapDetailsCard() {
  // Delivery address coordinates for Kampala (approximate)
  const position = [0.3476, 32.5825];
  const deliveryAddress =
    "1 Burton Street, P.O. Box 651, Pioneer Mall, Kampala, Uganda";

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-[12px] font-semibold text-gray-800">Delivery Address Details</h2>
      </div>
      {/* Map */}
      <div className="p-6">
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-64 rounded-lg"
        >
          <TileLayer
            // Stadia Maps Outdoors: Google Maps-like street detail
            url="https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>, &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          />
          <Marker position={position}>
            <Popup>{deliveryAddress}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}



export default function CustomerDetailsCard() {
  return (
    <div className="space-y-4">
      <OrderSummaryCard />
      <PaymentInformationCard />
      <CustomerDetailsPlaceholderCard />
      <MapDetailsCard />
    </div>
  );
}
