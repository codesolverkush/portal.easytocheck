const CrmLoader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 z-50">
      <div className="relative flex flex-col items-center p-8">
        {/* Main loader animation */}
        <div className="relative w-24 h-24 mb-6">
          {/* Rotating outer ring */}
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-violet-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Middle ring */}
          <div className="absolute top-2 right-2 bottom-2 left-2 border-4 border-t-transparent border-r-transparent border-b-indigo-400 border-l-indigo-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Inner content */}
          <div className="absolute top-6 right-6 bottom-6 left-6 bg-white rounded-full shadow-inner flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full animate-pulse" />
          </div>
          
        </div>
        
        {/* Text content */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            Preparing Your Admin Panel
          </h3>
          <p className="text-sm text-gray-500">
            <span className="inline-flex ml-1 overflow-hidden">
              <span className="animate-pulse" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '300ms' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '600ms' }}>.</span>
            </span>
          </p>
        </div>
        
        {/* Optional company logo */}
       
      </div>
    </div>
  );
};

export default CrmLoader;