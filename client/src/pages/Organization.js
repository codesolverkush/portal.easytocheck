import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import Navbar from "../component/common/Navbar";
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import { useDispatch } from "react-redux";
import { setCookies, setOrgId } from "../redux/reducers/auth";

const Organization = () => {
   
  const [formData, setFormData] = useState({
    domain: '',
    orgName: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    displayname: '',
    crmdomain: '',
    activationdate: new Date().toISOString().split('T')[0],
    activationEndDate: new Date(new Date().getTime() + 15*24*60*60*1000).toISOString().split('T')[0] ,
    superadminEmail: ''
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [selectedDomainLabel, setSelectedDomainLabel] = useState('');
  const [existingOrgId, setExistingOrgId] = useState(null);


  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const crmDomains = [
  //   { value: 'https://www.zohoapis.com', label: 'zoho.com' },
  //   { value: 'https://www.zohoapis.in', label: 'zoho.in' },
  //   { value: 'https://www.zohoapis.cn', label: 'zoho.cn' },
  //   { value: 'https://www.zohoapis.co.au', label: 'zoho.co.au' }
  // ];

  const crmDomains = [
    { value: 'com', label: 'zoho.com' },
    { value: 'in', label: 'zoho.in' },
    { value: 'cn', label: 'zoho.cn' },
    { value: 'co.au', label: 'zoho.co.au' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDomainSelection = (domain) => {
    setFormData(prev => ({
      ...prev,
      crmdomain: domain.value
    }));
    setSelectedDomainLabel(domain.label);
    setIsDropdownOpen(false);
  };

  const fetchAddressDetails = async (pincode) => {
    // if (pincode.length !== 6) return;
    
    setIsLoadingPincode(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data[0].Status === "Success" && response.data[0].PostOffice?.length > 0) {
        const addressData = response.data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: addressData.District,
          state: addressData.State,
          country: addressData.Country
        }));
      } else {
        toast.error("Data not found, so please fill it manually!");
      }
    } catch (error) {
      toast.error("Error fetching address details");
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handlePincodeBlur = (e) => {
    const pincode = e.target.value;
    if (pincode) {
      fetchAddressDetails(pincode);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/register`, {
        ...formData,
      });
      
      if (response.status === 200) {
        const orgId = response.data?.data[0]?.Organization.ROWID;

        if(orgId){
          dispatch(setCookies(orgId));
          dispatch(setOrgId(orgId)); // Store orgId in Redux
        }
      
        navigate('/app/orgProfile', { state: { orgId } });
        toast.success('Organization registered successfully!');
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error";
      toast.error(message);
    }
  };

  const handleGoToProfile = () => {
    navigate('/app/orgProfile', { state: { orgId: existingOrgId } });
  };

  useEffect(() => {    
    const cookieOrgId = Cookies.get("orgRowId");
    if (!cookieOrgId) {
      setExistingOrgId(null);
      return;
    }
  
    const org_id = decryptData(cookieOrgId);
    
    if (org_id) {
      setExistingOrgId(org_id);
    } else {
      setExistingOrgId(null); // Explicitly set to null if decryption fails
    }
  },[]);
 
  const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;
  
  const decryptData = (ciphertext) => {
    try {
      // Make sure SECRET_KEY is defined and not undefined
      if (!SECRET_KEY) {
        toast.error("Something is missing!");
        return null;
      }
      
      // Properly decrypt the data using the key
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      
      // Verify we have valid text before trying to parse JSON
      if (!decryptedText) {
        toast.error("Failed to decrypt data");
        return null;
      }
      
      // Try to parse as JSON
      return JSON.parse(decryptedText);
    } catch (error) {
      toast.error("Error decrypting data:");
      return null;
    }
  };




  if (existingOrgId) {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Organization Registered Successfully!</h2>
              <p className="text-gray-600 mb-6">
                You Organization have been registered successfully. Now, You can visit your organization profile to view its details and.
                <span className="font-semibold text-blue-900">Connect with zoho crm</span>
              </p>
              <button
                onClick={handleGoToProfile}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Go to Organization Profile
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }


  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-center text-gray-800">Organization Registration</h2>
            </div>
            <div className="p-6">
              <form onSubmit={submitHandler} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Domain
                      </label>
                      <input
                        type="text"
                        value={formData.domain}
                        onChange={(e) => handleInputChange('domain', e.target.value)}
                        placeholder="Enter domain"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={formData.orgName}
                        onChange={(e) => handleInputChange('orgName', e.target.value)}
                        placeholder="Enter organization name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={formData.displayname}
                        onChange={(e) => handleInputChange('displayname', e.target.value)}
                        placeholder="Enter display name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CRM Domain
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          {selectedDomainLabel || "Select CRM domain"}
                        </button>
                        {isDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                            {crmDomains.map((domain) => (
                              <button
                                key={domain.value}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-gray-100"
                                onClick={() => handleDomainSelection(domain)}
                              >
                                {domain.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="Enter street address"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          value={formData.zip}
                          onChange={(e) => handleInputChange('zip', e.target.value)}
                          onBlur={handlePincodeBlur}
                          placeholder="Enter PIN code"
                          maxLength={6}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="State"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Country"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activation Date
                      </label>
                      <input
                        type="date"
                        value={formData.activationdate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activation End Date
                      </label>
                      <input
                        type="date"
                        value={formData.activationEndDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Super Admin Email
                      </label>
                      <input
                        type="email"
                        value={formData.superadminEmail}
                        onChange={(e) => handleInputChange('superadminEmail', e.target.value)}
                        placeholder="Enter super admin email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isactive}
                          onChange={(e) => handleInputChange('isactive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Active Status</span>
                      </label>
                    </div> */}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Register Organization
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6 bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-600">
              Need help? Contact us at{" "}
              <a href="mailto:kushal@gmail.com" className="text-blue-600 hover:underline">
                kushal@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Organization;