import React, { useState } from 'react'
import Axios from 'axios';

export const Register = () => {
  const [ email, setEmail ] = useState('');
  const [ pass, setPass ] = useState('');
  const [ passConfirm, setPassConfirm ] = useState('');
  const [ level, setLevel ] = useState('student');
  const [ sucess, setSucess] = useState(false);
  const [ regErr, setRegErr] = useState(false);

  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isValidEmail = emailRegex.test(email);

  // function handleClick(){
  //   navigate('/');
  // }

  const api = Axios.create({
    baseURL: 'http://localhost:3000'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!(pass === passConfirm) || !isValidEmail){
      return;
    }

    try {
      const response = await api.post('/api/register', {"email": email, "password": pass, "level": level });
      if (response.status === 200) {
        console.log("User Created Sucessfully");
        setSucess(true);
      }
      else {
        setRegErr(true);
      }
    }
    catch (error) {
      console.log("ERROR: ", error);
      setRegErr(true);
    }
  };

  function handleLevelChange(event) {
    setLevel(event.target.value); // update the level state when the selection changes
  }

  return (
    <div className='login-register'>
      <div className='auth-form-container'>
      <form className='register-form' onSubmit={handleSubmit}>
          <label htmlFor="email" > Email </label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder='youremail@mail.com'/>
          <div>
            { !(email === '') ? 
            <div>
              { !isValidEmail ? <label className="auth-error-msg">Please enter a vaild email</label> : null}
            </div> : null }
          </div>
          <label htmlFor="password" > Password </label>
          <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" placeholder='**********' id = "password" name = "password"/>
          <label htmlFor="password" > Confirm Password </label>
          <input value={passConfirm} onChange={(e) => setPassConfirm(e.target.value)} type="password" placeholder='**********' id = "password" name = "password"/>
          <div>
            { !(pass === passConfirm) ? <label className="auth-error-msg">Passwords must match</label> : null}
          </div>
          <label htmlFor="level">User Level:</label>
          <select defaultValue={"student"} className='create-drop-down' id="level" name="level" value={level} onChange={handleLevelChange}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>         
          </select>
          <button onClick={handleSubmit}> Create Account </button>
      </form>
        { sucess ? <div className='registerMsg'style={{color: 'green', border: '2px solid green'}}>User created sucessfully!</div> : null }
        { regErr ? <div className='registerMsg' style={{color: 'red', border: '2px solid red'}}>Error registering</div> : null }
      </div>
    </div>
  )
}

/*
<button className='link-btn' onClick={handleClick} >Already have an accont? Login here.</button>
*/