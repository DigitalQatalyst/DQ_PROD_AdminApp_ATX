import { useState, useMemo } from "react";
import { XIcon, SearchIcon } from "lucide-react";
import type { CustomerUser } from "../services/api/types";

export function CustomerPickerModal({
  isOpen,
  customers,
  isCreatingConversation,
  onClose,
  onStartConversation,
}: {
  isOpen: boolean;
  customers: CustomerUser[];
  isCreatingConversation: boolean;
  onClose: () => void;
  onStartConversation: (customer: CustomerUser | null) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter customers based on search query
  const filteredCustomers = useMemo(() => {
    console.log('[CustomerPicker] Search query:', searchQuery);
    console.log('[CustomerPicker] Total customers:', customers.length);
    
    if (!searchQuery.trim()) {
      console.log('[CustomerPicker] No search query, returning all customers');
      return customers;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = customers.filter(
      (customer) =>
        customer.username?.toLowerCase().includes(query) ||
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query)
    );
    
    console.log('[CustomerPicker] Filtered customers:', filtered.length);
    return filtered;
  }, [customers, searchQuery]);

  // Reset search when modal closes
  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const handleSelectCustomer = (customer: CustomerUser) => {
    setSearchQuery("");
    onStartConversation(customer);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Choose a customer
          </h3>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Search Box */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <SearchIcon 
              size={18} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3" key={`list-${searchQuery}-${filteredCustomers.length}`}>
          {customers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No customers available.
            </p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No customers match "{searchQuery}"
            </p>
          ) : (
            <>
              <p className="text-xs text-gray-400 mb-2">
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
              </p>
              {console.log('[CustomerPicker] Rendering customers:', filteredCustomers.slice(0, 5).map(c => c.name || c.username))}
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.accountId || customer.id || customer.email}
                  onClick={() => handleSelectCustomer(customer)}
                  disabled={isCreatingConversation}
                  className={`w-full text-left border border-gray-200 rounded-md p-3 hover:bg-blue-50 transition-colors ${
                    isCreatingConversation ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-medium">
                      {customer.username?.[0]?.toUpperCase() ||
                        customer.email?.[0]?.toUpperCase() ||
                        "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {customer.username || "Customer"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {customer.email || "No email"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => handleSelectCustomer(filteredCustomers[0])}
            disabled={filteredCustomers.length === 0 || isCreatingConversation}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              filteredCustomers.length === 0 || isCreatingConversation
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isCreatingConversation
              ? "Starting..."
              : filteredCustomers.length === 0
                ? "No customers available"
                : `Start chat with ${filteredCustomers[0]?.username || 'first customer'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
