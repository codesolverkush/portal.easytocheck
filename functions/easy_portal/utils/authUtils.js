// authUtils.js

const refreshAccessToken = require("./genaccestoken");
const { handleZohoRequest } = require("./zohoUtils");

/**
 * Validates the user and retrieves organization ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<Object>} - Object containing validation result and organization ID
 */
const validateUserAndGetOrgId = async (req, res) => {
    try {
      const userId = req.currentUser?.user_id;
      
      // Check if user ID exists
      if (!userId) {
        return { 
          valid: false, 
          status: 404, 
          message: "User ID not found.",
          orgId: null 
        };
      }
      
      // Get module access from request
      const moduleType = req.moduleName; // This should be set by the calling function
      const moduleAccess = req.userDetails[0]?.usermanagement[moduleType];
      
      // Check if user has permission
      if (moduleAccess < 2) {
        return { 
          valid: false, 
          status: 401, 
          message: "Unauthorized User!",
          orgId: null 
        };
      }
      
      // Retrieve organization ID
      const { catalyst } = res.locals;
      const zcql = catalyst.zcql();
      const userQuery = `SELECT orgid FROM usermanagement WHERE userid = '${userId}' LIMIT 1`;
      const user = await zcql.executeZCQLQuery(userQuery);
      const orgId = user[0]?.usermanagement?.orgid;
      
      // Check if organization ID exists
      if (!orgId) {
        return { 
          valid: false, 
          status: 404, 
          message: "Organization ID not found.",
          orgId: null 
        };
      }
      
      // Return success with organization ID
      return {
        valid: true,
        orgId
      };
    } catch (error) {
      console.error("Error in validateUserAndGetOrgId:", error.message);
      return {
        valid: false,
        status: 500,
        message: error.message,
        orgId: null
      };
    }
  };
  
  /**
   * Handles response for failed validation
   * @param {Object} res - Express response object
   * @param {Object} validationResult - Result from validateUserAndGetOrgId
   * @returns {Boolean} - True if response was sent (validation failed), false otherwise
   */
  const handleValidationResponse = (res, validationResult) => {
    if (!validationResult.valid) {
      res.status(validationResult.status).json({
        success: false,
        message: validationResult.message
      });
      return true;
    }
    return false;
  };
  
  /**
   * Handle API request to Zoho with token refresh capability
   * @param {string} url - API endpoint
   * @param {string} method - HTTP method (get, post, put, delete)
   * @param {Object} data - Request payload
   * @param {string} token - Access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - API response data
   */
  const executeZohoRequest = async (url, method, data, token, req, res) => {
    try {
      const result = await handleZohoRequest(url, method, data, token);
        return { 
        success: true, 
        data: result 
      };
    } catch (error) {
      if (error.message === "TOKEN_EXPIRED") {
        try {
          const newToken = await refreshAccessToken(req, res);
          process.env.ACCESS_TOKEN = newToken;
          const result = await handleZohoRequest(url, method, data, newToken);
          return {
            success: true,
            data: result
          };
        } catch (refreshError) {
          console.error("Error after token refresh:", refreshError.message);
          throw {
            success: false,
            status: 500,
            error: refreshError.response ? refreshError.response.data : refreshError.message
          };
        }
      }
      
      console.error(`Error in Zoho request:`, error);
      throw {
        success: false,
        status: 500,
        error: error.response ? error.response.data : error.message
      };
    }
  };
  
  module.exports = {
    validateUserAndGetOrgId,
    handleValidationResponse,
    executeZohoRequest
  };