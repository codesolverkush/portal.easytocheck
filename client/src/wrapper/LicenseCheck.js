import React, { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';

import Loader from '../component/common/Loader';
import { clearOrgCookies, setLicenseStatus } from '../redux/reducers/auth';

const REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

const LicenseCheck = ({ children }) => {
  const { licenseActive, orgId } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(licenseActive === null);
  const [organizationExists, setOrganizationExists] = useState(true);
  const [checkComplete, setCheckComplete] = useState(false);

  // Use useCallback to memoize the function so it doesn't get recreated on every render
  const fetchLicenseStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/getdetails`);
      console.log('License check response:', response);
      
      if (response.data?.data?.length > 0) {
        const organization = response.data.data[0].Organization;
        const active = organization?.isactive === "true" || organization?.isactive === true;
        dispatch(setLicenseStatus(active));
        setOrganizationExists(true);
      } else {
        // Organization not found
        console.log('Organization not found, clearing cookies');
        dispatch(setLicenseStatus(false));
        dispatch(clearOrgCookies());
        setOrganizationExists(false);
      }
    } catch (error) {
      console.error('Error fetching license details:', error);
      
      // Check if the error is specifically about organization not found (404)
      if (error.response && error.response.status === 404) {
        console.log('404 error - Organization not found, clearing cookies');
        setOrganizationExists(false);
        // dispatch(setLicenseStatus(false));
        dispatch(clearOrgCookies());
      }
    } finally {
      setLoading(false);
      setCheckComplete(true);
    }
  }, [dispatch]);


  useEffect(() => {
    // Initial fetch if license status is n t already in Redux store
    // or if we're coming from the organization registration page
    if (licenseActive === null) {
      fetchLicenseStatus();
    } else {
      setCheckComplete(true);
    }
    
    // Set up periodic refresh every 60 minutes
    const intervalId = setInterval(() => {
      fetchLicenseStatus();
    }, REFRESH_INTERVAL);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [licenseActive, fetchLicenseStatus, location.pathname]);

  // Don't render anything until we've completed the check
  if (!checkComplete || loading) {
    return <Loader />; // Show loader while fetching data
  }

  // Special case: if we're already on the registration page, don't redirect again
  if (location.pathname === '/app/orgregister') {
    return children;
  }

  // Check if organization doesn't exist and redirect to registration
  if (!organizationExists && location.pathname !== '/app/orgregister') {
    return <Navigate to="/app/orgregister" replace />;
  }

  // Original license checks
  if (location.pathname === '/app/license' && licenseActive === true) {
    return <Navigate to="/app/home" replace />;
  }

  if (licenseActive === false && organizationExists && location.pathname !== '/app/license') {
    return <Navigate to="/app/license" replace />;
  }

  return children;
};

export default LicenseCheck;


// import React, { useEffect, useState, useCallback, useRef } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import axios from 'axios';

// import Loader from '../component/common/Loader';
// import { clearOrgCookies, setLicenseStatus } from '../redux/reducers/auth';

// const REFRESH_INTERVAL = 60 * 60 * 1000; // 60 minutes in milliseconds

// const LicenseCheck = ({ children }) => {
//   const { licenseActive } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const location = useLocation();
  
//   const [loading, setLoading] = useState(licenseActive === null);
//   const [organizationExists, setOrganizationExists] = useState(true);
//   const [checkComplete, setCheckComplete] = useState(false);

//   const isFetchingRef = useRef(false); // Prevent duplicate API calls

//   const fetchLicenseStatus = useCallback(async () => {
//     if (isFetchingRef.current) return; // Prevent duplicate requests
//     isFetchingRef.current = true;

//     try {
//       setLoading(true);
//       const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/getdetails`);
//       console.log('License check response:', response);
      
//       if (response.data?.data?.length > 0) {
//         const organization = response.data.data[0].Organization;
//         const active = organization?.isactive === "true" || organization?.isactive === true;
//         dispatch(setLicenseStatus(active));
//         setOrganizationExists(true);
//       } else {
//         console.log('Organization not found, clearing cookies');
//         dispatch(setLicenseStatus(false));
//         dispatch(clearOrgCookies());
//         setOrganizationExists(false);
//       }
//     } catch (error) {
//       console.error('Error fetching license details:', error);
//       if (error.response?.status === 404) {
//         console.log('404 error - Organization not found, clearing cookies');
//         setOrganizationExists(false);
//         dispatch(clearOrgCookies());
//       }
//     } finally {
//       setLoading(false);
//       setCheckComplete(true);
//       isFetchingRef.current = false; // Reset flag after request completes
//     }
//   }, [dispatch]);

//   useEffect(() => {
//     if (licenseActive === null) {
//       fetchLicenseStatus();
//     } else {
//       setCheckComplete(true);
//     }

//     const intervalId = setInterval(fetchLicenseStatus, REFRESH_INTERVAL);
//     return () => clearInterval(intervalId);
//   }, [licenseActive]); // Removed unnecessary dependencies

//   if (!checkComplete || loading) {
//     return <Loader />;
//   }

//   if (location.pathname === '/app/orgregister') {
//     return children;
//   }

//   if (!organizationExists && location.pathname !== '/app/orgregister') {
//     return <Navigate to="/app/orgregister" replace />;
//   }

//   if (location.pathname === '/app/license' && licenseActive === true) {
//     return <Navigate to="/app/home" replace />;
//   }

//   if (licenseActive === false && organizationExists && location.pathname !== '/app/license') {
//     return <Navigate to="/app/license" replace />;
//   }

//   return children;
// };

// export default LicenseCheck;
