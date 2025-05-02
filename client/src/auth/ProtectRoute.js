import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userExists, userNotExists } from "../redux/reducers/auth"; // Adjust path as needed
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import LicenseCheck from "../wrapper/LicenseCheck";

// Secret key should match the one used in authSlice
const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error("Error decrypting data:", error);
    return null;
  }
};

const ProtectRoute = ({ children }) => {
  const { user, loader } = useSelector((state) => state.auth);

  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const userFromCookie = Cookies.get("user");

    if (userFromCookie) {
      const decryptedUser = decryptData(userFromCookie);

      if (decryptedUser) {
        dispatch(userExists(decryptedUser));
      } else {
        dispatch(userNotExists());
      }
    } else {
      dispatch(userNotExists());
    }
  }, [dispatch]);

  if (loader) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/app/signup" state={{ from: location.pathname }} replace />;
  }

  return <LicenseCheck>{children}</LicenseCheck>;
  // return children;
};

export default ProtectRoute;


