import React from "react";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

const OrderTimeline = ({ steps, currentStep }) => {
  // Get current time for dynamic updates
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Map steps to timeline events with dynamic time
  const events = steps.map((step, index) => ({
    title: step.label,
    desc: getDescription(step.label),
    time: index <= currentStep ? `${formatDate(now)} ${formattedTime}` : "",
    icon: index < currentStep ? <FaCheckCircle className="text-green-500 text-sm" /> : 
           index === currentStep ? <div className="animate-spin h-5 w-5 border-2 border-yellow-500 border-t-transparent rounded-full" /> : 
           <FaRegCircle className="text-gray-300 text-sm" />,
  }));

  // Custom order for sorting
  const customOrder = {
    "Payment Confirmed": 1,
    "Order Confirmed": 2,
    "Order Processing": 3,
    "Order Delivering": 4,
    "Order Delivered": 5,
  };

  // Create a sorted array based on the custom order
  const sortedEvents = events.sort(
    (a, b) => customOrder[a.title] - customOrder[b.title]
  );

  // Utility: format JS Date → "4th April 2025"
  function formatDate(dateObj) {
    const day = dateObj.getDate();
    const ordinal = getOrdinalSuffix(day);
    const month = dateObj.toLocaleString("en-GB", { month: "long" });
    const year = dateObj.getFullYear();
    return `${day}${ordinal} ${month} ${year}`;
  }

  // Utility: get "st"/"nd"/"rd"/"th" suffix for dates
  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  }

  // Descriptions for each step
  function getDescription(title) {
    switch (title) {
      case "Payment Confirmed":
        return "Payment confirmed by our gateway.";
      case "Order Confirmed":
        return "Order has been received and confirmed.";
      case "Order Processing":
        return "Items are being shipped, quality checked & packaged for Delivery.";
      case "Order Delivering":
        return "Order is on its way to the customer.";
      case "Order Delivered":
        return "Order was delivered successfully.";
      default:
        return "";
    }
  }

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
          {sortedEvents.map((event, index) => (
            <div key={index} className="flex items-start relative">
              {/* Circular container for each icon */}
              <div className="absolute left-4 transform -translate-x-1/2 bg-[#f8fbfd] rounded-full w-10 h-10 flex items-center justify-center">
                {event.icon}
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
                {event.time && (
                  <p
                    className="mt-2 text-gray-500"
                    style={{ fontSize: "11px" }}
                  >
                    {event.time}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default OrderTimeline;