// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//     user: null, 
//     isAdmin: false,
//     loader: true,
// };

// const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers:{
//         userExists:(state,action)=>{
//             state.user = action.payload;
//             state.loader = false;
//         },

//         userNotExists: (state)=>{
//             state.user = null;
//             state.loader = false;
//         },
//     }
// })


// export default authSlice;
// export const {userExists,userNotExists} = authSlice.actions;



// import { createSlice } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";

// const initialState = {
//     user: Cookies.get("user") ? JSON.parse(Cookies.get("user")) : null,
//     isAdmin: false,
//     loader: true,
// };

// const authSlice = createSlice({
//     name: "auth",
//     initialState,
//     reducers: {
//         userExists: (state, action) => {
//             state.user = action.payload;
//             state.loader = false;
//             Cookies.set("user", JSON.stringify(action.payload), { expires: 7, secure: true });
//         },

//         userNotExists: (state) => {
//             state.user = null;
//             state.loader = false;
//             Cookies.remove("user");
//         },
//     },
// });

// export default authSlice;
// export const { userExists, userNotExists } = authSlice.actions;




// import { createSlice } from "@reduxjs/toolkit";
// import Cookies from "js-cookie";
// import CryptoJS from "crypto-js";

// // Secret key for encryption and decryption.
// // In a real-world application, store this securely and avoid exposing it in client-side code.
// const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;

// const encryptData = (data) => {
//   const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
//   return ciphertext;
// }; 

// const decryptData = (ciphertext) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
//     const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//     return decryptedData;
//   } catch (error) {
//     toast.error("Error decrypting data!");
//     return null;
//   }
// };

// // Try to decrypt the cookie if it exists
// const userCookie = Cookies.get("user");
// const initialUser = userCookie ? decryptData(userCookie) : null;

// const initialState = {
//   user: initialUser,
//   isAdmin: false,
//   loader: true,
//   licenseActive: null,  // Move it here
//   orgId: null,         
// };


// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   licenseActive: true, // Add this new state
//   orgId: null,         // Store the orgId here
//   reducers: {
//     userExists: (state, action) => {
//       state.user = action.payload;
//       state.loader = false;
//       // Encrypt the user data before setting the cookie
//       Cookies.set("user", encryptData(action.payload), { expires: 7, secure: true });
//     },
//     userNotExists: (state) => {
//       state.user = null;
//       state.loader = false;
//       Cookies.remove("user");
//       Cookies.remove("orgRowId");
//     },
//     setCookies: (state,action)=>{
//       state.loader = false;
//       Cookies.set("orgRowId", encryptData(action.payload), {expires: 7, secure: true})
//     },
//     setLicenseStatus: (state, action) => {
//       state.licenseActive = action.payload;
//     },
//     setOrgId: (state, action) => {
//       state.orgId = action.payload;
//     },
//     clearOrgCookies:(state)=>{
//       state.loader = false;
//       Cookies.remove("orgRowId");
//     }
//   },
// });

// export default authSlice;
// export const { userExists, userNotExists, setCookies, setLicenseStatus,setOrgId,clearOrgCookies } = authSlice.actions;




import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import toast from "react-hot-toast";

// Secret key for encryption and decryption.
// In a real-world application, store this securely and avoid exposing it in client-side code.
const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;

const encryptData = (data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  return ciphertext;
}; 

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    toast.error("Error decrypting data!");
    return null;
  }
};

// Try to decrypt the cookie if it exists
const userCookie = Cookies.get("user");
const initialUser = userCookie ? decryptData(userCookie) : null;

// Try to decrypt the org cookie if it exists
const orgCookie = Cookies.get("orgRowId");
const initialOrgId = orgCookie ? decryptData(orgCookie) : null;

const initialState = {
  user: initialUser,
  isAdmin: false,
  loader: true,
  isSuperAdmin:false,
  licenseActive: null,
  orgId: initialOrgId,  // Initialize from cookie if exists
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userExists: (state, action) => {
      state.user = action.payload;
      state.loader = false;
      // Encrypt the user data before setting the cookie
      Cookies.set("user", encryptData(action.payload), { expires: 7, secure: true });
    },
    userNotExists: (state) => {
      state.user = null;
      state.loader = false;
      state.isSuperAdmin = false;
      Cookies.remove("user");
      Cookies.remove("orgRowId");
    },
    setCookies: (state, action) => {
      state.loader = false;
      state.orgId = action.payload; // Also update the state
      Cookies.set("orgRowId", encryptData(action.payload), {expires: 7, secure: true});
    },
    setLicenseStatus: (state, action) => {
      state.licenseActive = action.payload;
    },
    setOrgId: (state, action) => {
      state.orgId = action.payload;
    },
    clearOrgCookies: (state) => {
      state.loader = false;
      state.orgId = null; // Clear the state value too
      Cookies.remove("orgRowId");
    },
    setSuperAdminStatus: (state) =>{
      state.isSuperAdmin = true;
      state.loader = false;
    }
  },
});

export default authSlice;
export const { userExists, userNotExists, setCookies, setLicenseStatus, setOrgId, clearOrgCookies,setSuperAdminStatus } = authSlice.actions;