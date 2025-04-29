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
import dashboardImage from "../../images/aboutus.png";

export default function AboutUs() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      {/* Navigation */}
      <Navbar3 />

      {/* Hero Section - More Responsive */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-16 md:pb-24">
        <div className="max-w-7xl bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl mx-auto shadow-lg flex flex-col md:flex-row items-center justify-between p-6 md:p-10">
          <div className="w-full md:w-3/5 mb-10 md:mb-0 text-center md:text-left">
            <div className="inline-block px-4 py-1 bg-indigo-800 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase text-indigo-100 mb-4 md:mb-6">
              ZOHO PREMIUM PARTNER
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6 leading-tight">
              EasyToCheck Software Solutions
            </h1>
            
            <p className="text-base md:text-lg lg:text-xl font-light mb-6 text-indigo-600 font-semibold max-w-xl leading-relaxed">
              Your trusted Zoho Premium Partner for over a decade, delivering business transformation through powerful solutions and better ideas.
            </p>
          </div>
          
          <div className="w-full md:w-2/5 flex justify-center">
            <div 
              className={`w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-white rounded-2xl shadow-xl flex items-center justify-center p-4 transition-all duration-500 
                ${isHovered ? 'rotate-0' : 'animate-pulse'}`}
              style={{
                animation: isHovered ? 'none' : 'pendulum 3s ease-in-out infinite',
                transformOrigin: 'top center'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative">
                <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-gradient-to-br rounded-xl flex items-center justify-center p-4">
                  <img 
                    src="https://static.wixstatic.com/media/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png/v1/crop/x_0,y_5,w_511,h_112/fill/w_343,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/d235cf_f74a668d0ec6470c98c18002d47421d7~mv2.png" 
                    alt="Zoho Partner Logo" 
                    className="object-contain max-w-full h-auto"
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

      {/* Main Content with improved spacing and responsiveness */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Welcome Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center mb-16 md:mb-24">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
              Welcome to EasyToCheck Software Solutions
            </h2>
            <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
              We are a trusted Premium Partner of Zoho for the last 10 years,
              committed to transforming how businesses use Zoho applications.
              With years of expertise and a proven track record, we have become
              one of the leading Zoho consulting and development companies
              globally.
            </p>
            <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
              At EasyToCheck, we specialize in Zoho onboarding, migration, and
              customization, ensuring that each organization gets a Zoho setup
              that perfectly aligns with their unique needs and processes.
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <span className="bg-indigo-100 text-indigo-800 px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium">
                Zoho Consulting
              </span>
              <span className="bg-indigo-100 text-indigo-800 px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium">
                Custom Development
              </span>
              <span className="bg-indigo-100 text-indigo-800 px-3 md:px-5 py-2 rounded-full text-sm md:text-base font-medium">
                Application Integration
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="flex items-center mb-6 md:mb-8">
              <div className="bg-indigo-600 rounded-full p-2 md:p-3 mr-3 md:mr-5 shrink-0">
                <Award className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  Premium Zoho Partner
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Certified expertise you can trust
                </p>
              </div>
            </div>
            <div className="flex items-center mb-6 md:mb-8">
              <div className="bg-indigo-600 rounded-full p-2 md:p-3 mr-3 md:mr-5 shrink-0">
                <Globe className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  Global Reach
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  Serving 2000+ customers worldwide
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-full p-2 md:p-3 mr-3 md:mr-5 shrink-0">
                <Briefcase className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                  Industry Experience
                </h3>
                <p className="text-sm md:text-base text-gray-600">10+ years of Zoho expertise</p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Do Section */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              What We Do
            </h2>
            <div className="w-16 md:w-20 h-1 bg-indigo-600 mx-auto mb-6 md:mb-8"></div>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
              We have developed{" "}
              <span className="font-bold">
                multiple best-selling Zoho Marketplace extensions
              </span>{" "}
              used by thousands of businesses. Our team works relentlessly to
              create seamless, high-performance tools that simplify your
              business workflows within the Zoho ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
                <div className="p-4 md:p-6">
                  <div className="bg-indigo-100 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-4 md:mb-6 mx-auto">
                    <CheckCircle className="text-indigo-600 w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-center text-gray-800 mb-2 md:mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 text-center">{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Our Global Reach - With better spacing */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
            <div className="flex items-center mb-2">
              <Globe className="text-indigo-600 w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Our Global Reach
              </h2>
            </div>
            <div className="w-16 md:w-20 h-1 bg-indigo-600 mb-4 md:mb-8"></div>
            <p className="text-base md:text-lg text-gray-700 text-center max-w-3xl mx-auto mb-8 md:mb-12">
              We proudly serve over{" "}
              <span className="font-bold">2000+ customers across the globe</span>,
              delivering value through technology and dedicated support.
            </p>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-10 shadow-lg">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 text-center">
              {[
                { value: "2000+", label: "Global Customers" },
                { value: "10+", label: "Years of Experience" },
                { value: "50+", label: "Team Members" },
                { value: "1000+", label: "Projects Delivered" },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-4 md:p-6 rounded-xl shadow">
                  <p className="text-indigo-600 text-2xl md:text-4xl font-bold mb-1 md:mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-600 text-sm md:text-base font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trusted Brands Section - More responsive grid */}
        <div className="mb-16 md:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Trusted By Leading Brands
            </h2>
            <div className="w-16 md:w-20 h-1 bg-indigo-600 mx-auto mb-6 md:mb-8"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
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
                className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 flex items-center justify-center hover:shadow-md transition-all h-20 md:h-24 hover:border-indigo-300"
              >
                <p className="text-gray-700 text-sm md:text-base font-medium text-center">{brand}</p>
              </div>
            ))}
          </div>
        </div>

        {/* EasyPortal Section - Improved responsive layout */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 md:p-10 shadow-lg mb-16 md:mb-24">
          <div className="text-center mb-8 md:mb-12">
            <span className="bg-indigo-100 text-indigo-800 px-4 py-1 md:px-5 md:py-2 rounded-full text-xs md:text-sm font-medium inline-block mb-3 md:mb-4">
              New Product
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 md:mb-4">
              Introducing EasyPortal
            </h2>
            <div className="w-16 md:w-20 h-1 bg-indigo-600 mx-auto mb-4 md:mb-6"></div>
            <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
              We are excited to launch our very own product —{" "}
              <span className="font-bold">EasyPortal</span> — designed
              specifically for organizations to manage their pre-sales data
              efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-base md:text-lg text-gray-700 mb-6 md:mb-8 leading-relaxed">
                <span className="font-bold">EasyPortal</span> allows businesses
                to assign and share Leads, Contacts, Deals, and other important
                information with light users, giving them access through a
                mobile-friendly web app.
              </p>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                {["Lightweight", "Easy to use", "Made for teams on the go"].map(
                  (feature, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="bg-green-100 p-1.5 md:p-2 rounded-full mr-2 md:mr-3 shrink-0">
                        <CheckCircle className="text-green-600 w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <span className="text-gray-700 text-sm md:text-base font-medium">
                        {feature}
                      </span>
                    </div>
                  )
                )}
              </div>

              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 md:py-3 px-6 md:px-8 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all text-sm md:text-base">
                Learn More About EasyPortal
                <ChevronRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden mt-6 lg:mt-0">
              <div className="bg-indigo-600 p-3 md:p-4 text-white text-center">
                <h3 className="font-bold text-lg md:text-xl">EasyPortal Dashboard</h3>
              </div>
              <div className="p-4 md:p-6">
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

        {/* Call to Action - More responsive padding */}
        <div className="text-center bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl p-8 md:p-12 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Join over 2000+ businesses that trust EasyToCheck for their Zoho
            implementation and development needs.
          </p>
        </div>
      </div>

      {/* Footer - More responsive */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Globe className="text-white" size={20} />
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-white">Easy Portal</h4>
              </div>
              <p className="mt-3 md:mt-4 text-gray-400 max-w-md text-sm md:text-base">
                Transform your business with our powerful CRM solution.
                Streamline workflows and increase customer satisfaction.
              </p>
              <div className="mt-4 md:mt-6 flex space-x-3 md:space-x-4">
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
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <social.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div className="col-span-1">
              <h4 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Product</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Company</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    to="/app/signup"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h4 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-white">Legal</h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
                  >
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm md:text-base">
                © 2025 Easy Portal. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <select className="bg-gray-800 text-gray-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-gray-700 text-sm md:text-base">
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
        
        @media (max-width: 640px) {
          @keyframes pendulum {
            0% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
            100% { transform: rotate(-3deg); }
          }
        }
      `}</style>
    </div>
  );
}
