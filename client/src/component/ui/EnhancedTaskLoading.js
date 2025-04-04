const EnhancedTaskLoading = () => {
    return (
      <div className="py-8 flex flex-col items-center justify-center">
        <div className="flex justify-center items-center space-x-2 mb-6">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        <p className="text-gray-600 font-medium mb-4">Loading your tasks...</p>
        
        {/* Loading skeleton for task cards */}
        <div className="w-full space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="bg-gray-200 rounded-full p-2 w-8 h-8"></div>
                  <div className="w-full">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-32 mt-3"></div>
                  </div>
                </div>
                <div className="bg-gray-200 rounded-full w-6 h-6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default EnhancedTaskLoading;