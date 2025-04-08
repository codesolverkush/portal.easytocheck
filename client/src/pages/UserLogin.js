// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { UserDataContext } from "../context/UserContext";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useDispatch } from "react-redux";
// import { userExists,setCookies, setOrgId, setLicenseStatus } from "../redux/reducers/auth";

// const UserLogin = () => {
//   const { setUser } = useContext(UserDataContext);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [unauthorized, setUnauthorized] = useState(false);

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_APP_API}/test/userDetails`);
        
//         if (response.status === 200) {
//           const data = response.data;
//           console.log(data);
//           setUser(data.user);
//           dispatch(userExists(data.user));
         
//           const response2 = await axios.get(`${process.env.REACT_APP_APP_API}/org/checkHandler`);
//           console.log(response2);
//           if (response2.status === 200) {
//             navigate("/app/orgregister");
//             toast.success("Please register your organization!");
//           } else if (response2.status === 208) {
//             const active = response2?.data?.active;
//             const orgId = response2?.data?.orgId;
//             const displayname = response2?.data?.displayname;

//             if(orgId){
//               dispatch(setCookies(orgId));
//               dispatch(setOrgId(orgId)); // Store orgId in Redux
//             }

//              // Update license status in Redux
//              dispatch(setLicenseStatus(active));


//             if (active) {
//               navigate("/app/home", { state: { orgId } });
//               toast.success(`Greeting from ${displayname}`);;
//             } else {
//               navigate("/app/license");
//               toast.error("Your license has expired!");
//             }
//           }
//         }
//       } catch (error) {
//         setUnauthorized(true);
//         const message = error?.response?.data?.message || "Something went wrong!";
//         // toast.error(message);
//         navigate("/app/signup");
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Timeout to set unauthorized state after 15 seconds
//     const timeout = setTimeout(() => {
//       setUnauthorized(true);
//       setLoading(false);
//     }, 15000);

//     fetchUser();

//     return () => clearTimeout(timeout); // Cleanup timeout on unmount
//   }, [dispatch, navigate, setUser]);

//   return (
//     <div className="p-7 flex h-screen flex-col justify-center items-center">
//       {loading ? (
//         <div className="animate-pulse text-gray-500">Loading...</div>
//       ) : unauthorized ? (
//         <div className="text-red-500">Unauthorized</div>
//       ) : (
//         <img
//           className="w-17 h-20 m-4"
//           src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
//           alt="User Icon"
//         />
//       )}
//     </div>
//   );
// };

// export default UserLogin;

















import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { userExists,setCookies, setOrgId, setLicenseStatus } from "../redux/reducers/auth";

const UserLogin = () => {
  const { setUser } = useContext(UserDataContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/test/userDetails`);
        
        if (response.status === 200) {
          const data = response.data;
          console.log(data);
          setUser(data.user);
          dispatch(userExists(data.user));
         
          const response2 = await axios.get(`${process.env.REACT_APP_APP_API}/org/checkHandler`);
          console.log(response2);
          if (response2.status === 200) {
            navigate("/app/orgregister");
            toast.success("Please register your organization!");
          } else if (response2.status === 208) {
            const active = response2?.data?.active;
            const orgId = response2?.data?.orgId;
            const displayname = response2?.data?.displayname;

            if(orgId){
              dispatch(setCookies(orgId));
              dispatch(setOrgId(orgId)); // Store orgId in Redux
            }

            // Update license status in Redux
            dispatch(setLicenseStatus(active));

            if (active) {
              navigate("/app/home", { state: { orgId } });
              toast.success(`Greeting from ${displayname}`);
            } else {
              navigate("/app/license");
              toast.error("Your license has expired!");
            }
          }
        }
      } catch (error) {
        // Silently redirect to signup without showing error
        navigate("/app/signup");
      } finally {
        setLoading(false);
      }
    };

    // Timeout to redirect after 15 seconds
    const timeout = setTimeout(() => {
      navigate("/app/signup");
      setLoading(false);
    }, 15000);

    fetchUser();

    return () => clearTimeout(timeout); // Cleanup timeout on unmount
  }, [dispatch, navigate, setUser]);

  return (
    <div className="p-7 flex h-screen flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      {loading ? (
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full  border-t-transparent"></div>
            </div>
            <img
              className="w-16 h-16 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
              alt="User Icon"
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-700">Logging you in</h2>
            <p className="text-gray-500 text-sm">Please wait while we fetch your details...</p>
          </div>
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      ) : (
        <img
          className="w-17 h-20 m-4"
          src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
          alt="User Icon"
        />
      )}
    </div>
  );
};

export default UserLogin;
