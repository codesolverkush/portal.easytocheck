// Add these imports at the top if they're not already present
import { Settings, Check, X, Search, ChevronDown, ChevronUp, MoveUp, MoveDown } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

// Add this to your state declarations in the LeadView component
const [showColumnModal, setShowColumnModal] = useState(false);
const [selectedColumns, setSelectedColumns] = useState({
  "Full_Name": true,
  "Company": true,
  "Lead_Status": true,
  "Email": true, 
  "Mobile": true,
  "Phone": true,
  "Created_Time": true
});

// Add this for column reordering
const defaultColumnOrder = ["Full_Name", "Company", "Lead_Status", "Email", "Mobile", "Phone", "Created_Time"];
const [columnOrder, setColumnOrder] = useState(defaultColumnOrder);

// Add this for saving column arrangements as views
const [savedViews, setSavedViews] = useState([
  { name: "Default View", columns: { "Full_Name": true, "Company": true, "Lead_Status": true, "Email": true, "Mobile": true, "Phone": true, "Created_Time": true }, order: defaultColumnOrder },
  { name: "Contact Info", columns: { "Full_Name": true, "Email": true, "Phone": true, "Mobile": true, "Company": false, "Lead_Status": false, "Created_Time": false }, order: ["Full_Name", "Email", "Phone", "Mobile"] }
]);
const [currentViewName, setCurrentViewName] = useState("Default View");
const [showViewsDropdown, setShowViewsDropdown] = useState(false);
const [newViewName, setNewViewName] = useState("");
const [showSaveViewDialog, setShowSaveViewDialog] = useState(false);

// Add this function to handle column toggling 
const toggleColumn = (columnName) => {
  setSelectedColumns(prev => ({
    ...prev,
    [columnName]: !prev[columnName]
  }));
};

// Add this function to save column settings
const saveColumnSettings = () => {
  // Save to localStorage to persist user preferences
  localStorage.setItem('crm-lead-columns', JSON.stringify(selectedColumns));
  localStorage.setItem('crm-lead-column-order', JSON.stringify(columnOrder));
  localStorage.setItem('crm-lead-saved-views', JSON.stringify(savedViews));
  localStorage.setItem('crm-lead-current-view', currentViewName);
  setShowColumnModal(false);
};

// Function to save current arrangement as a view
const saveCurrentViewAs = (viewName) => {
  if (!viewName.trim()) return;
  
  const newView = {
    name: viewName.trim(),
    columns: {...selectedColumns},
    order: [...columnOrder]
  };
  
  // Check if a view with this name already exists
  const existingViewIndex = savedViews.findIndex(view => view.name === viewName);
  
  if (existingViewIndex >= 0) {
    // Update existing view
    const updatedViews = [...savedViews];
    updatedViews[existingViewIndex] = newView;
    setSavedViews(updatedViews);
  } else {
    // Create new view
    setSavedViews([...savedViews, newView]);
  }
  
  setCurrentViewName(viewName);
  setNewViewName("");
  setShowSaveViewDialog(false);
};

// Function to apply a saved view
const applyView = (viewName) => {
  const view = savedViews.find(v => v.name === viewName);
  if (view) {
    setSelectedColumns({...view.columns});
    setColumnOrder([...view.order]);
    setCurrentViewName(viewName);
  }
  setShowViewsDropdown(false);
};

// Function to delete a saved view
const deleteView = (viewName, e) => {
  e.stopPropagation();
  if (savedViews.length <= 1) {
    toast.error("Cannot delete the last view");
    return;
  }
  
  const updatedViews = savedViews.filter(view => view.name !== viewName);
  setSavedViews(updatedViews);
  
  // If the current view is deleted, switch to the first available view
  if (currentViewName === viewName) {
    setCurrentViewName(updatedViews[0].name);
    setSelectedColumns({...updatedViews[0].columns});
    setColumnOrder([...updatedViews[0].order]);
  }
};

// Functions to handle manual column reordering
const moveColumnUp = (index) => {
  if (index <= 0) return;
  
  const newOrder = [...columnOrder];
  const temp = newOrder[index];
  newOrder[index] = newOrder[index - 1];
  newOrder[index - 1] = temp;
  
  setColumnOrder(newOrder);
};

const moveColumnDown = (index) => {
  if (index >= columnOrder.length - 1) return;
  
  const newOrder = [...columnOrder];
  const temp = newOrder[index];
  newOrder[index] = newOrder[index + 1];
  newOrder[index + 1] = temp;
  
  setColumnOrder(newOrder);
};

// Add this useEffect to load saved column preferences on component mount
useEffect(() => {
  const savedColumns = localStorage.getItem('crm-lead-columns');
  const savedColumnOrder = localStorage.getItem('crm-lead-column-order');
  const savedViewsData = localStorage.getItem('crm-lead-saved-views');
  const savedCurrentView = localStorage.getItem('crm-lead-current-view');
  
  if (savedColumns) {
    setSelectedColumns(JSON.parse(savedColumns));
  }
  
  if (savedColumnOrder) {
    setColumnOrder(JSON.parse(savedColumnOrder));
  }
  
  if (savedViewsData) {
    setSavedViews(JSON.parse(savedViewsData));
  }
  
  if (savedCurrentView) {
    setCurrentViewName(savedCurrentView);
  }
}, []);

