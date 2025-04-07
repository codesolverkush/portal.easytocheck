import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowUp, ArrowDown, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

const sourceColors = {
  "Closed Lost": "bg-red-200 text-red-700",
  "Cold Call": "bg-yellow-200 text-yellow-700",
  "Advertisement": "bg-blue-200 text-blue-700",
  "Closed Won": "bg-green-200 text-green-700",
  "Employee Referral": "bg-purple-200 text-purple-700",
};

const Shimmer = () => {
  return (
    <div className="animate-pulse">
      <Navbar />
      <div className="p-4">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 bg-gray-200 my-2 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};

const DealView = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [dealsPerPage, setDealsPerPage] = useState(10);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);


  // Access control variable 
  const [accessScore,setAccessScore] = useState(4);

  // setting the error

  const [error,setError] = useState(null);
  const navigate = useNavigate();

  const CACHE_NAME = "crm-cache";

  const fetchDeals = async () => {
    setLoading(true);
    try {
      // Open Cache Storage
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/deals");
      if (cachedResponse) {
        const data = await cachedResponse.json();
        console.log(data);
        setDeals(data);
        setAccessScore(data?.accessScore);
        setLoading(false);      
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/dealdetails`);
      console.log(response);
      if (response.status === 200) {
        const data = response.data || [];
        setDeals(data);
        setAccessScore(response?.data?.accessScore);

        console.log(data);

        // Store the fetched data in Cache Storage
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/deals", newResponse);
      }
    } catch (error) {
      console.error("Error fetching deals", error);
      if (error.response && error.response.data && error.response.data.code === "ORG_NOT_AUTHORIZED") {
        setError({ code: "ORG_NOT_AUTHORIZED" });
        // Optional: You can add a timeout before redirecting to show the error page
        setTimeout(() => {
          navigate('/app/connection');
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  useEffect(() => {
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }, [dealsPerPage]);

  const hardSync = async () => {
    setLoading(true);
    try {
      // Fetch the latest deal details from the API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/dealdetails`);
      console.log(response);
      if (response.status === 200) {
        const data = response.data || [];
        setDeals(data);
        setAccessScore(data?.accessScore);

        // Open Cache Storage and update with new data
        const cache = await caches.open(CACHE_NAME);
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/deals", newResponse);

      }
    } catch (error) {
      console.error("Error fetching deals", error);
    } finally {
      setLoading(false);
    }
  };

  // Add new handlers for different types of clicks
  const handleDealClick = (dealId) => {
    navigate('/app/dealprofile', { state: { dealId, accessScore } });
  };

  const handleContactClick = (contactId) => {
    navigate('/app/contactprofile', { state: { contactId, accessScore } });
  };

  const handleAccountClick = (accountId) => {
    navigate('/app/accountprofile', { state: { accountId, accessScore } });
  };

  // Modify the getEachRecordHandler to handle different types
  const getEachRecordHandler = (id, type) => {
    switch(type) {
      case 'deal':
        handleDealClick(id);
        break;
      case 'contact':
        handleContactClick(id);
        break;
      case 'account':
        handleAccountClick(id);
        break;
      default:
        handleDealClick(id); // Default to deal if type is not specified
    }
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const filterDeals = () => {
    if (!deals?.data) return [];
  
    let filteredDeals = [...deals.data?.data];
  
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredDeals = filteredDeals.filter(deal =>
        (deal.Deal_Name && deal.Deal_Name.toLowerCase().includes(term)) ||
        (deal.Contact_Name?.name && deal.Contact_Name?.name.toLowerCase().includes(term)) ||
        (deal.Account_Name?.name && deal.Account_Name?.name.toLowerCase().includes(term)) ||
        (deal.Stage && deal.Stage.toLowerCase().includes(term))
      );
    }
  
    if (sortField) {
      filteredDeals.sort((a, b) => {
        // Special handling for Created_Time field
        if (sortField === "Created_Time"){
          const aDate = a[sortField] ? new Date(a[sortField]) : new Date(0);
          const bDate = b[sortField] ? new Date(b[sortField]) : new Date(0);
          
          if (sortDirection === "asc") {
            return aDate.getTime() - bDate.getTime();
          } else {
            return bDate.getTime() - aDate.getTime();
          }
        } else {
          // For non-date fields, use string comparison
          const aValue = a[sortField] || "";
          const bValue = b[sortField] || "";
  
          if (sortDirection === "asc") {
            return aValue.localeCompare(bValue);
          } else {
            return bValue.localeCompare(aValue);
          }
        }
      });
    }
  
    return filteredDeals;
  };
  const viewDealDetails = (deal) => {
    setSelectedDeal(deal);
  };

  const closeDealDetails = () => {
    setSelectedDeal(null);
  };

  console.log(deals);


  // Get filtered deals once
  const filteredDeals = filterDeals();
  // Calculate total based on the filtered array length
  const totalDeals = filteredDeals.length;
  // Calculate total pages
  const totalPages = Math.ceil(totalDeals / dealsPerPage);
  // Calculate indices for slicing
  const indexOfLastDeal = currentPage * dealsPerPage;
  const indexOfFirstDeal = indexOfLastDeal - dealsPerPage;
  // Get current page deals
  const currentDeals = filteredDeals.slice(indexOfFirstDeal, indexOfLastDeal);

  const paginate = (pageNumber) => {
    if(pageNumber > 0 && pageNumber <= totalPages){
      setCurrentPage(pageNumber);
    }
  };

  // Pagination logic added from LeadView
  const handleDealsPerPageChange = (value) => {
    setDealsPerPage(Number(value));
    setIsItemsPerPageOpen(false);
  };

  if (loading) {
    return <Shimmer />;
  }


  // Add this check for organization authorization
  if (error && error.code === "ORG_NOT_AUTHORIZED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Connection Required</h2>
          <p className="text-gray-600 mb-6">Your organization is not authorized. Please set up a connection to continue.</p>
          <button 
            onClick={() => navigate('/app/connection')}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex flex-col sm:flex-row w-full justify-between mb-4 md:mb-0 mr-5">
            <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Deal Management</h1>
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button 
                onClick={hardSync} 
                className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
                </button>
             
                {accessScore < 2 ? (
                 <button 
                    onClick={() => toast.error("Insufficient access rights to create a lead")}
                    className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base opacity-50 cursor-not-allowed"
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create Deal</span>
                    <span className="sm:hidden">Create</span>
                  </button> 
                ) : (
                  <Link 
                    to="/app/dealCreate" 
                    className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base"
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create Deal</span>
                    <span className="sm:hidden">Create</span>
                  </Link>
                )}          
            </div>
          </div>

          <div className="w-full md:w-64 relative">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        
        {/* Mobile items per page selector */}
        <div className="md:hidden relative mb-4">
          <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Show:</span>
              <button
                onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                className="border rounded px-3 py-1 text-sm flex items-center justify-between w-20"
              >
                {dealsPerPage}
                <svg
                  className={`w-4 h-4 transition-transform ${isItemsPerPageOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {totalDeals > 0 
                ? `${indexOfFirstDeal + 1}-${Math.min(indexOfLastDeal, totalDeals)} of ${totalDeals}`
                : `0 deals`}
            </div>
          </div>
          
          {isItemsPerPageOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
              {[10, 20, 30, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => handleDealsPerPageChange(value)}
                  className={`block w-full text-left px-4 py-2 text-sm ${dealsPerPage === value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Pagination Controls - Top */}
        <div className="hidden md:flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
          <div className="flex items-center">
            <label htmlFor="dealsPerPage" className="mr-2 text-sm text-gray-600">Show:</label>
            <select
              id="dealsPerPage"
              value={dealsPerPage}
              onChange={(e) => handleDealsPerPageChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-sm text-gray-600">deals per page</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">
              {totalDeals > 0 
                ? `Showing ${indexOfFirstDeal + 1} to ${Math.min(indexOfLastDeal, totalDeals)} of ${totalDeals} deals`
                : `0 deals found`}
            </span>
            <div className="flex">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 mx-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-1 mx-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Deal listing for desktop */}
        <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4 cursor-pointer" onClick={() => handleSort("Full_Name")}>
                  <div className="flex items-center">
                    Deal Name
                    {sortField === "Full_Name" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-4">Contact Name</th>
                <th className="p-4">Account Name</th>
                <th className="p-4">Stage</th>
                <th className="p-4">Pipeline</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort("Created_Time")}>
                  <div className="flex items-center">
                    Created Time
                    {sortField === "Created_Time" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentDeals.length > 0 ? (
                currentDeals.map((deal) => (
                  <tr
                    key={deal.id}
                    className="border-t hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-700">
                      <span 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => getEachRecordHandler(deal.id, 'deal')}
                      >
                        {deal.Deal_Name}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {deal.Contact_Name?.id ? (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => getEachRecordHandler(deal.Contact_Name.id, 'contact')}
                        >
                          {deal.Contact_Name.name || '-'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {deal.Account_Name?.id ? (
                        <span 
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => getEachRecordHandler(deal.Account_Name.id, 'account')}
                        >
                          {deal.Account_Name.name || '-'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[deal.Stage] || "bg-gray-200 text-gray-700"}`}>
                        {deal.Stage || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[deal.Lead_Source] || "bg-gray-200 text-gray-700"}`}>
                        {deal.Pipeline || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{moment(deal.Created_Time).format("DD-MM-YY HH:mm") || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No deals available. {searchTerm && 'Try a different search term.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Deal cards for mobile */}
        <div className="md:hidden">
          {currentDeals.length > 0 ? (
            currentDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h3 
                      className="font-medium text-gray-800 cursor-pointer hover:text-blue-600"
                      onClick={() => getEachRecordHandler(deal.id, 'deal')}
                    >
                      {deal.Deal_Name}
                    </h3>
                    {deal.Contact_Name?.id && (
                      <span 
                        className="text-xs text-blue-500 cursor-pointer hover:underline mt-1"
                        onClick={() => getEachRecordHandler(deal.Contact_Name.id, 'contact')}
                      >
                        Contact: {deal.Contact_Name.name}
                      </span>
                    )}
                    {deal.Account_Name?.id && (
                      <span 
                        className="text-xs text-green-500 cursor-pointer hover:underline mt-1"
                        onClick={() => getEachRecordHandler(deal.Account_Name.id, 'account')}
                      >
                        Account: {deal.Account_Name.name}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColors[deal.Lead_Source] || "bg-gray-200 text-gray-700"}`}>
                    {deal.Stage || '-'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">Created:</span> {moment(deal.Created_Time).format("DD-MM-YY HH:mm") || "-"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No deals available. {searchTerm && 'Try a different search term.'}
            </div>
          )}
        </div>
        
        {/* Mobile Pagination Controls - Bottom */}
        {totalDeals > 0 && (
          <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Desktop Pagination Controls - Bottom */}
        {totalDeals > 0 && (
          <div className="hidden md:flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                First
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                Previous
              </button>
              
              {/* Page number buttons */}
              <div className="hidden sm:flex">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum <= totalPages) {
                    return (
                      <button
                        key={i}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 mx-1 rounded-full ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                Next
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deal details modal for mobile */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Deal Details</h2>
              <button onClick={closeDealDetails} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500">DEAL NAME</span>
                  <span 
                    className="block text-sm cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      closeDealDetails();
                      getEachRecordHandler(selectedDeal.id, 'deal');
                    }}
                  >
                    {selectedDeal.Deal_Name}
                  </span>
                </div>
                {selectedDeal.Contact_Name?.id && (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">CONTACT</span>
                    <span 
                      className="block text-sm text-blue-500 cursor-pointer hover:underline"
                      onClick={() => {
                        closeDealDetails();
                        getEachRecordHandler(selectedDeal.Contact_Name.id, 'contact');
                      }}
                    >
                      {selectedDeal.Contact_Name.name}
                    </span>
                  </div>
                )}
                {selectedDeal.Account_Name?.id && (
                  <div>
                    <span className="block text-xs font-medium text-gray-500">ACCOUNT</span>
                    <span 
                      className="block text-sm text-green-500 cursor-pointer hover:underline"
                      onClick={() => {
                        closeDealDetails();
                        getEachRecordHandler(selectedDeal.Account_Name.id, 'account');
                      }}
                    >
                      {selectedDeal.Account_Name.name}
                    </span>
                  </div>
                )}
                <div>
                  <span className="block text-xs font-medium text-gray-500">STAGE</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${sourceColors[selectedDeal.Lead_Source] || "bg-gray-200 text-gray-700"}`}>
                    {selectedDeal.Stage || '-'}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">CREATED TIME</span>
                  <span className="block text-sm">{moment(selectedDeal.Created_Time).format("DD-MM-YY HH:mm") || "-"}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  closeDealDetails();
                  getEachRecordHandler(selectedDeal.id, 'deal');
                }}
                className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealView;