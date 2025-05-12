import React, { useState, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { Globe, X, Menu, ArrowRight } from 'lucide-react';
import logoimage from '../images/portallogo.jpg';

const Navbar2 = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Track scrolling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open external links in new window
  const openSameWindow = (url) => {
    window.open(url, "_self");
  };

  // Smooth scroll function
  const scrollToSection = (sectionId, event) => {
    event.preventDefault();
    
    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    
    // Special handling for "about" to open AboutUs component
    if (sectionId === 'about') {
      // This would typically involve routing or state management
      // For demonstration purposes, we'll assume there's a function to open AboutUs.js
      openAboutUsComponent();
      return;
    }
    
    const section = document.getElementById(sectionId);
    
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      window.history.pushState({}, '', `#${sectionId}`);
    }
  };

  // Function to open AboutUs component
  const openAboutUsComponent = () => {
    // In a real application, this might use React Router navigation or state management
    // For example, if using React Router:
    navigate("/app/about-us")
    
    // Or it might update state in a parent component to conditionally render AboutUs
    // For example:
    // props.setCurrentComponent('AboutUs');
    
    // console.log('Opening AboutUs.js component');
    
    // This is just a placeholder - you would implement this according to your app's architecture
    // For example, if you're using window events to communicate between components:
    // window.dispatchEvent(new CustomEvent('openComponent', { detail: { component: 'AboutUs' } }));
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/90'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo section */}
            <div className="flex items-center">
              <div className="flex items-center space-x-2 group">
                <img className='w-32 h-10' src={logoimage}/>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a 
                href="#features"
                onClick={(e) => scrollToSection('features', e)}
                className="text-gray-700 hover:text-indigo-600 transition-colors py-2 font-medium"
              >
                Features
              </a>
              <a 
                href="#about"
                onClick={(e) => scrollToSection('about', e)}
                className="text-gray-700 hover:text-indigo-600 transition-colors py-2 font-medium"
              >
                About
              </a>
              <a 
                href="#pricing"
                onClick={(e) => scrollToSection('pricing', e)}
                className="text-gray-700 hover:text-indigo-600 transition-colors py-2 font-medium"
              >
                Pricing
              </a>
              <a 
                href="#contact"
                onClick={(e) => scrollToSection('contact', e)}
                className="text-gray-700 hover:text-indigo-600 transition-colors py-2 font-medium"
              >
                Contact
              </a>
            </div>
            
            {/* Desktop CTA buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => openSameWindow(`/__catalyst/auth/login`)}
                className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors font-medium text-sm"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => openSameWindow(`/__catalyst/auth/signup`)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md font-medium text-sm flex items-center gap-2"
              >
                Get Started <ArrowRight size={14} />
              </button>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? 
                <X className="h-5 w-5 text-gray-700" /> : 
                <Menu className="h-5 w-5 text-gray-700" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Modern Mobile Menu Drawer */}
      <div 
        className={`fixed inset-0 bg-black/30 z-50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 h-screen w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile menu header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="text-white" size={18} />
              </div>
              <span className="font-semibold text-gray-800">Easy Portal</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          
          {/* Mobile menu items */}
          <div className="py-4 px-1">
            <div className="space-y-1">
              <a 
                href="#features"
                onClick={(e) => scrollToSection('features', e)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Features
              </a>
              <a 
                href="#about"
                onClick={(e) => scrollToSection('about', e)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                About
              </a>
              <a 
                href="#pricing"
                onClick={(e) => scrollToSection('pricing', e)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Pricing
              </a>
              <a 
                href="#contact"
                onClick={(e) => scrollToSection('contact', e)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium"
              >
                Contact
              </a>
            </div>
            
            {/* Mobile CTA buttons */}
            <div className="mt-6 px-4 space-y-3">
              <button 
                onClick={() => openSameWindow(`/__catalyst/auth/login`)}
                className="w-full py-3 text-center border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
              >
                Sign In
              </button>
              <button 
                onClick={() => openSameWindow(`/__catalyst/auth/signup`)}
                className="w-full py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium flex items-center justify-center"
              >
                Get Started <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar2;