

import React, { useContext, useState } from "react";
import { Link, redirect, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";

const Connections = () => {

  const [client_id,setClient_id] = useState('');
  const [refresh_token,setRefresh_token] = useState('');
  const [client_secret,setClient_secret] = useState('');
 



  const navigate = useNavigate()
 

  const submitHandler = async (e)=>{
    e.preventDefault();
    const newUser = {
      client_id: client_id,
      client_secret: client_secret,
      refresh_token: refresh_token,  
    }

    try {

    const response = await axios.post(`${process.env.REACT_APP_APP_API}/test/`,newUser);
    const redirectUrl = response?.data?.message;
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
    // console.log(redirectUrl);
    toast.success('You are redirecting...')
    // if(response.status === 200){
    //   const data = response.data;
    //   localStorage.setItem('token',data.token);
    //   navigate('/app/orgProfile');
    //   toast.success('Organization register successfully!')
    // }      
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error"
      toast.error(message);
    }
  }
  return (
    <div className="p-7 flex h-screen flex-col justify-between">
      <div>
        <img
          className="w-17 h-20 m-4"
          src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
          alt=""
        />
        <form onSubmit={submitHandler}>
          

          <h3 className="text-xl mb-2">Client Id</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="text"
            placeholder="Enter your Client Id"
            value={client_id}
            onChange={(e)=>setClient_id(e.target.value)}
          />
        <h3 className="text-xl mb-2">Client Secret</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="text"
            placeholder="Enter your Client Secret"
            value={client_secret}
            onChange={(e)=>setClient_secret(e.target.value)}
          />
          <h3 className="text-xl mb-2">Enter Your Refresh Token</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            type="text"
            placeholder="Enter your password"
            required
            value={refresh_token}
            onChange={(e)=>setRefresh_token(e.target.value)}
          />
            
          <button className="bg-[#111111] rounded px-4 py-2 font-semibold mb-2 border w-full text-white text-lg placeholder:text-base">
           Refresh your Token
          </button>
        </form>
        
      </div>

    </div>
  );
};

export default Connections;