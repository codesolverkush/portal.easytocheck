import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoimage from '../../images/portallogo.jpg';


export const CompanyLogo2 = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Set up initial animation
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="flex flex-col items-center justify-center p-6 cursor-pointer transition-all duration-500 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Icon with gradient background and animation */}
      <div className={`relative mb-3 ${isAnimating ? 'animate-pulse' : ''}`}>
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg transform transition-all duration-500 ease-in-out rotate-3 hover:rotate-6">
          <div className="absolute inset-1 bg-white rounded-md flex items-center justify-center overflow-hidden">
            <div className={`text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 transform transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
              EP
            </div>
            
            {/* Animated circles in background */}
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300 opacity-80 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-300 opacity-70 animate-ping" style={{ animationDuration: '2.5s' }}></div>
          </div>
        </div>
        
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-lg bg-blue-400 blur-md transition-opacity duration-500 ${isHovered ? 'opacity-40' : 'opacity-0'}`}></div>
      </div>
      
      {/* Logo Text with gradient effect */}
      <div className="text-center transform transition-all duration-500 ease-in-out">
        <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-1">
          Easy Portal
        </h1>
        <p className="text-sm font-medium text-white tracking-wider transform transition-all duration-500">
          Business Solutions
        </p>
      </div>
      
      {/* Animated underline that expands on hover */}
      <div className="relative mt-2 w-full max-w-xs flex justify-center">
        <div className={`h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-in-out ${isHovered ? 'w-full' : 'w-16'}`}></div>
      </div>
    </div>
  );
};




export const CompanyLogo = ({ color = "text-blue-400" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center cursor-pointer transition-all duration-300 ml-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Icon */}
      

      {/* Logo Text */}
      <Link to="/app/dashboard">
        <div className="flex flex-col">
        <img 
        src={logoimage} 
        alt="Portal Logo"
        className="w-32 bg-white p-1 rounded-md shadow-md mt-1"
      />

          {/* Underline on hover */}
          <div className="relative mt-0.5">
            <div
              className={`h-0.5 bg-blue-400 transition-all duration-300 ease-in-out ${
                isHovered ? "w-full" : "w-0"
              }`}
            ></div>
          </div>
        </div>
      </Link>
    </div>
  );
};

