import React, { useState } from "react";
import {
  CheckCircle,
  Award,
  Globe,
  User,
  Briefcase,
  ChevronRight,
  ArrowRight,
  Facebook,
  Linkedin,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar3 from "../common/Navbar3";
import IconZ from "../ui/Icons";
import dashboardImage from "../../images/aboutus.png"

export default function AboutUs() {
  const [isHovered, setIsHovered] = useState(false);
 

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navigation */}
      <Navbar3/>

      {/* Hero Section */}
      {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white pt-24">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 leading-tight">About Us</h1>
            <p className="text-2xl font-light mb-8">
              Your trusted Zoho Premium Partner for over a decade
            </p>
          </div>
        </div>
        <div className="h-16 bg-white transform -skew-y-3 origin-top-right mt-8"></div>
      </div> */}
  {/* <div class="relative z-10 px-8 pt-16 pb-24">
    <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
      <div class="md:w-3/5 mb-12 md:mb-0">
        <div class="inline-block px-4 py-1 bg-indigo-800  rounded-full text-sm font-medium tracking-wider uppercase text-indigo-100 mb-6">
          ZOHO PREMIUM PARTNER
        </div>
       
        <p class="text-lg md:text-xl font-light mb-8 text-indigo-600 font-semibold max-w-xl leading-relaxed">
          Your trusted Zoho Premium Partner for over a decade, delivering business transformation through powerful cloud solutions.
        </p>
      </div>
      
      <div class="md:w-2/5 flex justify-center">
        <div class="w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <div class="relative">
            <div class="w-48 h-48 bg-gradient-to-br  rounded-xl flex items-center justify-center">
              <img src="https://static.wixstatic.com/media/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png/v1/crop/x_0,y_5,w_511,h_112/fill/w_343,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png"/>
            </div>
         
            <div class="absolute -bottom-4 -right-4 bg-indigo-900 text-white text-xs font-bold py-1 px-3 rounded-full border-2 border-white">
              ZOHO PREMIUM PARTNER
            </div>
          </div>
        </div>
      </div>
    </div>
  
  
 
  <div class="absolute bottom-0 left-0 right-0 h-16 bg-indigo-900 opacity-20">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="absolute bottom-0">
      <path fill="#ffffff" fill-opacity="0.2" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,133.3C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
</div> */}

<div className="relative z-10 px-8 pt-16 pb-24">
      <div className="max-w-7xl bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-3/5  mb-12 md:mb-0">
          <div className="inline-block ml-6 px-4 py-1 bg-indigo-800 rounded-full text-sm font-medium tracking-wider uppercase text-indigo-100 mb-6">
            ZOHO PREMIUM PARTNER
          </div>
          
          <p className="text-lg md:text-xl font-light ml-10 mb-8 text-indigo-600 font-semibold max-w-xl leading-relaxed">
            Your trusted Zoho Premium Partner for over a decade, delivering business transformation through powerful solutions and better ideas.
          </p>
        </div>
        
        <div className="md:w-2/5 flex justify-center">
          <div 
            className={`w-64 h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center p-6 transition-all duration-500 
              ${isHovered ? 'rotate-0' : 'animate-pulse'}`}
            style={{
              animation: isHovered ? 'none' : 'pendulum 3s ease-in-out infinite',
              transformOrigin: 'top center'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative">
              <div className="w-48 h-48 bg-gradient-to-br  rounded-xl flex items-center justify-center p-4">
                <img 
                  src="https://static.wixstatic.com/media/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png/v1/crop/x_0,y_5,w_511,h_112/fill/w_343,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png" 
                  alt="Zoho Partner Logo" 
                  className="object-contain"
                />
              </div>
           
              <div className="absolute -bottom-4 -right-4 bg-indigo-900 text-white text-xs font-bold py-1 px-3 rounded-full border-2 border-white">
                ZOHO PREMIUM PARTNER
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    
  

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome to EasyToCheck Software Solutions
            </h2>
            <p className="text-gray-700 mb-6 text-lg leading-relaxed">
              We are a trusted Premium Partner of Zoho for the last 10 years,
              committed to transforming how businesses use Zoho applications.
              With years of expertise and a proven track record, we have become
              one of the leading Zoho consulting and development companies
              globally.
            </p>
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">
              At EasyToCheck, we specialize in Zoho onboarding, migration, and
              customization, ensuring that each organization gets a Zoho setup
              that perfectly aligns with their unique needs and processes.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-indigo-100 text-indigo-800 px-5 py-2 rounded-full font-medium">
                Zoho Consulting
              </span>
              <span className="bg-indigo-100 text-indigo-800 px-5 py-2 rounded-full font-medium">
                Custom Development
              </span>
              <span className="bg-indigo-100 text-indigo-800 px-5 py-2 rounded-full font-medium">
                Application Integration
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-10 shadow-lg">
            <div className="flex items-center mb-8">
              <div className="bg-indigo-600 rounded-full p-3 mr-5">
                <Award className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Premium Zoho Partner
                </h3>
                <p className="text-gray-600">
                  Certified expertise you can trust
                </p>
              </div>
            </div>
            <div className="flex items-center mb-8">
              <div className="bg-indigo-600 rounded-full p-3 mr-5">
                <Globe className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Global Reach
                </h3>
                <p className="text-gray-600">
                  Serving 2000+ customers worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-full p-3 mr-5">
                <Briefcase className="text-white w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Industry Experience
                </h3>
                <p className="text-gray-600">10+ years of Zoho expertise</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              What We Do
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-8"></div>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              We have developed{" "}
              <span className="font-bold">
                multiple best-selling Zoho Marketplace extensions
              </span>{" "}
              used by thousands of businesses. Our team works relentlessly to
              create seamless, high-performance tools that simplify your
              business workflows within the Zoho ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "IndiaMART Extension",
                desc: "Seamless integration with India's largest B2B marketplace",
                url: "https://www.easytocheck.com/indiamart",
              },
              {
                title: "99acres",
                desc: "Streamlined property management workflows",
                url: "https://www.easytocheck.com/99acres-for-zoho-crm",
              },
              {
                title: "QuickBooks Connect",
                desc: "Powerful accounting integration solution",
                url: "https://www.easytocheck.com/99acres-for-zoho-crm",
              },
              {
                title: "ZeroBounce Integration",
                desc: "Email validation and verification solution",
                url: "https://www.easytocheck.com/zerobounce",
              },
            ].map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <div className="bg-indigo-600 h-2"></div>
                <div className="p-6">
                  <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <CheckCircle className="text-indigo-600 w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-center">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Our Global Reach */}
        <div className="mb-24">
          <div className="flex items-center justify-center mb-8">
            <Globe className="text-indigo-600 w-8 h-8 mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">
              Our Global Reach
            </h2>
          </div>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-8"></div>
          <p className="text-gray-700 text-lg text-center max-w-3xl mx-auto mb-12">
            We proudly serve over{" "}
            <span className="font-bold">2000+ customers across the globe</span>,
            delivering value through technology and dedicated support.
          </p>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-10 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: "2000+", label: "Global Customers" },
                { value: "10+", label: "Years of Experience" },
                { value: "50+", label: "Team Members" },
                { value: "1000+", label: "Projects Delivered" },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow">
                  <p className="text-indigo-600 text-4xl font-bold mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trusted Brands Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Trusted By Leading Brands
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-8"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              "Disney+ Hotstar",
              "Dura Tuff",
              "OkayaEV (OPGMOBILITY)",
              "Asia Pacific Group",
              "Budget Policy",
              "Abhinav Immigration Services",
              "Jakson Limited",
              "Toyota Nextly",
              "Neelgund Developers",
              "CDRI",
            ].map((brand, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center hover:shadow-md transition-all h-24 hover:border-indigo-300"
              >
                <p className="text-gray-700 font-medium text-center">{brand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* EasyPortal Section */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-10 shadow-lg mb-24">
          <div className="text-center mb-12">
            <span className="bg-indigo-100 text-indigo-800 px-5 py-2 rounded-full font-medium inline-block mb-4">
              New Product
            </span>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Introducing EasyPortal
            </h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto">
              We are excited to launch our very own product —{" "}
              <span className="font-bold">EasyPortal</span> — designed
              specifically for organizations to manage their pre-sales data
              efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                <span className="font-bold">EasyPortal</span> allows businesses
                to assign and share Leads, Contacts, Deals, and other important
                information with light users, giving them access through a
                mobile-friendly web app.
              </p>

              <div className="space-y-4 mb-8">
                {["Lightweight", "Easy to use", "Made for teams on the go"].map(
                  (feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <CheckCircle className="text-green-600 w-5 h-5" />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {feature}
                      </span>
                    </div>
                  )
                )}
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all">
                Learn More About EasyPortal
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-indigo-600 p-4 text-white text-center">
                <h3 className="font-bold text-xl">EasyPortal Dashboard</h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <img
                    src={dashboardImage || "https://www.onepagecrm.com/wp-content/uploads/blog-crm-dashboard-header-v2.png"}
                    alt="EasyPortal Dashboard Preview"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl p-12 shadow-xl">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join over 2000+ businesses that trust EasyToCheck for their Zoho
            implementation and development needs.
          </p>
          {/* <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all">
              Contact Us
            </button>
            <button className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all border border-blue-500">
              Request a Demo
            </button>
          </div> */}
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
              <p className="mt-4 text-gray-400 max-w-md">
                Transform your business with our powerful CRM solution.
                Streamline workflows and increase customer satisfaction.
              </p>
              <div className="mt-6 flex space-x-4">
                {[
                  {
                    name: "zoho",
                    icon: IconZ,
                    url: "https://www.zoho.com/partners/find-partner-profile.html?partnerid=baf0b46ef74ed349968c06eeef3a9022",
                  },
                  {
                    name: "facebook",
                    icon: Facebook,
                    url: "https://www.facebook.com/easytocheck",
                  },
                  {
                    name: "linkedin",
                    icon: Linkedin,
                    url: "https://www.linkedin.com/company/easytocheck-software-solutions",
                  },
                  {
                    name: "website",
                    icon: Globe,
                    url: "https://easytocheck.com",
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-5 h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                © 2025 Easy Portal. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <select className="bg-gray-800 text-gray-400 px-4 py-2 rounded-lg border border-gray-700">
                  <option>English (US)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pendulum {
          0% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
          100% { transform: rotate(-5deg); }
        }
      `}</style>
    </div>


  );
}