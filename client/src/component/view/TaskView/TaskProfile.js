import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../common/Navbar';
import TaskDetails from './TaskDetails';


const Shimmer = () => {
    return (
      <div className="animate-pulse">
        <Navbar/>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-10 bg-gray-200 my-2 rounded w-full"></div>
        ))}
      </div>
    );
  };
  

const TaskProfile = () => {
  const location = useLocation();
  const taskId = location?.state?.taskId;
  const [data, setData] = useState(null); // state to store the lead data
  useEffect(() => {
    const fetchProfileData = async () => {
        try {
            let response;
            if (taskId) {
                response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/getrecordbyid/${taskId}`);
            }
            setData(response?.data?.data); // store the fetched data in state
        } catch (err) {
           console.log(err);
        }
    };

    fetchProfileData();
    
  }, [taskId]);


  return !data ?
  ( <Shimmer/>
  ) :  (
    <div>
      <TaskDetails data={data} /> 
      
    </div>
  );
}

export default TaskProfile;
