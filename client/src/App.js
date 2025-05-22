import React, { Suspense, lazy } from 'react';
import './App.css';
import { Route, Routes, Navigate } from 'react-router-dom';

import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import ProtectRoute from './auth/ProtectRoute.js';
import LicenseCheck from './wrapper/LicenseCheck.js';
import TestPage from './component/testPages/TestPage.js';
import MeetingView from './component/view/MeetingView/MeetingView.js';
import MeetingProfile from './component/view/MeetingView/MeetingProfile.js';
import AuthorizedPage from './component/errorPages/AuthorizedPage.js';
import Webtab2 from './component/testPages/Webtab2.js';
import DragDropComponent from './component/testPages/DragDropComponent.js';
import AccountProfile from './component/view/AccountView/AccountProfile.js';
import AdminPage from './component/testPages/AdminPage.js';
import CrmProfile from './component/testPages/CrmProfile.js';
import MakeConnection2 from './component/ConnectionPages/MakeConnection2.js';
import Loader from './component/common/Loader.js';
import AdminRouteProtection from './wrapper/AdminRouteProtection.js';

// Lazy loaded components (same as before)
const Home = lazy(() => import('./pages/Home.js'));
const UserLogin = lazy(() => import('./pages/UserLogin.js'));
const Organization = lazy(() => import('./pages/Organization.js'));
const OrganizationProfile = lazy(() => import('./component/pages/OrganizationProfile'));
const LicenseExpiredPage = lazy(() => import('./component/pages/LicensePage'));
const Connections = lazy(() => import('./component/pages/Connections'));
const UserCreate = lazy(() => import('./component/pages/UserCreate'));
const CreateLeadForm = lazy(() => import('./component/forms/CreateLeadForm.js'));
const CreateContactForm = lazy(()=> import('./component/forms/CreateContactForm.js'));
const MakeConnection = lazy(() => import('./component/pages/MakeConnection.js'));
const LandingPage = lazy(() => import('./pages/LandingPage.js'));
const AttachFilePage = lazy(() => import('./component/testPages/AttachFilePage.js'));
const LocationPage = lazy(() => import('./component/testPages/LocationPage.js'));
const CreateEvents = lazy(() => import('./component/testPages/CreateEvents.js'));
const LeadView = lazy(() => import('./component/testPages/LeadsView.js'));
const LeadProfile = lazy(() => import('./component/testPages/LeadProfile.js'));
const TaskView = lazy(() => import('./component/view/TaskView/TaskView.js'));
const TaskProfile = lazy(() => import('./component/view/TaskView/TaskProfile.js'));
const CreateTaskForm = lazy(() => import('./component/forms/CreateTaskForm.js'));
const ContactView = lazy(() => import('./component/view/ContactView/ContactView.js'));
const ContactProfile = lazy(() => import('./component/view/ContactView/ContactProfile.js'));
const CachePage = lazy(() => import('./component/testPages/CachePage.js'));
const NotFound = lazy(() => import('./pages/NotFound.js'));
const Webtab = lazy(() => import('./pages/Webtab.js'));
const CreateDealForm = lazy(() => import('./component/forms/CreateDealForm.js'));
const DealView = lazy(() => import('./component/view/DealView/DealView.js'));
const DealProfile = lazy(()=> import('./component/view/DealView/DealProfile.js'));
const AccountView = lazy(() => import('./component/view/AccountView/AccountView.js'));
const AboutUs = lazy(()=> import('./component/landingComponent/AboutUs.js'));

// Define license exempt routes - no license check needed
const licenseExemptRoutes = [
  "/app/license",
  "/app/orgregister",
  "/app/orgProfile"
];

// Component for protected routes with license check
const ProtectedRouteWithLicense = ({ children, exemptFromLicense = false }) => {
  return (
    <ProtectRoute>
      <AdminRouteProtection>
        {exemptFromLicense ? children : <LicenseCheck>{children}</LicenseCheck>}
      </AdminRouteProtection>
    </ProtectRoute>
  );
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Suspense fallback={<Loader/>}>
        <Toaster />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/app/login"
            element={user ? <Navigate to="/app/home" replace /> : <UserLogin />}
          />
          <Route
            path="/app/signup"
            element={user ? <Navigate to="/app/home" replace /> : <LandingPage />}
          />
          <Route
            path="/app/about-us"
            element={<AboutUs/>}
          />

          {/* Super Admin Allowed Routes - ensure these are accessible */}
          <Route
            path="/app/orgProfile"
            element={
              <ProtectedRouteWithLicense exemptFromLicense={true}>
                <OrganizationProfile />
              </ProtectedRouteWithLicense>
            }
          />
          
          <Route
            path="/app/webtab"
            element={
              <ProtectedRouteWithLicense>
                <Webtab />
              </ProtectedRouteWithLicense>
            }
          />
          
          <Route 
            path='/app/adminpanel'
            element={
                <AdminPage/>
            }
          />

          {/* License-exempt Protected Routes */}
          <Route
            path="/app/license"
            element={
              <ProtectedRouteWithLicense exemptFromLicense={true}>
                <LicenseExpiredPage />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/orgregister"
            element={
              <ProtectedRouteWithLicense exemptFromLicense={true}>
                <Organization />
              </ProtectedRouteWithLicense>
            }
          />

          {/* Standard Protected Routes */}
          <Route
            path="/app/home"
            element={
              <ProtectedRouteWithLicense>
                <Home />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/genToken"
            element={
              <ProtectedRouteWithLicense>
                <Connections />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/register"
            element={
              <ProtectedRouteWithLicense>
                <UserCreate />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path="/app/connection"
            element={
              <ProtectedRouteWithLicense>
                <MakeConnection />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/attach"
            element={
              <ProtectedRouteWithLicense>
                <AttachFilePage />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/location"
            element={
              <ProtectedRouteWithLicense>
                <LocationPage />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/checkin"
            element={
              <ProtectedRouteWithLicense>
                <CreateEvents />
              </ProtectedRouteWithLicense>
            }
          />

          {/* Lead route start */}
          <Route
            path="/app/first"
            element={
              <ProtectedRouteWithLicense>
                <CreateLeadForm />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path="/app/leadprofile"
            element={
              <ProtectedRouteWithLicense>
                <LeadProfile />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/leadview"
            element={
              <ProtectedRouteWithLicense>
                <LeadView />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Lead route end */}

          {/* Account route start */}
          <Route
            path="/app/accountview"
            element={
              <ProtectedRouteWithLicense>
                <AccountView />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/accountprofile"
            element={
              <ProtectedRouteWithLicense> 
                <AccountProfile />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Account route end */}

          {/* Deal route Start */}
          <Route
            path="/app/dealCreate"
            element={
              <ProtectedRouteWithLicense>
                <CreateDealForm />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path="/app/dealView"
            element={
              <ProtectedRouteWithLicense>
                <DealView />
              </ProtectedRouteWithLicense>
            }
          />

         <Route
            path="/app/dealProfile"
            element={
              <ProtectedRouteWithLicense>
                <DealProfile />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Deal route end */}

          {/* Task route start */}
          <Route
            path="/app/taskview"
            element={
              <ProtectedRouteWithLicense>
                <TaskView />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/taskProfile"
            element={
              <ProtectedRouteWithLicense>
                <TaskProfile />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path="/app/taskform"
            element={
              <ProtectedRouteWithLicense>
                <CreateTaskForm />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Task route end */}

          {/* Contact route start */}
          <Route 
            path='/app/contactform'
            element={
              <ProtectedRouteWithLicense>
                 <CreateContactForm/>
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path='/app/contactview'
            element={
              <ProtectedRouteWithLicense>
                <ContactView />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path="/app/contactProfile"
            element={
              <ProtectedRouteWithLicense>
                <ContactProfile />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Contact route end */}

          <Route
            path="/app/cache"
            element={
              <ProtectedRouteWithLicense>
                <CachePage />
              </ProtectedRouteWithLicense>
            }
          />

          {/* Meeting Route Start */}
          <Route
            path='/app/meetingView'
            element={
              <ProtectedRouteWithLicense>
                <MeetingView />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path='/app/meetingprofile'
            element={
              <ProtectedRouteWithLicense>
                <MeetingProfile />
              </ProtectedRouteWithLicense>
            }
          />
          {/* Meeting Route end */}

          <Route
            path='/app/crm'
            element={
              <ProtectedRouteWithLicense>
                <CrmProfile />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path="/app/notfound"
            element={
              <ProtectedRouteWithLicense>
                <NotFound />
              </ProtectedRouteWithLicense>
            }
          />
          <Route
            path='/app/kushal'
            element={
              <ProtectedRouteWithLicense>
                <TestPage />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path='/app/unauth'
            element={
              <ProtectedRouteWithLicense>
                <AuthorizedPage />
              </ProtectedRouteWithLicense>
            }
          />

          <Route
            path='/app/imfromzoho'
            element={
              <MakeConnection2/>
            }
          />

          <Route 
            path='/app/unauthorized'
            element={
              <AuthorizedPage/>
            }
          />
          <Route 
            path='/app/webtab2'
            element={
              <Webtab2/>
            }
          />

          <Route  
            path='/app/drag'
            element={
              <DragDropComponent/>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/app/login" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;


// import React, { Suspense, lazy } from 'react';
// import './App.css';
// import { Route, Routes, Navigate } from 'react-router-dom';

// import { Toaster } from 'react-hot-toast';
// import { useSelector } from 'react-redux';

// import ProtectRoute from './auth/ProtectRoute.js';
// import LicenseCheck from './wrapper/LicenseCheck.js';
// import TestPage from './component/testPages/TestPage.js';
// import MeetingView from './component/view/MeetingView/MeetingView.js';
// import MeetingProfile from './component/view/MeetingView/MeetingProfile.js';
// import AuthorizedPage from './component/errorPages/AuthorizedPage.js';
// import Webtab2 from './component/testPages/Webtab2.js';
// import DragDropComponent from './component/testPages/DragDropComponent.js';
// import AccountProfile from './component/view/AccountView/AccountProfile.js';
// import AdminPage from './component/testPages/AdminPage.js';
// import CrmProfile from './component/testPages/CrmProfile.js';
// import MakeConnection2 from './component/ConnectionPages/MakeConnection2.js';
// import Loader from './component/common/Loader.js';


// // Lazy loaded components (same as before)
// const Home = lazy(() => import('./pages/Home.js'));
// const UserLogin = lazy(() => import('./pages/UserLogin.js'));
// const Organization = lazy(() => import('./pages/Organization.js'));
// const OrganizationProfile = lazy(() => import('./component/pages/OrganizationProfile'));
// const LicenseExpiredPage = lazy(() => import('./component/pages/LicensePage'));
// const Connections = lazy(() => import('./component/pages/Connections'));
// const UserCreate = lazy(() => import('./component/pages/UserCreate'));
// const CreateLeadForm = lazy(() => import('./component/forms/CreateLeadForm.js'));
// const CreateContactForm = lazy(()=> import('./component/forms/CreateContactForm.js'));
// const MakeConnection = lazy(() => import('./component/pages/MakeConnection.js'));
// const LandingPage = lazy(() => import('./pages/LandingPage.js'));
// const AttachFilePage = lazy(() => import('./component/testPages/AttachFilePage.js'));
// const LocationPage = lazy(() => import('./component/testPages/LocationPage.js'));
// const CreateEvents = lazy(() => import('./component/testPages/CreateEvents.js'));
// const LeadView = lazy(() => import('./component/testPages/LeadsView.js'));

// const LeadProfile = lazy(() => import('./component/testPages/LeadProfile.js'));
// const TaskView = lazy(() => import('./component/view/TaskView/TaskView.js'));
// const TaskProfile = lazy(() => import('./component/view/TaskView/TaskProfile.js'));
// const CreateTaskForm = lazy(() => import('./component/forms/CreateTaskForm.js'));
// const ContactView = lazy(() => import('./component/view/ContactView/ContactView.js'));
// const ContactProfile = lazy(() => import('./component/view/ContactView/ContactProfile.js'));
// const CachePage = lazy(() => import('./component/testPages/CachePage.js'));
// const NotFound = lazy(() => import('./pages/NotFound.js'));
// const Webtab = lazy(() => import('./pages/Webtab.js'));
// const CreateDealForm = lazy(() => import('./component/forms/CreateDealForm.js'));
// const DealView = lazy(() => import('./component/view/DealView/DealView.js'));
// const DealProfile = lazy(()=> import('./component/view/DealView/DealProfile.js'));
// const AccountView = lazy(() => import('./component/view/AccountView/AccountView.js'));
// const AboutUs = lazy(()=> import('./component/landingComponent/AboutUs.js'));

// // Enhanced Loader Component
// // const EnhancedLoader = () => {
// //   return (
// //     <div className="spinner-wrapper">
// //       <div className="spinner">
// //         <div className="dots">
// //           {[...Array(12)].map((_, i) => (
// //             <div
// //               key={i}
// //               className="dot"
// //               style={{
// //                 transform: `rotate(${i * 30}deg) translateY(-40px)`,
// //                 opacity: 0.3 + (i % 4) * 0.2
// //               }}
// //             />
// //           ))}
// //         </div>
// //       </div>
// //       <div className="text">Loading...</div>
// //     </div>
// //   );
// // };

// // Define license exempt routes - no license check needed
// const licenseExemptRoutes = [
//   "/app/license",
//   "/app/orgregister",
//   "/app/orgProfile"
// ];

// // Component for protected routes with license check
// const ProtectedRouteWithLicense = ({ children, exemptFromLicense = false }) => {
//   return (
//     <ProtectRoute>
//       {exemptFromLicense ? children : <LicenseCheck>{children}</LicenseCheck>}
//     </ProtectRoute>
//   );
// };

// function App() {
//   const { user } = useSelector((state) => state.auth);

//   return (
//     <div className="App">
//       <Suspense fallback={<Loader/>}>
//         <Toaster />

//         <Routes>
//           {/* Public Routes */}
//           <Route
//             path="/app/login"
//             element={user ? <Navigate to="/app/home" replace /> : <UserLogin />}
//           />
//           <Route
//             path="/app/signup"
//             element={user ? <Navigate to="/app/home" replace /> : <LandingPage />}
//           />
//           <Route
//             path="/app/about-us"
//             element={<AboutUs/>}
//           />

//           {/* License-exempt Protected Routes */}
//           <Route
//             path="/app/license"
//             element={
//               <ProtectedRouteWithLicense exemptFromLicense={true}>
//                 <LicenseExpiredPage />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/orgregister"
//             element={
//               <ProtectedRouteWithLicense exemptFromLicense={true}>
//                 <Organization />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/orgProfile"
//             element={
//               <ProtectedRouteWithLicense exemptFromLicense={true}>
//                 <OrganizationProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* License-checked Protected Routes */}
//           <Route
//             path="/app/home"
//             element={
//               <ProtectedRouteWithLicense>
//                 <Home />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/genToken"
//             element={
//               <ProtectedRouteWithLicense>
//                 <Connections />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/register"
//             element={
//               <ProtectedRouteWithLicense>
//                 <UserCreate />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           <Route
//             path="/app/connection"
//             element={
//               <ProtectedRouteWithLicense>
//                 <MakeConnection />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/attach"
//             element={
//               <ProtectedRouteWithLicense>
//                 <AttachFilePage />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/location"
//             element={
//               <ProtectedRouteWithLicense>
//                 <LocationPage />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/checkin"
//             element={
//               <ProtectedRouteWithLicense>
//                 <CreateEvents />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Lead route start */}

//           <Route
//             path="/app/first"
//             element={
//               <ProtectedRouteWithLicense>
//                 <CreateLeadForm />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           <Route
//             path="/app/leadprofile"
//             element={
//               <ProtectedRouteWithLicense>
//                 <LeadProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/leadview"
//             element={
//               <ProtectedRouteWithLicense>
//                 <LeadView />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Lead route end */}

//           {/* Account route start */}
//           <Route
//             path="/app/accountview"
//             element={
//               <ProtectedRouteWithLicense>
//                 <AccountView />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/accountprofile"
//             element={
//               <ProtectedRouteWithLicense> 
//                 <AccountProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Account route end */}

//           {/* Deal route Start */}
//           <Route
//             path="/app/dealCreate"
//             element={
//               <ProtectedRouteWithLicense>
//                 <CreateDealForm />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           <Route
//             path="/app/dealView"
//             element={
//               <ProtectedRouteWithLicense>
//                 <DealView />
//               </ProtectedRouteWithLicense>
//             }
//           />

//          <Route
//             path="/app/dealProfile"
//             element={
//               <ProtectedRouteWithLicense>
//                 <DealProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Deal route end */}

//           {/* Task route start */}

//           <Route
//             path="/app/taskview"
//             element={
//               <ProtectedRouteWithLicense>
//                 <TaskView />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/taskProfile"
//             element={
//               <ProtectedRouteWithLicense>
//                 <TaskProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path="/app/taskform"
//             element={
//               <ProtectedRouteWithLicense>
//                 <CreateTaskForm />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Task route end */}

//           {/* Contact route start */}

//           <Route 
//             path='/app/contactform'
//             element={
//               <ProtectedRouteWithLicense>
//                  <CreateContactForm/>
//               </ProtectedRouteWithLicense>
//             }
//             />

//           <Route
//             path='/app/contactview'
//             element={
//               <ProtectedRouteWithLicense>
//                 <ContactView />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           <Route
//             path="/app/contactProfile"
//             element={
//               <ProtectedRouteWithLicense>
//                 <ContactProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Contact route end */}

//           <Route
//             path="/app/cache"
//             element={
//               <ProtectedRouteWithLicense>
//                 <CachePage />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Webtab Route */}

//           <Route
//             path="/app/webtab"
//             element={
//               <ProtectedRouteWithLicense>
//                 <Webtab />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           {/* Meeting Route Start */}

//           <Route
//             path='/app/meetingView'
//             element={
//               <ProtectedRouteWithLicense>
//                 <MeetingView />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path='/app/meetingprofile'
//             element={
//               <ProtectedRouteWithLicense>
//                 <MeetingProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />


//           {/* Meeting Route end */}


//          <Route
//             path='/app/crm'
//             element={
//               <ProtectedRouteWithLicense>
//                 <CrmProfile />
//               </ProtectedRouteWithLicense>
//             }
//           />


//           <Route
//             path="/app/notfound"
//             element={
//               <ProtectedRouteWithLicense>
//                 <NotFound />
//               </ProtectedRouteWithLicense>
//             }
//           />
//           <Route
//             path='/app/kushal'
//             element={
//               <ProtectedRouteWithLicense>
//                 <TestPage />
//               </ProtectedRouteWithLicense>
//             }
//           />


//           <Route
//             path='/app/unauth'
//             element={
//               <ProtectedRouteWithLicense>
//                 <AuthorizedPage />
//               </ProtectedRouteWithLicense>
//             }
//           />

//           <Route
//           path='/app/imfromzoho'
//           element={
//              <MakeConnection2/>
//           }
//           />

//           <Route 
//           path='/app/webtab2'
//           element={
//             <Webtab2/>
//           }
//           />
          
//           <Route 
//           path='/app/adminpanel'
//           element={
//             <AdminPage/>
//           }
//           />

//           <Route  
//           path='/app/drag'
//           element={
//             <DragDropComponent/>
//           }
//           />

          
//           {/* Catch-all route */}
//           <Route path="*" element={<Navigate to="/app/login" replace />} />
//         </Routes>
//       </Suspense>
//     </div>
//   );
// }

// export default App;