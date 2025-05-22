const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 z-50">
      <div className="relative flex flex-col items-center p-8">
        {/* Main loader animation */}
        <div className="relative w-24 h-24 mb-6">
          {/* Rotating outer ring */}
          <div className="absolute inset-0 border-4 border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-violet-500 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Middle ring */}
          <div className="absolute top-2 right-2 bottom-2 left-2 border-4 border-t-transparent border-r-transparent border-b-indigo-400 border-l-indigo-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          
          {/* Inner content */}
          <div className="absolute top-6 right-6 bottom-6 left-6 bg-white dark:bg-gray-800 rounded-full shadow-inner flex items-center justify-center">
            <div className="w-6 h-6 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full animate-pulse" />
          </div>
          
        </div>
        
        {/* Text content */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
            Preparing Your Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading your CRM workspace
            <span className="inline-flex ml-1 overflow-hidden">
              <span className="animate-pulse" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '300ms' }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: '600ms' }}>.</span>
            </span>
          </p>
        </div>
        
        {/* Optional company logo */}
        <div className="mt-8 text-gray-400 dark:text-gray-500 text-sm font-medium">
          YOUR COMPANY
        </div>
      </div>
    </div>
  );
};

export default Loader;

// import { useState, useEffect } from 'react';

// const Loader = () => {
//   const [progress, setProgress] = useState(0);
  
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setProgress(prev => {
//         const newProgress = prev + 1;
//         return newProgress > 100 ? 0 : newProgress;
//       });
//     }, 30);
    
//     return () => clearInterval(interval);
//   }, []);
  
//   return (
//     <div className="flex flex-col items-center justify-center fixed inset-0 bg-white dark:bg-gray-900 z-50">
//       <div className="relative w-24 h-24 mb-8">
//         {/* Outer ring */}
//         <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
        
//         {/* Progress ring */}
//         <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
//           <circle 
//             className="text-blue-600 dark:text-blue-500 transition-all duration-300 ease-in-out"
//             strokeWidth="8"
//             strokeDasharray="251.2"
//             strokeDashoffset={251.2 - (251.2 * progress) / 100}
//             strokeLinecap="round"
//             stroke="currentColor"
//             fill="transparent"
//             r="40"
//             cx="50"
//             cy="50"
//           />
//         </svg>
        
//         {/* Inner pulsing circle */}
//         <div className="absolute inset-0 flex items-center justify-center">
//           <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full animate-pulse" />
//         </div>
        
      
//       </div>
      
//       {/* Text with typewriter effect */}
//       <div className="flex flex-col items-center">
//         <div className="text-gray-700 dark:text-gray-300 font-medium text-lg mb-1">
//           Loading your workspace
//         </div>
//         <div className="text-gray-500 dark:text-gray-400 text-sm">
//           Please wait a moment
//           <span className="inline-flex w-8">
//             <span className="animate-pulse delay-0">.</span>
//             <span className="animate-pulse delay-300">.</span>
//             <span className="animate-pulse delay-600">.</span>
//           </span>
//         </div>
//       </div>
      
//       {/* Progress percentage */}
//       <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
//         {progress}%
//       </div>
//     </div>
//   );
// };

// export default Loader;


// const Loader = () => {
//   return (
//     <div className="spinner-wrapper">
//       <div className="spinner">
//         <div className="dots">
//           {[...Array(12)].map((_, i) => (
//             <div
//               key={i}
//               className="dot"
//               style={{
//                 transform: `rotate(${i * 30}deg) translateY(-40px)`,
//                 opacity: 0.3 + (i % 4) * 0.2
//               }}
//             />
//           ))}
//         </div>
//       </div>
//       <div className="text">Loading...</div>
//     </div>
//   );
// };

// export default Loader;
