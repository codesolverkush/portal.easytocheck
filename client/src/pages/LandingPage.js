import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import {
  AlertCircle,
  BarChart2,
  Users,
  Mail,
  Shield,
  ArrowRight,
  CheckCircle,
  Phone,
  Globe,
  ChevronDown,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
} from "lucide-react";
import Navbar2 from "./Navbar2";
import { FaFacebook, FaHeadphones } from "react-icons/fa";
import IconZ from "../component/ui/Icons";
import { openSupportPopup } from "../utils/supportTrigger";
import supportLogo from '../images/support1.png'

const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [images, setImages] = useState({});

  // Form refs for auto-filling
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const messageInputRef = useRef(null);

  console.log(images);

  const yearlyDiscount = 0.2; // 20% discount for yearly billing

  const plan = {
    name: "Professional Plus",
    monthlyPrice: 500,
    features: [
      "Complete Pre Sales Access",
      "Admin Control",
      "Record Supervision available",
      "Easy connect with Zoho CRM",
      "Advanced Dashboard",
      "Multiple Session available",
      "Priority 24/7 Support*",
      "Custom Branding Options*",
      "Admin Portal",
    ],
  };

  // Calculate yearly price with discount
  const yearlyPrice = Math.round(plan.monthlyPrice * 12 * (1 - yearlyDiscount));
  // Calculate monthly equivalent price as a whole number
  const monthlyEquivalent = Math.floor(yearlyPrice / 12);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //  Fetching the image

  // useEffect(() => {
  //   const fetchMetaData = async () => {
  //     try {
  //       const cache = await caches.open("meta-data");

  //       // Check if data is present in cache
  //       const cachedResponse = await cache.match("/images");
  //       if (cachedResponse) {
  //         const data = await cachedResponse.json();
  //         console.log(data);
  //         setImages(data);
  //         return;
  //       }

  //       const response = await axios.get(
  //         `${process.env.REACT_APP_APP_API}/getmetadata/images`
  //       );

  //       if (response.status === 200) {
  //         setImages(response?.data?.data[0]?.etcadminlogs);
  //         const newResponse = new Response(
  //           JSON.stringify(response?.data?.data[0]?.etcadminlogs),
  //           { headers: { "Content-Type": "application/json" } }
  //         );
  //         await cache.put("/images", newResponse);
  //       }
  //     } catch (error) {
  //       // Silently redirect to signup without showing error
  //       // 
        
  //     }
  //   };

  //   fetchMetaData();
  // }, [setImages]);

  useEffect(() => {
    const fetchMetaData = async () => {
      try {
        const cache = await caches.open("meta-data");
        const cacheKey = `${process.env.REACT_APP_APP_API}/getmetadata/images`;
  
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          const data = await cachedResponse.json();
          setImages(data);
          return;
        }
  
        const response = await axios.get(cacheKey);
  
        if (response.status === 200) {
          const metaData = response?.data?.data[0]?.etcadminlogs;
          setImages(metaData);
          const newResponse = new Response(JSON.stringify(metaData), {
            headers: { "Content-Type": "application/json" },
          });
          await cache.put(cacheKey, newResponse);
        }
      } catch (error) {
        console.error("Metadata Fetch Error:", error);
        // Optionally redirect or show fallback
      }
    };
  
    fetchMetaData();
  }, []);
  

  const openSameWindow = (url) => {
    window.open(url, "_self");
  };

  const features = [
    {
      icon: <Users size={24} />,
      title: "Team Management",
      description:
        "Efficiently manage your team and track their performance in real-time",
    },
    {
      icon: <BarChart2 size={24} />,
      title: "Analytics",
      description:
        "Get detailed insights and reports to make data-driven decisions",
    },
    {
      icon: <Mail size={24} />,
      title: "Email Integration",
      description:
        "Seamless email integration with your favorite email providers",
    },
    {
      icon: <Shield size={24} />,
      title: "Security",
      description: "Enterprise-grade security to protect your sensitive data",
    },
  ];

  // Function to handle scrolling and auto-fill contact form
  const scrollToDemo = (sectionId, event, autoFill = false) => {
    event.preventDefault();

    // Close mobile menu if open
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }

    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // Update URL without page reload
      window.history.pushState({}, "", `#${sectionId}`);

      // If autoFill is true, fill the form with dummy data
      if (autoFill && sectionId === "contact-form") {
        setTimeout(() => {
          if (nameInputRef.current) nameInputRef.current.value = "";
          if (emailInputRef.current) emailInputRef.current.value = "";
          if (messageInputRef.current)
            messageInputRef.current.value =
              "I'd like to schedule a demo to learn more about your portal. Please contact me at your earliest convenience.";
        }, 800); // Slight delay to ensure smooth scrolling completes
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar2 />

      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-70 z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25px 25px, #e0e7ff 2px, transparent 0), radial-gradient(circle at 75px 75px, #e0e7ff 2px, transparent 0)",
              backgroundSize: "100px 100px",
            }}
          ></div>
        </div>

        <div className="relative z-10 pt-20 md:pt-40 pb-20 px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="w-full lg:w-1/2 text-center lg:text-left lg:pr-12 sm:mb-10 mb-10">
              <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4 md:mb-6">
                Easy Portal for Light Users
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Business with Our{" "}
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Portal
                </span>
              </h2>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Assign Light Users or Field Agents to their respective Leads,
                Contacts, and all Pre-Sales module records. Enable one-tap
                connection with your Zoho CRM.
              </p>

              <div className="mt-6 md:mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <button
                  onClick={() => openSameWindow(`/__catalyst/auth/signup`)}
                  className="px-8 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Start Free Trial <ArrowRight size={20} />
                </button>
                <button
                  onClick={(e) => scrollToDemo("contact-form", e, true)}
                  className="px-8 py-3.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Phone size={20} /> Schedule Demo
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-white text-xs font-bold"
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div className="ml-3 text-sm text-gray-600">
                  <span className="font-semibold text-indigo-600">500+</span>{" "}
                  companies already using our Portal
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 mt-12 lg:mt-0">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="w-full h-full absolute -left-2 md:-left-4 -top-2 md:-top-4 bg-indigo-200 rounded-xl"></div>
                <div className="relative bg-white p-2 md:p-4 rounded-xl shadow-2xl border border-gray-100">
                  <img
                    src="https://www.onepagecrm.com/wp-content/uploads/blog-crm-dashboard-header-v2.png"
                    alt="CRM Dashboard"
                    className="w-full rounded-lg"
                  />
                </div>
                <div className="absolute -bottom-6 md:-bottom-10 -right-4 md:-right-10 bg-white p-3 md:p-4 rounded-xl shadow-xl border border-gray-100">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 md:w-10 h-8 md:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle
                        size={16}
                        className="text-green-600 md:text-lg"
                      />
                    </div>
                    <div>
                      <div className="text-xs md:text-sm font-semibold">
                        Sales target reached
                      </div>
                      <div className="text-xs text-gray-500">
                        10 minutes ago
                      </div>
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
            <h3 className="text-4xl font-bold text-gray-900">
              Powerful Features
            </h3>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your business effectively and
              delight your customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 group"
              >
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </h4>
                <p className="mt-3 text-gray-600">{feature.description}</p>
                <Link
                  to="#"
                  className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  Learn more <ArrowRight size={16} className="ml-1" />
                </Link>
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
                  <h3 className="text-3xl font-bold text-gray-900">
                    Monitor all customer activity in one place
                  </h3>
                  <p className="mt-4 text-gray-600">
                    Get a comprehensive view of your customer interactions,
                    purchase history, and support tickets to provide the best
                    service possible.
                  </p>

                  <div className="mt-8 space-y-4">
                    {[
                      "Real-time activity tracking",
                      "Customizable dashboard views",
                      "Advanced filtering options",
                    ].map((item, i) => (
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
                  <img
                    src={images?.image2}
                    alt="Dashboard Preview"
                    className="rounded-lg shadow-lg max-w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
              Pricing
            </div>
            <h3 className="text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h3>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              All features included. No hidden fees.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-white p-1 rounded-lg shadow-sm inline-flex items-center">
              <button
                className={`px-4 py-2 ${
                  billingCycle === "monthly"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700"
                } rounded-md`}
                onClick={() => setBillingCycle("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 ${
                  billingCycle === "yearly"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700"
                } rounded-md`}
                onClick={() => setBillingCycle("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-indigo-600 ring-2 ring-indigo-600 ring-opacity-20">
              <div className="bg-indigo-600 text-white text-sm font-medium py-2 text-center">
                Most Popular
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h4>
                <div className="mt-4 flex items-baseline">
                  {billingCycle === "monthly" ? (
                    <>
                      <div className="text-5xl font-bold text-gray-900">
                        {plan.monthlyPrice}
                      </div>
                      <div className="ml-1 text-xl font-normal text-gray-500">
                        /month
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl font-bold text-gray-900">
                        {monthlyEquivalent}
                      </div>
                      <div className="ml-1 text-xl font-normal text-gray-500">
                        /month
                      </div>
                    </>
                  )}
                </div>

                {billingCycle === "monthly" ? (
                  <p className="mt-2 text-gray-500">Billed monthly</p>
                ) : (
                  <div className="mt-2">
                    <p className="text-gray-500">
                      Billed annually ({yearlyPrice})
                    </p>
                    <p className="text-green-600 font-medium">
                      Save {Math.round(plan.monthlyPrice * 12 - yearlyPrice)}{" "}
                      with annual billing
                    </p>
                  </div>
                )}

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle
                        size={20}
                        className="flex-shrink-0 text-indigo-600 mt-0.5"
                      />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="mt-8 w-full px-6 py-3.5 rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700 shadow-md">
                  Get Started Now
                </button>

                {billingCycle === "yearly" && (
                  <p className="mt-4 text-center text-sm text-indigo-600 font-medium">
                    30-day money-back guarantee
                  </p>
                )}
              </div>
            </div>
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
              <p className="mt-4 text-xl text-gray-600">
                Have questions or need help? We're here for you.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Mail size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Email Us
                    </h4>
                    <p className="mt-1 text-gray-600">
                      Our friendly team is here to help.
                    </p>
                    <Link
                      to="mailto:zoho@easytocheck.com"
                      className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
                    >
                      zoho@easytocheck.com
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Phone size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Call Us
                    </h4>
                    <p className="mt-1 text-gray-600">
                      Mon-Fri from 8am to 5pm.
                    </p>
                    <Link
                      to="tel:+919899277932"
                      className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
                    >
                      +91 9899277932
                    </Link>
                    <br />
                    <Link
                      to="tel:+918789711238"
                      className="mt-2 inline-block text-indigo-600 hover:text-indigo-800"
                    >
                      +91 8789711238
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Globe size={24} className="text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Visit Us
                    </h4>
                    <p className="mt-1 text-gray-600">
                      Come say hello at our office.
                    </p>
                    <p className="mt-2 text-gray-600">
                      C312, Tower C, Noida One IT Park, Sec 62
                      <br />
                      Noida (National Capital Region), India, 201309
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="contact-form"
              className="bg-gray-50 rounded-2xl p-8 shadow-md"
            >
              <h4 className="text-xl font-semibold text-gray-900 mb-6">
                Send us a message
              </h4>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    ref={nameInputRef}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    ref={emailInputRef}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    ref={messageInputRef}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
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
                    to="#features"
                    onClick={(e) => scrollToDemo("features", e)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    to="#pricing"
                    onClick={(e) => scrollToDemo("pricing", e)}
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
                    to="#about"
                    onClick={(e) => scrollToDemo("about", e)}
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
                    to="#contact"
                    onClick={(e) => scrollToDemo("contact", e)}
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
            <div className="mt-4 md:mt-0">
                <button
                  onClick={openSupportPopup}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Support"
                >
                  {/* Font Awesome Headset Icon */}
                    <img
                      src={supportLogo}
                      alt="Support"
                      className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                    />
                </button>
              </div>
              <p className="text-gray-400">
                © 2025 Easy Portal. All rights reserved.
              </p>
 
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

