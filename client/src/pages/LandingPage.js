import React, { useState, useEffect } from 'react';
import { AlertCircle, BarChart2, Users, Mail, Shield, ArrowRight, CheckCircle, Phone, Globe, ChevronDown } from 'lucide-react';
import Navbar2 from './Navbar2';

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openNewWindow = (url) => {
    window.open(url, "_blank");
  };

  const features = [
    { icon: <Users size={24} />, title: "Team Management", description: "Efficiently manage your team and track their performance in real-time" },
    { icon: <BarChart2 size={24} />, title: "Analytics", description: "Get detailed insights and reports to make data-driven decisions" },
    { icon: <Mail size={24} />, title: "Email Integration", description: "Seamless email integration with your favorite email providers" },
    { icon: <Shield size={24} />, title: "Security", description: "Enterprise-grade security to protect your sensitive data" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar2/>

      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-70 z-0">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "radial-gradient(circle at 25px 25px, #e0e7ff 2px, transparent 0), radial-gradient(circle at 75px 75px, #e0e7ff 2px, transparent 0)",
            backgroundSize: "100px 100px" 
          }}></div>
        </div>
        
        {/* Hero content */}
        {/* <div className="relative z-10 pt-40 pb-20 px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-left lg:pr-12">
              <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                Modern CRM for Growing Businesses
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Business with Our
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Smart CRM</span>
              </h2>
              <p className="mt-6 text-xl text-gray-600">
                Streamline your workflow, boost productivity, and grow your business with our intelligent customer relationship management solution.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <button onClick={() => openNewWindow("https://easyportal-60038186875.development.catalystserverless.in/__catalyst/auth/signup")}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight size={20} />
                </button>
                <button className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Phone size={20} /> Schedule Demo
                </button>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">500+</span> companies already using our CRM
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="w-full h-full absolute -left-4 -top-4 bg-indigo-200 rounded-xl"></div>
                <div className="relative bg-white p-4 rounded-xl shadow-2xl border border-gray-100">
                  <img src="https://www.onepagecrm.com/wp-content/uploads/blog-crm-dashboard-header-v2.png" alt="CRM Dashboard" className="w-full rounded-lg" />
                </div>
                <div className="absolute -bottom-10 -right-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Sales target reached</div>
                      <div className="text-xs text-gray-500">10 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div> */}


<div className="relative z-10 pt-20 md:pt-40 pb-20 px-4 md:px-6">
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-12">
    <div className="w-full lg:w-1/2 text-center lg:text-left lg:pr-12 sm:mb-10 mb-10">
      <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4 md:mb-6">
        Modern CRM for Growing Businesses
      </div>
      {/* <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
        Transform Your Business with Our
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Smart PORTAL</span>
      </h2>
      <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-600">
        Streamline your workflow, boost productivity, and grow your business with our intelligent customer relationship management solution.
      </p> */}

     
         <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
          Transform Your Business with Our
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Smart Portal</span>
       </h2>
           <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
             Streamline your workflow, boost productivity, and grow your business with our intelligent customer relationship management solution.
           </p> 

      <div className="mt-6 md:mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
        <button onClick={() => openNewWindow(`/__catalyst/auth/signup`)}
          className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 w-full sm:w-auto">
          Start Free Trial <ArrowRight size={20} />
        </button>
        <button className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
          <Phone size={20} /> Schedule Demo
        </button>
      </div>
      <div className="mt-8 flex items-center justify-center lg:justify-start">
        <div className="flex -space-x-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        <div className="ml-3 text-sm text-gray-600">
          <span className="font-semibold text-indigo-600">500+</span> companies already using our Portal
        </div>
      </div>
    </div>
    <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
      <div className="relative mx-auto max-w-md lg:max-w-none">
        <div className="w-full h-full absolute -left-2 md:-left-4 -top-2 md:-top-4 bg-indigo-200 rounded-xl"></div>
        <div className="relative bg-white p-2 md:p-4 rounded-xl shadow-2xl border border-gray-100">
          <img src="https://www.onepagecrm.com/wp-content/uploads/blog-crm-dashboard-header-v2.png" alt="CRM Dashboard" className="w-full rounded-lg" />
        </div>
        <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-white p-3 md:p-4 rounded-xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 md:w-10 h-8 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600 md:text-lg" />
            </div>
            <div>
              <div className="text-xs md:text-sm font-semibold">Sales target reached</div>
              <div className="text-xs text-gray-500">10 minutes ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              Features
            </div>
            <h3 className="text-4xl font-bold text-gray-900">Powerful Features</h3>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">Everything you need to manage your business effectively and delight your customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900">{feature.title}</h4>
                <p className="mt-3 text-gray-600">{feature.description}</p>
                <a href="#" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
                  Learn more <ArrowRight size={16} className="ml-1" />
                </a>
              </div>
            ))}
          </div>
          
          <div className="mt-20">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-10 lg:p-16 flex flex-col justify-center">
                  <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                    Customer Dashboard
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900">Monitor all customer activity in one place</h3>
                  <p className="mt-4 text-gray-600">Get a comprehensive view of your customer interactions, purchase history, and support tickets to provide the best service possible.</p>
                  
                  <div className="mt-8 space-y-4">
                    {['Real-time activity tracking', 'Customizable dashboard views', 'Advanced filtering options'].map((item, i) => (
                      <div key={i} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <CheckCircle size={18} className="text-indigo-600" />
                        </div>
                        <p className="ml-3 text-gray-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-indigo-50 p-6 flex items-center justify-center">
                  <img src="https://sellingsignals.com/wp-content/uploads/2022/01/Example-open-pipe-dashboard-from-Salesforce-Essentials.png" alt="Dashboard Preview" className="rounded-lg shadow-lg max-w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              Our Impact
            </div>
            <h3 className="text-4xl font-bold text-gray-900">Trusted by businesses worldwide</h3>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">See the numbers that define our success and the impact we've made</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
              <div className="inline-block p-4 bg-indigo-100 rounded-2xl mb-6">
                <Users size={32} className="text-indigo-600" />
              </div>
              <div className="text-5xl font-bold text-indigo-600">10k+</div>
              <div className="mt-3 text-xl text-gray-600">Active Users</div>
              <p className="mt-3 text-gray-500 text-sm">Across 50+ countries globally</p>
            </div>
            <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
              <div className="inline-block p-4 bg-green-100 rounded-2xl mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div className="text-5xl font-bold text-green-600">98%</div>
              <div className="mt-3 text-xl text-gray-600">Customer Satisfaction</div>
              <p className="mt-3 text-gray-500 text-sm">Based on over 5,000 reviews</p>
            </div>
            <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
              <div className="inline-block p-4 bg-purple-100 rounded-2xl mb-6">
                <Phone size={32} className="text-purple-600" />
              </div>
              <div className="text-5xl font-bold text-purple-600">24/7</div>
              <div className="mt-3 text-xl text-gray-600">Customer Support</div>
              <p className="mt-3 text-gray-500 text-sm">Always available to help you</p>
            </div>
          </div>
          
          {/* Social proof */}
          <div className="mt-20 bg-indigo-50 rounded-2xl p-10 text-center">
            <div className="flex justify-center space-x-6 mb-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-20 h-10 bg-white rounded-md shadow-sm flex items-center justify-center">
                  <div className="w-12 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto italic">
              "Implementing this CRM has transformed how we manage our customer relationships. Our sales team productivity increased by 35% in just three months."
            </p>
            <div className="mt-6">
              <div className="font-semibold text-gray-900">Sarah Johnson</div>
              <div className="text-sm text-gray-500">VP of Sales, TechCorp Inc.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              Pricing
            </div>
            <h3 className="text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h3>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">No hidden fees. Choose the plan that works best for you.</p>
          </div>
          
          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-lg shadow-sm inline-flex items-center">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-md">Monthly</button>
              <button className="px-4 py-2 text-gray-700">Yearly</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '29',
                features: [
                  '5 Team Members',
                  '1GB Storage',
                  'Email Integration',
                  'Basic Analytics',
                  'Mobile App Access'
                ]
              },
              {
                name: 'Professional',
                price: '99',
                popular: true,
                features: [
                  '20 Team Members',
                  '10GB Storage',
                  'Email Integration',
                  'API Access',
                  'Advanced Analytics',
                  'Mobile App Access',
                  'Priority Support'
                ]
              },
              {
                name: 'Enterprise',
                price: '299',
                features: [
                  'Unlimited Team Members',
                  'Unlimited Storage',
                  'Email Integration',
                  'API Access',
                  'Custom Solutions',
                  'Dedicated Support Manager',
                  'Advanced Security Features',
                  'Custom Integrations'
                ]
              }
            ].map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-lg overflow-hidden border ${plan.popular ? 'border-indigo-600 ring-2 ring-indigo-600 ring-opacity-20' : 'border-gray-100'}`}>
                {plan.popular && (
                  <div className="bg-indigo-600 text-white text-sm font-medium py-2 text-center">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h4 className="text-2xl font-semibold text-gray-900">{plan.name}</h4>
                  <div className="mt-4 flex items-baseline">
                    <div className="text-5xl font-bold text-gray-900">${plan.price}</div>
                    <div className="ml-1 text-xl font-normal text-gray-500">/month</div>
                  </div>
                  <p className="mt-2 text-gray-500">Billed monthly</p>
                  
                  <ul className="mt-8 space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle size={20} className="flex-shrink-0 text-indigo-600 mt-0.5" />
                        <span className="ml-3 text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`mt-8 w-full px-6 py-3.5 rounded-lg transition-colors ${
                    plan.popular 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md' 
                      : 'bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50'
                  }`}>
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-600">Need a custom solution for your enterprise?</p>
            <a href="#contact" className="mt-2 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-800">
              Contact our sales team <ArrowRight size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                Contact Us
              </div>
              <h3 className="text-4xl font-bold text-gray-900">Get in touch</h3>
              <p className="mt-4 text-xl text-gray-600">Have questions or need help? We're here for you.</p>
              
              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Mail size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Email Us</h4>
                    <p className="mt-1 text-gray-600">Our friendly team is here to help.</p>
                    <a href="mailto:support@crmsystem.com" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
                      support@crmsystem.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Phone size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Call Us</h4>
                    <p className="mt-1 text-gray-600">Mon-Fri from 8am to 5pm.</p>
                    <a href="tel:+15555555555" className="mt-2 inline-block text-indigo-600 hover:text-indigo-800">
                      +1 (555) 555-5555
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Globe size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">Visit Us</h4>
                    <p className="mt-1 text-gray-600">Come say hello at our office.</p>
                    <p className="mt-2 text-gray-600">
                      100 Main Street<br />
                      San Francisco, CA 94111
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 shadow-md">
              <h4 className="text-xl font-semibold text-gray-900 mb-6">Send us a message</h4>
              <form className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button type="submit" className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="text-white" size={24} />
                </div>
                <h4 className="text-2xl font-bold text-white">Easy Portal</h4>
              </div>
              <p className="mt-4 text-gray-400 max-w-md">Transform your business with our powerful CRM solution. Streamline workflows and increase customer satisfaction.</p>
              <div className="mt-6 flex space-x-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map(social => (
                  <a key={social} href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                    <span className="w-5 h-5 bg-gray-500 rounded-sm"></span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">© 2025 Easy Portal. All rights reserved.</p>
              <div className="mt-4 md:mt-0">
                <select className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg border border-gray-700">
                  <option>English (US)</option>
                  <option>Español</option>
                  <option>Français</option>
                  <option>Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;