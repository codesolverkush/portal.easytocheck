import React from 'react';
import Navbar from '../common/Navbar';

const ContactFormShimmer = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Navigation */}
      {/* <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="font-bold text-xl text-gray-800">ETC Portal</div>
            <div className="hidden md:flex space-x-4">
              {['Leads', 'Tasks', 'Contacts', 'Meetings', 'Org Register', 'Org Profile'].map((item) => (
                <div key={item} className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse h-8 w-48 bg-gray-200 rounded-md"></div>
            <div className="animate-pulse h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div> */}
      <Navbar/>
      
      {/* Contact Header */}
      <div className="container mx-auto px-4 py-4 flex items-center">
        <button className="mr-4">
          <div className="animate-pulse h-6 w-6 bg-gray-200 rounded"></div>
        </button>
        <div className="animate-pulse h-10 w-10 bg-red-400 rounded-full flex items-center justify-center text-white font-bold">
          <div className="opacity-0">K</div>
        </div>
        <div className="ml-4 animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
        <div className="ml-auto">
          <div className="animate-pulse h-8 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="container mx-auto px-4 border-b">
        <div className="flex space-x-8">
          {['Overview', 'Notes', 'Attachments', 'Activities', 'Deals'].map((tab, index) => (
            <div key={tab} className={`pb-3 px-2 ${index === 0 ? 'border-b-2 border-blue-500' : ''}`}>
              <div className={`animate-pulse h-5 ${index === 0 ? 'w-24 bg-blue-200' : 'w-20 bg-gray-200'} rounded`}></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex justify-between items-center mb-6">
            <div className="animate-pulse h-6 w-40 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-5 w-24 bg-blue-100 rounded text-blue-500"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
                <div className="relative overflow-hidden rounded">
                  <div className="animate-pulse h-8 bg-gray-100 rounded w-full"></div>
                  <div className="absolute inset-0">
                    <div className="shimmer-effect"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add shimmer effect styles
const styles = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.shimmer-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.5s infinite;
}
`;

const ShimmerPage = () => {
  return (
    <>
      <style>{styles}</style>
      <ContactFormShimmer />
    </>
  );
};

export default ShimmerPage;