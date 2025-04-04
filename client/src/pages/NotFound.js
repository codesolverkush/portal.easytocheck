import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-gray-800">404</h1>
        <div className="inline-block relative">
          <div className="absolute inset-0 bg-blue-500 transform -skew-x-12"></div>
          <h2 className="relative text-xl md:text-3xl font-semibold text-white px-4 py-2">
            Page Not Found
          </h2>
        </div>
        <p className="mt-6 text-gray-600 text-lg">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block mt-8 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg 
                     hover:bg-blue-600 transition-colors duration-300 focus:outline-none focus:ring-2 
                     focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 