import React from "react";
import { FaCheckCircle } from "react-icons/fa";

export const TimelineSection = () => {
  const events = [
    {
      title: "The packing has been started",
      desc: "Confirmed by Gaston Lapierre",
      time: "April 23, 2024, 09:40 am",
      icon: (
        <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full" />
      ),
    },
    {
      title: "The Invoice has been sent to the customer",
      desc: (
        <span>
          Invoice email was sent to{" "}
          <a
            href="#!"
            style={{ fontSize: "13px", color: "#280300" }}
            className="text-blue-600"
          >
            hello@dundermuffilin.com
          </a>
        </span>
      ),
      action: (
        <button
          style={{
            fontSize: "11px",
            backgroundColor: "#f9622c",
            color: "#fff",
          }}
          className="px-3 py-1 rounded hover:bg-opacity-90 text-sm"
        >
          Resend Invoice
        </button>
      ),
      time: "April 23, 2024, 09:40 am",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
    },
    {
      title: "The Invoice has been created",
      desc: "Invoice created by Gaston Lapierre",
      action: (
        <button
          style={{
            fontSize: "11px",
            backgroundColor: "#f9622c",
            color: "#fff",
          }}
          className="px-3 py-1 rounded hover:bg-opacity-90 text-sm"
        >
          Download Invoice
        </button>
      ),
      time: "April 23, 2024, 09:40 am",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
    },
    {
      title: "Order Payment",
      desc: "Using Master Card",
      status: (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
          Paid
        </span>
      ),
      time: "April 23, 2024, 09:40 am",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
    },
    {
      title: "4 Orders confirmed by Gaston Lapierre",
      desc: (
        <div className="flex flex-wrap gap-2">
          {["Order 1", "Order 2", "Order 3", "Order 4"].map((o) => (
            <a
              key={o}
              href="#!"
              style={{ fontSize: "11px", color: "#000" }}
              className="px-2 py-1 bg-gray-100 rounded"
            >
              {o}
            </a>
          ))}
        </div>
      ),
      time: "April 23, 2024, 09:40 am",
      icon: <FaCheckCircle className="text-green-500 text-xl" />,
    },
  ];

  return (
    <div>
      <div className="p-6 border-b border-gray-200">
        <h4 style={{ fontSize: "13px", color: "#280300" }} className="mb-4">
          Order Timeline
        </h4>
      </div>
      <div className="p-6 relative">
        <div className="absolute left-2 top-0 h-full border-l-2 border-dashed border-gray-300"></div>
        <div className="space-y-8 pl-6">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-3 top-0 bg-white p-1 rounded-full">
                {e.icon}
              </div>
              <div className="ml-4">
                <h5
                  style={{ fontSize: "13px", color: "#280300" }}
                  className="font-medium"
                >
                  {e.title}
                </h5>
                {e.desc && (
                  <p
                    style={{ fontSize: "11px", color: "#000" }}
                    className="mt-1"
                  >
                    {e.desc}
                  </p>
                )}
                {e.status && <div className="mt-1">{e.status}</div>}
                {e.action && <div className="mt-2">{e.action}</div>}
                <p style={{ fontSize: "11px", color: "#000" }} className="mt-2">
                  {e.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
