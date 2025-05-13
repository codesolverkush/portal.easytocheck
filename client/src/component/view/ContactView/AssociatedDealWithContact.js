import React from "react";
import { Calendar, DollarSign, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedTaskLoading from "../../ui/EnhancedTaskLoading";

const AssociatedDealWithContact = ({ deals, loading = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDealClick = (dealId) => {
    navigate('/app/dealprofile', { state: { dealId } });
  };

  const renderValue = (value) => {
    if (!value) return "—";
    if (typeof value === 'object') {
      return value.name || value.id || "—";
    }
    return value;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <EnhancedTaskLoading name="Deals" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-800">
            Associated Deals ({deals?.length || 0})
          </h2>
        </div>

        {!deals || deals.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No associated deals found for this contact.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Closing Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map((deal) => (
                  <tr 
                    key={deal.id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    onClick={() => handleDealClick(deal.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {renderValue(deal.Deal_Name)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {renderValue(deal.Account_Name)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {formatCurrency(deal.Amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95">
                        {renderValue(deal.Stage)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(deal.Created_Time)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-red-500">
                        <Calendar className="h-4 w-4 text-red-400 mr-1" />
                        {formatDate(deal.Closing_Date)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociatedDealWithContact;