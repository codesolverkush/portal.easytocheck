import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * AdminRouteProtection component that strictly restricts super admin users to only allowed routes
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is allowed
 * @returns {React.ReactNode} - Children components or redirects if access not allowed
 */
const AdminRouteProtection = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSuperAdmin } = useSelector((state) => state.auth);
  console.log(isSuperAdmin);
  
  // Strictly define allowed routes for super admin
  const ADMIN_ALLOWED_ROUTES = [
    '/app/orgProfile',
    '/app/webtab',
  ];

  useEffect(() => {
    // Only apply restrictions if the user is logged in and is a super admin
    if (user && isSuperAdmin) {
      const currentPath = location.pathname;
      
      // Check if current path is allowed for super admin
      const isAllowedRoute = ADMIN_ALLOWED_ROUTES.some(route => 
        currentPath === route || currentPath.startsWith(`${route}/`)
      );
      
      // If not allowed, redirect to the first allowed route
      if (!isAllowedRoute) {
        console.log('Super admin attempted to access restricted route:', currentPath);
        navigate(ADMIN_ALLOWED_ROUTES[0], { replace: true });
      }
    }
  }, [user, isSuperAdmin, location.pathname, navigate]);

  return children;
};

export default AdminRouteProtection;