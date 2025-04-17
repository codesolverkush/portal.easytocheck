import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import {UserDataContext} from "../context/UserContext";
import toast from "react-hot-toast";

const UserSignup = () => {

  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [userData,setUserData] = useState({});


  const navigate = useNavigate()
  const {user,setUser} = useContext(UserDataContext);

  const submitHandler = async (e)=>{
    e.preventDefault();
    const newUser = {
      email: email,
      password: password
    }

    try {

    const response = await axios.post(`${process.env.REACT_APP_APP_API}/users/signup`,newUser);
    if(response.status === 200){
      const data = response.data;
      setUser(data.user);
      localStorage.setItem('token',data.token);
      navigate('/app/login');
    }
      
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error"
      toast.error(message);
    }
    setEmail('');
    setPassword('');
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
          

          <h3 className="text-xl mb-2">What's your email</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            required
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <h3 className="text-xl mb-2">Enter Password</h3>
          <input
            className="bg-[#eeeeee] mb-7 rounded px-4 py-2 border w-full text-lg placeholder:text-base"
            type="password"
            placeholder="enter your password"
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button className="bg-[#111111] rounded px-4 py-2 font-semibold mb-2 border w-full text-white text-lg placeholder:text-base">
           Sign Up
          </button>
        </form>
        <p className="mb-1 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            className="text-blue-500 hover:text-blue-700 cursor-pointer font-medium"
            to="/app/login"
          >
            Login
          </Link>
        </p>
      </div>

      <div>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
  <p className="text-gray-800 text-center font-medium">
    If you encounter any issues, feel free to reach out to us at {" "}
    <a href="mailto:kushal@gmail.com" className="text-blue-600 hover:underline">
      kushal@gmail.com
    </a>
  </p>
</div>

      </div>
    </div>
  );
};

export default UserSignup;