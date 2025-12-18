import React from "react";

const Loader = () => {
  return (
    <div>
      <style>{`
        /* Full screen overlay */
        #loader-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1000;
          background: white;
        }

        /* Centered loader with nested pseudo-elements */
        #loader {
          display: block;
          position: relative;
          left: 50%;
          top: 50%;
          width: 80px;
          height: 80px;
          margin: -40px 0 0 -40px;  /* negative half of width/height */
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: rgb(44, 249, 245);
          animation: spin 2s linear infinite;
        }
        #loader:before {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          right: 3px;
          bottom: 3px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #f9622c;
          animation: spin 3s linear infinite;
        }
        #loader:after {
          content: "";
          position: absolute;
          top: 8px;
          left: 8px;
          right: 8px;
          bottom: 8px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #280300;
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div id="loader-wrapper">
        <div id="loader"></div>
      </div>
    </div>
  );
};

export default Loader;
