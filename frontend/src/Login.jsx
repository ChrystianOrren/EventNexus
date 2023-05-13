import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

export const Login = () => {
  const [ email, setEmail ] = useState('');
  const [ pass, setPass ] = useState('');
  const [flagInvalid, setFlagInvalid] = useState(false);
  const navigate = useNavigate();
  const [ level, setLevel ] = useState('');
  const [ university_id, setuniversity_id] = useState('');
  const [ user_id, setuser_id ] = useState('');

  const api = Axios.create({
    baseURL: 'http://localhost:3000'
  });

  useEffect(() => {
    if (level === 'student' && university_id === "null") {
      navigate('/FTstudent', { state: { level, university_id, user_id } });
    }
    if (level === 'superadmin' && university_id === "null") {
      navigate('/FTsuperadmin', { state: { level, university_id, user_id } });
    }
    if (level === 'student' && university_id !== "null") {
      navigate('/Main', { state: { level, university_id, user_id } })
    }
    if (level === 'superadmin' && university_id !== "null") {
      navigate('/SuperAdminMain', { state: { level, university_id, user_id } })
    }
  }, [level, university_id]);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/login', { "email": email, "password": pass });
      if (response.status === 200) {
        console.log("Login sucessful");
        const data = (response.data).split(', ');
        setLevel(data[0]);
        setuniversity_id(data[1]);
        setuser_id(data[2]);
      }
      else {
        console.log("Login Failed");
      }
    }
    catch (error) {
      console.error('Error:', error.message);
      if (error.message === "Request failed with status code 401") {
        console.log('INVALID EMAIL/PASSWORD');
        setFlagInvalid(true);
      }
    }
  }

  return (
    <div className="login-register">
      <div className="auth-form-container" >
        <form className="login-form">
            <label htmlFor="email" > Email </label>
            <input style={{outline: 'none'}} value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder='youremail@mail.com'/>
            <label htmlFor="password" > Password </label>
            <input style={{outline: 'none'}} value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder='**********' id = "password" name = "password"/>
            <button style={{backgroundColor: '#CADBC8'}} onClick={handleSubmit}> Login </button>
            <div>
              { flagInvalid ? <label className="auth-error-msg">Invalid email / password</label> : null}
            </div>
        </form>
      </div>
    </div>
  )
}


/*
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

export const Login = () => {
  const [ email, setEmail ] = useState('');
  const [ pass, setPass ] = useState('');
  const [flagInvalid, setFlagInvalid] = useState(false);
  const navigate = useNavigate();
  const [ level, setLevel ] = useState('');
  const [ university_id, setuniversity_id] = useState('');
  const [ user_id, setuser_id ] = useState('');

  const api = Axios.create({
    baseURL: 'http://localhost:3000'
  });

  useEffect(() => {
    if (level === 'student' || level === 'admin' || level === 'superadmin' && university_id != ''){
      navigate('/Main', { state: { level, university_id, user_id } });
    }
  }, [level, university_id, navigate, user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/api/login', { "email": email, "password": pass });
      if (response.status === 200) {
        console.log("Login sucessful");
        const data = (response.data).split(', ');
        setLevel(data[0]);
        setuniversity_id(data[1]);
        setuser_id(data[2]);
      }
      else {
        console.log("Login Failed");
      }
    }
    catch (error) {
      console.error('Error:', error.message);
      if (error.message === "Request failed with status code 401") {
        console.log('INVALID EMAIL/PASSWORD');
        setFlagInvalid(true);
      }
    }
  }

  return (
    <div className="login-register">
      <div className="auth-form-container" >
        <form className="login-form">
            <label htmlFor="email" > Email </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder='youremail@mail.com'/>
            <label htmlFor="password" > Password </label>
            <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder='**********' id = "password" name = "password"/>
            <button onClick={handleSubmit}> Login </button>
            <div>
              { flagInvalid ? <label className="auth-error-msg">Invalid email / password</label> : null}
            </div>
        </form>
      </div>
    </div>
  )
}
*/