import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Settings,
  Check,
  DragVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";
import { sourceColors, uiColors, hoverColors, textColors, bgColors } from "../../../config/colors";

const Shimmer = () => {
  return (
    <div className="animate-pulse">
      <Navbar />
      <div className="p-4">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-20 bg-gray-200 my-2 rounded w-full"
          ></div>
        ))}
      </div>
    </div>
  );
};

const AccountView = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [accountsPerPage, setAccountsPerPage] = useState(10);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);

  // Access control variable
  const [accessScore, setAccessScore] = useState(4);

  // setting the error

  const [error, setError] = useState(null);

  const [newAccount, setNewAccount] = useState({
    Last_Name: "",
    Email: "",
    Phone: "",
    Lead_Source: "Cold Call",
  });

  // Managed Column variable

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    Account_Name: true,
    Account_Type: true,
    Phone: true,
    Ownership: true,
    Created_Time: true,
  });

  const navigate = useNavigate();

  // Add this function to handle column toggling
  const toggleColumn = (columnName) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnName]: !prev[columnName],
    }));
  };

  // Add this function to save column settings
  const saveColumnSettings = () => {
    // Optionally save to localStorage to persist user preferences
    localStorage.setItem("crm-account-columns", JSON.stringify(selectedColumns));
    setShowColumnModal(false);
  };

  // Add this useEffect to load saved column preferences on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("crm-account-columns");
    if (savedColumns) {
      setSelectedColumns(JSON.parse(savedColumns));
    }
  }, []);

  const ColumnManagementModal = () => {
    if (!showColumnModal) return null;

    const columnOptions = [
      { key: "Account_Name", label: "Account Name" },
      { key: "Account_Type", label: "Account Type" },
      { key: "Phone", label: "Phone" },
      { key: "Ownership", label: "Ownership" },
      { key: "Created_Time", label: "Created Time" },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold">Manage Columns</h2>
            <button
              onClick={() => setShowColumnModal(false)}
              className="text-gray-500"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Select the columns you want to display in the table.
            </p>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {columnOptions.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center p-2 hover:bg-gray-50 rounded"
                >
                  <input
                    type="checkbox"
                    id={`column-${column.key}`}
                    checked={selectedColumns[column.key]}
                    onChange={() => toggleColumn(column.key)}
                    className="mr-3 h-5 w-5 text-blue-500"
                  />
                  <label
                    htmlFor={`column-${column.key}`}
                    className="flex-grow cursor-pointer"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowColumnModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveColumnSettings}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CACHE_NAME = "crm-cache";

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      // Open Cache Storage
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/accounts");
      if (cachedResponse) {
        const data = await cachedResponse.json();
        setAccounts(data);
        setAccessScore(data?.accessScore);
        setLoading(false);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/get/accountdetails`
      );
      if (response.status === 200) {
        const data = response.data || [];
        setAccounts(data);
        setAccessScore(response?.data?.accessScore);

        // Store the fetched data in Cache Storage
        const newResponse = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/accounts", newResponse);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === "ORG_NOT_AUTHORIZED"
      ) {
        setError({ code: "ORG_NOT_AUTHORIZED" });
        // Optional: You can add a timeout before redirecting to show the error page
        setTimeout(() => {
          navigate("/app/connection");
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);


  useEffect(() => {
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }, [accountsPerPage]);

  const hardSync = async () => {
    setLoading(true);
    try {
      // Fetch the latest account details from the API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/get/accountdetails`
      );
      if (response.status === 200) {
        const data = response.data || [];
        setAccounts(data);
        setAccessScore(data?.accessScore);

        // Open Cache Storage and update with new data
        const cache = await caches.open(CACHE_NAME);
        const newResponse = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/accounts", newResponse);
      }
    } catch (error) {
      toast.error("Error fetching accounts!");
    } finally {
      setLoading(false);
    }
  };

  const getEachRecordHandler = (accountId) => {
    navigate("/app/accountprofile", { state: { accountId, accessScore } });
  };

  const handleSort = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const filterAccounts = () => {
    if (!accounts?.data) return [];

    let filteredAccounts = [...accounts.data?.data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredAccounts = filteredAccounts.filter(
        (account) =>
          (account.Account_Name &&
            account.Account_Name.toLowerCase().includes(term)) ||
          (account.Phone && account.Phone.toLowerCase().includes(term))
      );
    }

    if (sortField) {
      filteredAccounts.sort((a, b) => {
        // Special handling for Created_Time field
        if (sortField === "Created_Time") {
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

    return filteredAccounts;
  };
  const viewAccountDetails = (account) => {
    setSelectedAccount(account);
  };

  const closeAccountDetails = () => {
    setSelectedAccount(null);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Accounts`,
        newAccount
      );
      if (response?.status === 200) {
        toast.success("Account Created Successfully!");
        setIsCreateModalOpen(false);
        fetchAccounts();
        setNewAccount({
          Last_Name: "",
          Email: "",
          Phone: "",
          Lead_Source: "Cold Call",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get filtered accounts once
  const filteredAccounts = filterAccounts();
  // Calculate total based on the filtered array length
  const totalAccounts = filteredAccounts.length;
  // Calculate total pages
  const totalPages = Math.ceil(totalAccounts / accountsPerPage);
  // Calculate indices for slicing
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  // Get current page accounts
  const currentAccounts = filteredAccounts.slice(
    indexOfFirstAccount,
    indexOfLastAccount
  );

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Pagination logic added from LeadView
  const handleAccountsPerPageChange = (value) => {
    setAccountsPerPage(Number(value));
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
          <p className="text-gray-600 mb-6">
            Your organization is not authorized. Please set up a connection to
            continue.
          </p>
          <button
            onClick={() => navigate("/app/connection")}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex flex-col sm:flex-row w-full justify-between mb-4 md:mb-0 mr-5">
              <h1 className={`text-2xl font-bold ${textColors.primary} mb-3 sm:mb-0`}>
                Account Management
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4">
              
                <button
                  onClick={hardSync}
                  className={`flex-1 sm:flex-none ${bgColors.primary} text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center ${hoverColors.primary} transition-colors text-sm md:text-base`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 md:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync Now
                </button>

                <button
                  onClick={() => setShowColumnModal(true)}
                  className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg sm:flex items-center justify-center hidden hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  <Settings size={16} className="mr-1 md:mr-2" />
                  <span>Manage Columns</span>
                </button>
                {accessScore < 2 ? (
                  <Link
                    to="/app/accountcreate"
                    onClick={() =>
                      toast.error(
                        "Insufficient access rights to create a account."
                      )
                    }
                    className={`flex-1 sm:flex-none ${bgColors.primary} text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center ${hoverColors.primary} transition-colors text-sm md:text-base opacity-50 cursor-not-allowed`}
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create Account</span>
                    <span className="sm:hidden">Create</span>
                  </Link>
                ) : (
                  <Link
                    to="/app/accountcreate"
                    onClick={() => setIsCreateModalOpen(true)}
                    className={`flex-1 sm:flex-none ${bgColors.primary} text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center ${hoverColors.primary} transition-colors text-sm md:text-base`}
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create Account</span>
                    <span className="sm:hidden">Create</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="w-full md:w-64 relative">
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-800"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="md:hidden relative mb-4">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Show:</span>
                <button
                  onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                  className="border rounded px-3 py-1 text-sm flex items-center justify-between w-20"
                >
                  {accountsPerPage}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isItemsPerPageOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {totalAccounts > 0
                  ? `${indexOfFirstAccount + 1}-${Math.min(
                      indexOfLastAccount,
                      totalAccounts
                    )} of ${totalAccounts}`
                  : `0 accounts`}
              </div>
            </div>

            {isItemsPerPageOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                {[10, 20, 30, 50, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAccountsPerPageChange(value)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      accountsPerPage === value
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow">
            <div className="flex items-center">
              <label
                htmlFor="accountsPerPage"
                className="mr-2 text-sm text-gray-600"
              >
                Show:
              </label>
              <select
                id="accountsPerPage"
                value={accountsPerPage}
                onChange={(e) => handleAccountsPerPageChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2 text-sm text-gray-600">
                accounts per page
              </span>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {totalAccounts > 0
                  ? `Showing ${indexOfFirstAccount + 1} to ${Math.min(
                      indexOfLastAccount,
                      totalAccounts
                    )} of ${totalAccounts} accounts`
                  : `0 accounts found`}
              </span>
              <div className="flex">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1 mx-1 rounded ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : `${textColors.primary} hover:bg-blue-100`
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1 mx-1 rounded ${
                    currentPage === totalPages || totalPages === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-500 hover:bg-blue-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                     {selectedColumns["Account_Name"] && (
                      <th
                        className="p-4 cursor-pointer"
                        onClick={() => handleSort("Account_Name")}
                      >
                        <div className="flex items-center">
                            Account Name
                          {sortField === "Account_Name" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    )}

                    {selectedColumns["Account_Type"] && <th className="p-4">Account Type</th>}

                    {selectedColumns["Phone"] && (
                      <th
                        className="p-4 cursor-pointer"
                        onClick={() => handleSort("Phone")}
                      >
                        <div className="flex items-center">
                          Phone
                          {sortField === "Phone" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                    {selectedColumns["Ownership"] && <th className="p-4">Ownership</th>}
                    {selectedColumns["Created_Time"] && (
                      <th
                        className="p-4 cursor-pointer"
                        onClick={() => handleSort("Created_Time")}
                      >
                        <div className="flex items-center">
                          Created Time
                          {sortField === "Created_Time" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentAccounts.length > 0 ? (
                    currentAccounts.map((account, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => getEachRecordHandler(account.id)}
                      >
                        {selectedColumns["Account_Name"] && (
                          <td className="p-4 text-sm font-medium text-gray-700">
                            {account.Account_Name || "-"}
                          </td>
                        )}
                        {selectedColumns["Account_Type"] && (
                          <td className="p-4 text-sm font-medium text-gray-700">
                            {account.Account_Type || "-"}
                          </td>
                        )}
                        {selectedColumns["Phone"] && (
                          <td className="p-4 text-sm">{account.Phone || "-"}</td>
                        )}
                        {selectedColumns["Ownership"] && (
                          <td className="p-4 text-sm">{account.Ownership || "-"}</td>
                        )}
                       
                        {selectedColumns["Created_Time"] && (
                          <td className="p-4 text-sm">
                            {moment(account.Created_Time).format("DD-MM-YY HH:mm") ||
                              "-"}
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={
                          Object.values(selectedColumns).filter(Boolean).length
                        }
                        className="p-4 text-center text-gray-500"
                      >
                        No accounts available.{" "}
                        {searchTerm && "Try a different search term."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {currentAccounts.length > 0 ? (
                currentAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-blue-800"
                    onClick={() => viewAccountDetails(account)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-800">
                        {account.Account_Name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="font-medium mr-1">Phone:</span>{" "}
                        {account.Phone || "-"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                  No accounts available.{" "}
                  {searchTerm && "Try a different search term."}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4">
            {totalAccounts > 0 && (
              <div className="md:hidden flex justify-between items-center bg-white p-4 rounded-lg shadow-lg sticky bottom-0">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-800'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-800'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {totalAccounts > 0 && (
              <div className="hidden md:flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-lg sticky bottom-0">
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
        </div>

        {selectedAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Account Details</h2>
                <button onClick={closeAccountDetails} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      Account Name
                    </span>
                    <span className="block text-sm">
                      {selectedAccount.Account_Name}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      PHONE
                    </span>
                    <span className="block text-sm">
                      {selectedAccount.Phone || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">
                      EMAIL
                    </span>
                    <span className="block text-sm">
                      {selectedAccount.Email || "-"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    closeAccountDetails();
                    getEachRecordHandler(selectedAccount.id);
                  }}
                  className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

        
        <ColumnManagementModal/>
      </div>
    </>
  );
};

export default AccountView ;
