import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";

const UserCreate = () => {
  const [first_name, setFirst_name] = useState('');
  const [last_name, setLast_name] = useState('');
  const [email_id, setEmail_id] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const newUser = { first_name, last_name, email_id };
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/users/register`, newUser);
      toast.success(response?.data?.message);
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error";
      toast.error(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <img
            className="w-16 h-16"
            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
            alt="User Icon"
          />
          <Link className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 font-semibold text-white text-lg" to={'/app/home'}>
            Home
          </Link>
        </div>
        <form onSubmit={submitHandler}>
          <label className="block text-lg font-medium mb-2">First Name</label>
          <input
            className="bg-gray-700 text-white mb-4 rounded px-4 py-2 border border-gray-600 w-full focus:outline-none focus:border-blue-500"
            required
            type="text"
            placeholder="Enter your First Name"
            value={first_name}
            onChange={(e) => setFirst_name(e.target.value)}
          />
          
          <label className="block text-lg font-medium mb-2">Last Name</label>
          <input
            className="bg-gray-700 text-white mb-4 rounded px-4 py-2 border border-gray-600 w-full focus:outline-none focus:border-blue-500"
            required
            type="text"
            placeholder="Enter your Last Name"
            value={last_name}
            onChange={(e) => setLast_name(e.target.value)}
          />
          
          <label className="block text-lg font-medium mb-2">Email ID</label>
          <input
            className="bg-gray-700 text-white mb-4 rounded px-4 py-2 border border-gray-600 w-full focus:outline-none focus:border-blue-500"
            type="email"
            placeholder="Enter your email"
            required
            value={email_id}
            onChange={(e) => setEmail_id(e.target.value)}
          />
          
          <button className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2 font-semibold w-full text-white text-lg shadow-lg">
            Register New User
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserCreate;