// Add this Column Management Modal component
const ColumnManagementModal = () => {
  if (!showColumnModal) return null;

  // For searching/filtering columns
  const [searchQuery, setSearchQuery] = useState("");
  
  // Column options for display
  const columnOptions = [
    { key: "Deal_Name", label: "Deal Name" },
    { key: "Contact_Name", label: "Contact Name" },
    { key: "Account_Name", label: "Account Name" },
    { key: "Stage", label: "Stage" },
    { key: "Pipeline", label: "Pipeline" },
    { key: "Created_Time", label: "Created Time" }
  ];

  // State for templates dropdown
  const [showTemplates, setShowTemplates] = useState(false);

  // Templates for quick column selection
  const columnTemplates = {
    "Basic Info": {
      "Deal_Name": true,
      "Contact_Name": true,
      "Account_Name": true,
      "Stage": false,
      "Pipeline": false,
      "Created_Time": true
    },
    "Contact Details": {
      "Deal_Name": true,
      "Contact_Name": false,
      "Account_Name": false,
      "Stage": true,
      "Pipeline": true,
      "Created_Time": false
    },
    "All Columns": {
      "Deal_Name": true,
      "Contact_Name": true,
      "Account_Name": true,
      "Stage": true,
      "Pipeline": true,
      "Created_Time": true
    }
  };

  // Apply a template
  const applyTemplate = (templateName) => {
    setSelectedColumns({...columnTemplates[templateName]});
    setShowTemplates(false);
  };

  // Select/deselect all columns
  const selectAllColumns = (selected) => {
    const newState = {};
    columnOptions.forEach(col => {
      newState[col.key] = selected;
    });
    setSelectedColumns(newState);
  };

  // Reset to default columns
  const resetToDefault = () => {
    setSelectedColumns({
      "Deal_Name": true,
      "Contact_Name": true,
      "Account_Name": true,
      "Stage": true, 
      "Pipeline": true,
      "Created_Time": true
    });
    setColumnOrder([...defaultColumnOrder]);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Manage Columns</h2>
          <button onClick={() => setShowColumnModal(false)} className="text-gray-500">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {/* Search and actions bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
          
          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                Templates
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
              </button>
              
              {showTemplates && (
                <div className="absolute left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-20">
                  {Object.keys(columnTemplates).map((templateName) => (
                    <button
                      key={templateName}
                      onClick={() => applyTemplate(templateName)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      {templateName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => selectAllColumns(true)}
              className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
            >
              Select All
            </button>
            
            <button 
              onClick={() => selectAllColumns(false)}
              className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
            >
              Deselect All
            </button>
            
            <button 
              onClick={resetToDefault}
              className="text-sm bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Select the columns you want to display in the table.</p>
          
          {/* Column list with manual reordering */}
          <p className="text-sm text-gray-500 mb-2">Reorder columns using the up/down arrows:</p>
          <div className="space-y-1 max-h-[40vh] overflow-y-auto border rounded-lg p-1">
            {columnOrder
              .filter(key => {
                const column = columnOptions.find(col => col.key === key);
                return column && column.label.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((key, index) => {
                const column = columnOptions.find(col => col.key === key);
                if (!column) return null;
                
                return (
                  <div
                    key={key}
                    className="flex items-center p-2 bg-white hover:bg-gray-50 rounded border mb-1"
                  >
                    <div className="flex space-x-1 mr-2">
                      <button 
                        onClick={() => moveColumnUp(index)}
                        disabled={index === 0}
                        className={`text-gray-400 hover:text-blue-500 ${index === 0 ? 'opacity-30' : ''}`}
                      >
                        <MoveUp size={16} />
                      </button>
                      <button 
                        onClick={() => moveColumnDown(index)}
                        disabled={index === columnOrder.length - 1}
                        className={`text-gray-400 hover:text-blue-500 ${index === columnOrder.length - 1 ? 'opacity-30' : ''}`}
                      >
                        <MoveDown size={16} />
                      </button>
                    </div>
                    <input
                      type="checkbox"
                      id={`column-${key}`}
                      checked={selectedColumns[key]}
                      onChange={() => toggleColumn(key)}
                      className="mr-3 h-5 w-5 text-blue-500"
                    />
                    <label htmlFor={`column-${key}`} className="flex-grow cursor-pointer">
                      {column.label}
                    </label>
                  </div>
                );
              })}
              
            {columnOrder.filter(key => {
              const column = columnOptions.find(col => col.key === key);
              return column && column.label.toLowerCase().includes(searchQuery.toLowerCase());
            }).length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No columns match your search.
              </div>
            )}
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

// Add the views dropdown and column management button
// Add this in the flex container with your "Sync Now" and "Create Lead" buttons:
const ViewControls = () => (
  <div className="flex-1 sm:flex-none flex gap-2">
    <div className="relative">
      <button 
        onClick={() => setShowViewsDropdown(!showViewsDropdown)}
        className="flex items-center bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
      >
        <span className="truncate max-w-[120px]">{currentViewName}</span>
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showViewsDropdown ? 'rotate-180' : ''}`} />
      </button>
      
      {showViewsDropdown && (
        <div className="absolute left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-20">
          <div className="p-2 border-b">
            <span className="text-xs font-medium text-gray-500">SAVED VIEWS</span>
          </div>
          {savedViews.map((view) => (
            <div 
              key={view.name}
              onClick={() => applyView(view.name)}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <span className="text-sm">{view.name}</span>
              {savedViews.length > 1 && (
                <button 
                  onClick={(e) => deleteView(view.name, e)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <div className="p-2 border-t">
            <button 
              onClick={() => setShowSaveViewDialog(true)}
              className="text-sm text-blue-500 hover:text-blue-600 w-full text-left"
            >
              + Save current view
            </button>
          </div>
        </div>
      )}
    </div>

    <button 
      onClick={() => setShowColumnModal(true)} 
      className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-sm"
    >
      <Settings size={16} className="mr-1" />
      <span className="hidden sm:inline">Manage Columns</span>
      <span className="sm:hidden">Columns</span>
    </button>
  </div>
);

{/* Save View Dialog */}
const SaveViewDialog = () => {
  if (!showSaveViewDialog) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Save View</h3>
          <button onClick={() => setShowSaveViewDialog(false)} className="text-gray-500">
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            View Name
          </label>
          <input
            type="text"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
            placeholder="Enter view name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setShowSaveViewDialog(false)}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => saveCurrentViewAs(newViewName)}
              disabled={!newViewName.trim()}
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg ${!newViewName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modify your table header row to use selectedColumns and honor the column order
// Replace your existing table header with this:
const TableHeader = () => (
  <thead>
    <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {columnOrder.map(columnKey => {
        if (!selectedColumns[columnKey]) return null;
        
        switch (columnKey) {
          case "Deal_Name":
            return (
              <th key={columnKey} className="p-4 cursor-pointer" onClick={() => handleSort("Last_Name")}>
                Deal Name
                {sortField === "Deal_Name" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            );
          case "Contact_Name":
            return (
              <th key={columnKey} className="p-4 cursor-pointer" onClick={() => handleSort("Company")}>
                Contact Name
                {sortField === "Contact_Name" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            );
          case "Account_Name":
            return <th key={columnKey} className="p-4">Account Name</th>;
          case "Stage":
            return <th key={columnKey} className="p-4">Stage</th>;
          case "Pipeline":
            return <th key={columnKey} className="p-4">Pipeline</th>;
          case "Created_Time":
            return (
              <th key={columnKey} className="p-4 cursor-pointer" onClick={() => handleSort("Created_Time")}>
                Created
                {sortField === "Created_Time" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            );
          default:
            return <th key={columnKey} className="p-4">{columnKey}</th>;
        }
      })}
    </tr>
  </thead>
);

// Now modify your table row rendering to respect the selected columns
// Inside your table body, replace the mapping of leads with this:
const TableRows = () => (
  <>
    {currentDeals.length > 0 ? (
      currentDeals.map((deal, index) => (
        <tr
          key={index}
          className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => getEachRecordHandler(deal.id)}
        >                   
          {selectedColumns["Deal_Name"] && <td className="p-4 text-sm font-medium text-gray-700">{deal.Deal_Name || "-"}</td>}
          {selectedColumns["Contact_Name"] && <td className="p-4 text-sm">{lead.Contact_Name.name || "-"}</td>}
          {selectedColumns["Account_Name"] && (
            <td className="p-4 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.Lead_Status] || "bg-gray-200 text-gray-700"}`}>
                {deal.Account_Name.name || "-"}
              </span>
            </td>
          )}
          {selectedColumns["Stage"] && <td className="p-4 text-sm">{lead.Stage || "-"}</td>}
          {selectedColumns["Pipeline"] && <td className="p-4 text-sm">{lead.Pipeline || "-"}</td>}                   
          {selectedColumns["Created_Time"] && <td className="p-4 text-sm">{moment(lead.Created_Time).format("DD-MM-YY HH:mm") || "-"}</td>}
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan={Object.values(selectedColumns).filter(Boolean).length} className="p-4 text-center text-gray-500">
          No leads available. {searchTerm && 'Try a different search term.'}
        </td>
      </tr>
    )}
  </>
);

// Finally, make sure to render these components in your main component's return statement
// Use this structure in your LeadView component:
return (
  <div className="...">
    {/* Your existing header */}
    <div className="...">
      {/* Existing code */}
      <ViewControls />
      {/* Existing code */}
    </div>
    
    {/* Table */}
    <div className="...">
      <table className="...">
        <TableHeader />
        <tbody>
          <TableRows />
        </tbody>
      </table>
    </div>
    
    {/* Modals */}
    <ColumnManagementModal />
    <SaveViewDialog />
    {/* Your other modals */}
  </div>
);