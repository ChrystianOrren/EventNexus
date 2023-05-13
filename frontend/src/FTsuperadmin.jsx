import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Axios from 'axios';
import { useEffect, useState } from 'react';

export const FTsuperadmin = () => {
    const location = useLocation(); 
    const navigate = useNavigate();
    
    //Storage for creating a University
    const [ name, setName ] = useState('');
    const [ locationUni, setLocationUni ] = useState('');
    const [ desc, setDesc ] = useState('');
    const [ numStudents, setNumStudents ] = useState();

    // Sent from Login.jsx
    const [ level, setLevel ] = useState('');
    const [ university_id, setuniversity_id] = useState(null);
    const [ user_id, setuser_id] = useState('');

    const api = Axios.create({
        baseURL: 'http://localhost:3000'
    });

    const createUni = async () => {
        try {
          const response = await api.post('/api/createUni', {"name": name, "location": locationUni, "description": desc, "numStudents": Number(numStudents)})
          if(response.status === 200){
            console.log("Sucessfully created university");
            // Now set superadmin universityid so page will change
            const newid = Number(response.data);
            selectUni(newid);
            navigate('/SuperAdminMain');
          }
          else{
            console.log("Failed to create university")
          }
        } catch (error) {
          console.error(error.message);
        }
    }

    const selectUni = async (uni_id) => {
        //console.log("UPDATING WITH [", user_id, ", ", uni_id, "]");
        try {
          const response = await api.post('/api/updateUniId', { "user_id": user_id, "university_id": uni_id });
          if (response.status === 200) {
            console.log("Sucessfully updated");
            setuniversity_id(uni_id);
          }
          else {
            console.log("Error updating university_id");
          }
        }
        catch (error) {
          console.error('Error:', error.message);
        }
    }

    useEffect(() => {
        setLevel(location.state.level);
        setuniversity_id(location.state.university_id);
        setuser_id(location.state.user_id);
    }, [location]);

  return (
    <div style={{display:'flex', alignItems: 'center', flexDirection: 'row', paddingLeft: '260px', paddingTop: '10px', background: '#b0bbbf', height: '100vh'}}>

              <div style={{display:'flex', alignItems: 'center', flexDirection: 'column'}}>
                <p style={{fontFamily: "Raleway", fontSize: '36px', }}>Welcome to Event Nexus</p>
                <p style={{fontFamily: "Raleway", fontSize: '30px', position: 'absolute', top:'380px'}}>Get started by creating your school</p>
              </div>

              <div style={{display:'flex', alignItems: 'center', flexDirection: 'column', paddingTop: '50px', paddingLeft: '100px'}}>

                <div className='createUni'>
                  <label htmlFor='name'>Name</label>
                  <input value={name} type='text' onChange={(e) => setName(e.target.value)}/>
                  <label htmlFor='location'>Location</label>
                  <input value={locationUni} type='text' onChange={(e) => setLocationUni(e.target.value)}/>
                  <label htmlFor='description'>Description</label>
                  <input value={desc} type='text' onChange={(e) => setDesc(e.target.value)}/>
                  <label htmlFor='numOfStudents'>Number of Students</label>
                  <input value={numStudents} type='number' onChange={(e) => setNumStudents(e.target.value)}/>
                </div>

                <p onClick={() => createUni()} style={{backgroundColor: '#CADBC8', padding: '1rem', borderRadius: '10px', fontSize: '20px', cursor: 'pointer'}}>Create University</p>
              </div>
              
            </div>
  )
}