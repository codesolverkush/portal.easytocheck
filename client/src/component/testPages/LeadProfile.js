import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import LeadDetails from './LeadDetails'; // import the LeadDetails component
import Navbar from '../common/Navbar';
import toast from 'react-hot-toast';
import ShimmerPage from '../ui/ContactFormShimmer';



  

const LeadProfile = () => {
  const location = useLocation();
  const leadId = location?.state?.leadId;
  const accessScore = location?.state?.accessScore;
  

  const [username,setUsername] = useState("Username");
  const [data, setData] = useState(null); // state to store the lead data

  console.log("leaddata",data)
  useEffect(() => {
    const fetchProfileData = async () => {
        try {
            let response;
            if (leadId) {
                response = await axios.get(`${process.env.REACT_APP_APP_API}/gets/getbyid/Leads/${leadId}`);
                if(response.status === 200){
                  setUsername(response?.data?.username || "Username");
                }
            }
            setData(response?.data?.data); // store the fetched data in state
        } catch (err) {
          toast.error("This lead did not exist!")
        }
    };

    fetchProfileData();
    
  }, [leadId]);


  return (
    <div>
      {!data ? (
        <ShimmerPage/>
      ) : (
        <LeadDetails data={data} leadId={leadId} username={username} accessScore={accessScore} />
      )}
    </div>
  );
}

export default LeadProfile;
