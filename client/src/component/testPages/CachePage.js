import { useState, useEffect } from 'react';
import axios from 'axios';

const CachePage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState(null);

  const checkCache = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/getcache`);
      if (response.status === 200 && response.data?.data) {
        setTasks(response.data.data);
        if (response.data.info) {
          setPageInfo(response.data.info);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Cache check failed:", error);
      return false;
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First check cache
      const cacheHit = await checkCache();
      if (cacheHit) {
        setLoading(false);
        return;
      }

      // If cache miss, fetch from API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/gettaskdetails`);
      
      if (response.status === 200) {
        setTasks(response.data?.data || []);
        if (response.data?.info) {
          setPageInfo(response.data.info);
        }
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch tasks');
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);


  // Return values and methods for component use
  return (
     <h1>Kushal Pratap Singh</h1>
  )
};

export default CachePage;