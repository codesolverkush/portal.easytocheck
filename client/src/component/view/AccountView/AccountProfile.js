import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../common/Navbar';
import ShimmerPage from '../../ui/ContactFormShimmer';
import toast from 'react-hot-toast';
import AccountDetails from './AccountDetails';


const AccountProfile = () => {
  const location = useLocation();
  const accountId = location?.state?.accountId;
  const [data, setData] = useState(null); // state to store the lead data
  const [username,setUsername] = useState("username");
  useEffect(() => {
    const fetchProfileData = async () => {
        try {
            let response;
              response = await axios.get(`${process.env.REACT_APP_APP_API}/gets/getbyid/Accounts/${accountId}`);               
                if(response.status === 200){
                  setData(response?.data?.data || null); // store the fetched data in state
                  setUsername(response?.data?.username ||  "Username");
                }           
        } catch (err) {
          console.log(err)
          toast.error("Contact id can't exist!");
        }
    };

    fetchProfileData();
    
  }, []);

  console.log(data);

  return !data ?
  ( <ShimmerPage/>
  ) :  (
    <div>
       <AccountDetails data={data} accountId={data.data[0]?.id}/>
    </div>
  );
}

export default AccountProfile;
