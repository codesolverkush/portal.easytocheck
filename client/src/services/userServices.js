// src/services/userService.js

import axios from 'axios';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

const API_BASE_URL = process.env.REACT_APP_APP_API;
const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;

// Helper function to decrypt data
const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Get user role from cookies (fast path)
export const getUserRoleFromCookies = () => {
  try {
    const encryptedUser = Cookies.get("user");
    if (!encryptedUser) return null;
    
    const user = decryptData(encryptedUser);
    return user?.role || null;
  } catch (error) {
    console.error("Error getting role from cookies:", error);
    return null;
  }
};

// Check user role using API (reliable but slower)
export const checkUserRole = async () => {
  try {
    // Try to get role from cookies first for faster response
    const cookieRole = getUserRoleFromCookies();
    if (cookieRole) {
      return cookieRole;
    }
    
    // Fallback to API call if cookie data is not available
    const response = await axios.get(
      `${API_BASE_URL}/users/check-role`,
      { withCredentials: true }
    );
    
    return response.data.role;
  } catch (error) {
    console.error("Error checking user role:", error);
    return null;
  }
};

// Check if user is superadmin
export const isSuperAdmin = async () => {
  try {
    const role = await checkUserRole();
    return role === "superadmin";
  } catch (error) {
    console.error("Error checking if user is superadmin:", error);
    return false;
  }
};

export default {
  getUserRoleFromCookies,
  checkUserRole,
  isSuperAdmin
};