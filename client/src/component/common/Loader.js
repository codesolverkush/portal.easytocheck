const Loader = () => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner">
        <div className="dots">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="dot"
              style={{
                transform: `rotate(${i * 30}deg) translateY(-40px)`,
                opacity: 0.3 + (i % 4) * 0.2
              }}
            />
          ))}
        </div>
      </div>
      <div className="text">Loading...</div>
    </div>
  );
};

export default Loader;

// import React from 'react';
// import { motion } from 'framer-motion';

// const Loader = () => {
//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <motion.div
//         className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
//         initial={{ rotate: 0 }}
//         animate={{ rotate: 360 }}
//         transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
//       />
//     </div>
//   );
// };

// export default Loader;