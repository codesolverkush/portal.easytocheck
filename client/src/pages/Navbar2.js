import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, X, Menu, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar2 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  // Track scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openNewWindow = (url) => {
    window.open(url, '_blank');
  };

  const features = [
    { name: 'Team Management', icon: 'users' },
    { name: 'Analytics', icon: 'bar-chart' },
    { name: 'Email Integration', icon: 'mail' },
    { name: 'Security', icon: 'shield' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
      isScrolled ? 'bg-white/95 shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo section */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
                <Globe className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Easy Portal
              </h1>
            </div>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="group relative">
              <button 
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors gap-1 py-2 font-medium"
                onClick={() => setFeaturesOpen(!featuresOpen)}
              >
                Features <ChevronDown size={16} className={`transform transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white shadow-xl rounded-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100">
                {features.map((feature, index) => (
                  <a 
                    key={index}
                    href="#features" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-indigo-600">{index + 1}</span>
                    </span>
                    {feature.name}
                  </a>
                ))}
              </div>
            </div>
            
            {['About', 'Pricing', 'Contact'].map((item, index) => (
              <a 
                key={index}
                href={`#${item.toLowerCase()}`} 
                className="text-gray-700 hover:text-indigo-600 transition-colors py-2 relative group font-medium"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
            
            <button 
              onClick={() => openNewWindow(`/__catalyst/auth/login`)}
              className="px-6 py-2.5 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              Sign In
            </button>
            
            <button 
              onClick={() => openNewWindow(`/__catalyst/auth/signup`)}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg font-medium flex items-center gap-2"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden rounded-lg p-2 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile menu with animation */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="px-4 py-5 space-y-4 divide-y divide-gray-100">
              <div className="space-y-3">
                <button 
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-indigo-600 transition-colors py-2"
                >
                  <span className="font-medium">Features</span>
                  <ChevronDown 
                    size={16} 
                    className={`transform transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                
                <AnimatePresence>
                  {featuresOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="pl-4 space-y-2 overflow-hidden"
                    >
                      {features.map((feature, index) => (
                        <a 
                          key={index}
                          href="#features" 
                          className="flex items-center px-3 py-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <span className="text-indigo-600 text-xs">{index + 1}</span>
                          </span>
                          {feature.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="pt-3 space-y-3">
                {['About', 'Pricing', 'Contact'].map((item, index) => (
                  <a 
                    key={index}
                    href={`#${item.toLowerCase()}`} 
                    className="block px-3 py-2 text-gray-700 hover:text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
              
              <div className="pt-3 space-y-3">
                <button 
                  onClick={() => openNewWindow(`/__catalyst/auth/login`)}
                  className="block w-full text-left px-3 py-3 text-gray-700 hover:text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openNewWindow(`/__catalyst/auth/signup`)}
                  className="block w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-lg font-medium flex items-center justify-center"
                >
                  Get Started <ArrowRight size={16} className="ml-2" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar2;