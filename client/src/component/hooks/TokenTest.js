import React from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const tokenHandler = async (e)=>{
    e.preventDefault();
    
    try {

    const response = await axios.get(`${process.env.REACT_APP_APP_API}/test/token-check`);
    console.log(response);
    if(response.status === 200){
        toast.success('Cookies Data!');
      }
      
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error"
      toast.error(message);
    }
  }

const TokenTest = () => {
  return (
    <button onClick={tokenHandler} className='text-white bg-red-500 w-1/6 p-4'>Click Here</button>
  )
}

export default TokenTest;