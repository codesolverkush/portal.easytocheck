import React, { useState } from "react";
import Navbar from "../common/Navbar";
import { 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Banknote, 
  Landmark, 
  IndianRupee,
  CheckCircle,
  Shield
} from "lucide-react";

const LicenseExpiredPage = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Function to handle payment via Razorpay
  const handleRenewLicense = () => {
    setProcessing(true);
    
    // This would typically come from your backend
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: "5000000", // 50,000.00 INR in subunits
      currency: "INR",
      name: "EasyPortal Premium",
      description: "Annual License Renewal",
      image: "https://yourdomain.com/logo.png",
      order_id: "", // This would come from your backend
      handler: function (response) {
        // Handle successful payment
        setProcessing(false);
        setPaymentSuccess(true);
        setTimeout(() => {
          setShowPaymentModal(false);
          // You would typically redirect to dashboard or refresh the page here
        }, 3000);
        
        // You would typically call your backend API here to verify payment
        console.log(`Payment ID: ${response.razorpay_payment_id}`);
      },
      modal: {
        ondismiss: function() {
          setProcessing(false);
          setShowPaymentModal(false);
        },
      },
      prefill: {
        name: "User Name", // Would come from your user data
        email: "user@example.com",
        contact: "9999999999",
      },
      notes: {
        licenseType: "Premium",
        userId: "user_id_here",
      },
      theme: {
        color: "#4f46e5",
      },
    };

    // Initialize Razorpay
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  // Our custom payment modal
  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
          <h2 className="text-2xl font-bold">Renew Your License</h2>
          <p className="text-indigo-100">Premium Plan - Annual Subscription</p>
        </div>
        
        <div className="p-6">
          {paymentSuccess ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your license has been renewed successfully.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">License Fee</span>
                  <span className="font-medium">₹45,000.00</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹5,000.00</span>
                </div>
                <div className="h-px bg-gray-200 my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span>₹50,000.00</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your payment information is processed securely through Razorpay's encrypted payment gateway.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  disabled={processing}
                  className="w-full py-3 px-6 text-white font-medium bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transform transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75"
                >
                  {processing ? "Processing..." : "Pay ₹50,000.00"}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-2 px-6 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex justify-center space-x-4 mb-2">
            <CreditCard className="h-6 w-6 text-indigo-600" title="Credit Card" />
            <Landmark className="h-6 w-6 text-yellow-500" title="Netbanking" />
            <Banknote className="h-6 w-6 text-red-500" title="Wallet" />
            <IndianRupee className="h-6 w-6 text-green-500" title="UPI" />
          </div>
          <p className="text-xs text-gray-400 text-center">
            Secured by Razorpay Payment Gateway
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden relative">
          {/* Red accent border at top with animated pulse */}
          <div className="h-2 bg-red-500 w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-300 to-transparent animate-pulse"></div>
          </div>

          {/* Content area */}
          <div className="p-8">
            {/* Alert icon with subtle animation */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6 animate-bounce-slow">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
              License Expired
            </h1>

            {/* Stylish divider */}
            <div className="flex items-center justify-center mb-4">
              <div className="h-1 w-8 bg-red-300 rounded-full"></div>
              <div className="h-1 w-16 bg-red-500 rounded-full mx-1"></div>
              <div className="h-1 w-8 bg-red-300 rounded-full"></div>
            </div>

            {/* Description with better typography */}
            <p className="text-gray-600 text-center mb-4 leading-relaxed">
              Your premium access has expired. Renew now to continue enjoying all 
              features and exclusive benefits of our platform.
            </p>

            {/* Lockout info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-amber-800 text-sm text-center">
                Your access will be completely restricted in <span className="font-bold">48 hours</span>. 
                Please renew to avoid service interruption.
              </p>
            </div>

            {/* CTA Button with enhanced styling */}
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 px-6 text-white font-medium bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transform transition hover:-translate-y-1 active:translate-y-0 relative overflow-hidden group"
            >
              <span className="relative z-10">Renew License Now</span>
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
            </button>

            {/* Payment options */}
            <div className="mt-6">
              <div className="flex items-center justify-center space-x-4">
                <CreditCard className="h-6 w-6 text-indigo-600" title="Credit Card" />
                <Landmark className="h-6 w-6 text-yellow-500" title="Netbanking" />
                <Banknote className="h-6 w-6 text-red-500" title="Wallet" />
                <IndianRupee className="h-6 w-6 text-green-500" title="UPI" />
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">
                Secure payment powered by Razorpay
              </p>
            </div>

            {/* Support section with improved styling */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Need assistance with your renewal?
              </p>
              <div className="flex items-center justify-center mt-4 space-x-4">
                <a
                  href="mailto:support@easyportal.com"
                  className="flex items-center text-indigo-600 hover:text-indigo-700 transition"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Email Support</span>
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="#"
                  className="flex items-center text-indigo-600 hover:text-indigo-700 transition"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Live Chat</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the payment modal conditionally */}
      {showPaymentModal && <PaymentModal />}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        
        .animate-shine {
          animation: shine 1.5s;
        }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default LicenseExpiredPage;