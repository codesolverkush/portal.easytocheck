import React from "react";
import { Calendar, DollarSign, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedTaskLoading from "../../ui/EnhancedTaskLoading";

const AssociatedContactWithAccount = ({ contacts , loading = false }) => {

  console.log("contacts", contacts);
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

  const handleContactClick = (contactId) => {
    navigate('/app/contactprofile', { state: { contactId } });
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
        <EnhancedTaskLoading name="Contacts" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-800">
            Associated Contacts ({contacts?.length || 0})
          </h2>
        </div>

        {!contacts || contacts.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            No associated contact found for this contact.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-gray-50 cursor-pointer" 
                    
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium  text-gray-900 hover:text-blue-900 hover:underline" onClick={() => handleContactClick(contact.id)}>
                            {renderValue(contact.Full_Name)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {renderValue(contact.Account_Name || contact.Account_Name?.name)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {contact.Mobile || contact.Phone}
                      </div>
                    </td>
                    {/* <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {renderValue(contact.Email || "—")}
                      </span>
                    </td> */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        {contact.Email ? (
                          <a href={`mailto:${contact.Email}`} className="text-blue-600 hover:underline">
                            {contact.Email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </div>
                    </td>
                
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(contact.Created_Time)}
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

export default AssociatedContactWithAccount;