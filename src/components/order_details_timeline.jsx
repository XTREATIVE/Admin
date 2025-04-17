import React from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const OrderTimeline = () => {
  const events = [
    {
      title: "Payment Confirmed",
      desc: "Payment confirmed by our gateway.",
      time: "April 23, 2024, 09:00 am",
      icon: <FaCheckCircle className="text-green-500 text-sm" />,
    },
    {
      title: "Order Confirmed",
      desc: "Order has been received and confirmed.",
      time: "April 23, 2024, 09:10 am",
      icon: <FaCheckCircle className="text-green-500 text-sm" />,
      vendors: [
        { name: "Ian Alinatwe", confirmed: true },
        { name: "Janet Asiimwe", confirmed: true },
        { name: "Claire Jenny", confirmed: true },
      ],
    },
    {
      title: "Order Processing",
      desc: "Items are being shipped , quality checked & packaged for Delivery.",
      time: "April 23, 2024, 09:40 am",
      // A spinner to indicate the order is currently processing
      icon: (
        <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full" />
      ),
    },
    {
      title: "Order Delivering",
      desc: "Order is on its way to the customer.",
      time: "April 23, 2024, 10:30 am",
      icon: <FaCheckCircle className="text-green-500 text-sm" />,
    },
    {
      title: "Order Delivered",
      desc: "Order was delivered successfully.",
      time: "April 23, 2024, 02:00 pm",
      icon: <FaCheckCircle className="text-green-500 text-sm" />,
    },
  ];

  // Custom order without "Payment Initiated"
  const customOrder = {
    "Payment Confirmed": 1,
    "Order Received": 2,
    "Order Processing": 3,
    "Order Delivering": 4,
    "Order Delivered": 5,
  };

  // Create a sorted array based on the custom order
  const sortedEvents = events.sort(
    (a, b) => customOrder[a.title] - customOrder[b.title]
  );

  // Get the order value for "Order Processing"
  const orderProcessingValue = customOrder["Order Processing"];

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-200">
        <h4
          style={{ fontSize: "11px", color: "#280300" }}
          className="mb-0 font-medium"
        >
          Order Timeline
        </h4>
      </div>

      {/* Card Content */}
      <div className="p-6 relative">
        {/* Solid vertical line centered behind the icons */}
        <div className="absolute left-10 top-0 h-full border-l border-gray-200" />

        <div className="space-y-8">
          {sortedEvents.map((event, index) => {
            const eventOrder = customOrder[event.title];
            // If the event comes after "Order Processing" and Order Processing is loading
            const isAfterProcessing =
              eventOrder > orderProcessingValue;

            return (
              <div key={index} className="flex items-start relative">
                {/* Circular container for each icon */}
                <div className="absolute left-4 transform -translate-x-1/2 bg-[#f8fbfd] rounded-full w-10 h-10 flex items-center justify-center">
                  {isAfterProcessing ? (
                    <FaRegCircle className="text-gray-300 text-sm" />
                  ) : (
                    event.icon
                  )}
                </div>

                {/* Content offset to the right */}
                <div className="ml-14">
                  <h5
                    style={{ fontSize: "11px", color: "#280300" }}
                    className="font-medium"
                  >
                    {event.title}
                  </h5>
                  {event.desc && (
                    <p
                      className="mt-1 text-gray-500"
                      style={{ fontSize: "11px" }}
                    >
                      {event.desc}
                    </p>
                  )}
                  {/* For Order Received, render the vendor confirmation list if present */}
                  {event.title === "Order Received" && event.vendors && (
                    <div className="mt-2">
                      <p
                        className="text-gray-500"
                        style={{ fontSize: "11px" }}
                      >
                        Vendors
                      </p>
                      <ul className="mt-1 space-y-1">
                        {event.vendors.map((vendor, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-gray-500"
                            style={{ fontSize: "11px" }}
                          >
                            {vendor.confirmed && (
                              <FaCheckCircle className="text-green-500 text-xs mr-1" />
                            )}
                            {vendor.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p
                    className="mt-2 text-gray-500"
                    style={{ fontSize: "11px" }}
                  >
                    {event.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
