import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../common/Navbar';
import ContactDetails from './ContactDetails';
// import TaskDetails from './TaskDetails';


const Shimmer = () => {
  return (
    <>
    <Navbar/>
    <div className="w-full max-w-3xl mx-auto">
      {/* Card header shimmer */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        <div className="flex-1">
          <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Main content shimmer */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 mb-6">
        {/* Hero section */}
        <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer-wave"></div>
        </div>

        {/* Content sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/5 mb-4"></div>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer shimmer */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
      </div>

      <style jsx>{`
        @keyframes shimmerEffect {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-wave {
          animation: shimmerEffect 1.5s infinite;
        }
      `}</style>
    </div>
    </>
  );
};
  

const ContactProfile = () => {
  const location = useLocation();
  const contactId = location?.state?.contactId;
  const accessScore = location?.state?.accessScore;
  const [data, setData] = useState(null); // state to store the lead data
  const [username,setUsername] = useState("username");
  useEffect(() => {
    const fetchProfileData = async () => {
        try {
            let response;
            if (contactId) {
                response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/getcontactbyid/${contactId}`);
                console.log("hello",response);

                if(response.status === 200){
                  setData(response?.data?.data || null); // store the fetched data in state
                }
            }
            
        } catch (err) {
           console.log(err);
        }
    };

    fetchProfileData();
    
  }, [contactId]);

  return !data ?
  ( <Shimmer/>
  ) :  (
    <div>
       <ContactDetails data={data} accessScore={accessScore}/>     
    </div>
  );
}

export default ContactProfile;
