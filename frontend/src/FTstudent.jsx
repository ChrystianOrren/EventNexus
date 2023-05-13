import React from 'react';
import Axios from 'axios';
import {useRef, useEffect, useState} from 'react';
import { Search } from '@material-ui/icons';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export const FTstudent = () => {
    const location = useLocation();
    const navigate = useNavigate();

    //Used for Searching on first time Student or Admin login
    const [ query, setQuery ] = useState('');
    const [ unis, setUnis ] = useState();
    const [ filtered, setFiltered ] = useState();

    // Sent from Login.jsx
    const [ level, setLevel ] = useState('');
    const [ university_id, setuniversity_id] = useState(null);
    const [ user_id, setuser_id] = useState('');

    const selectUni = async (uni_id) => {
        //console.log("UPDATING WITH [", user_id, ", ", uni_id, "]");
        try {
          const response = await api.post('/api/updateUniId', { "user_id": user_id, "university_id": uni_id });
          if (response.status === 200) {
            console.log("Sucessfully updated");
            console.log(uni_id);
            navigate('/Main', { state: { level, "university_id": uni_id, user_id } });
          }
          else {
            console.log("Error updating university_id");
          }
        }
        catch (error) {
          console.error('Error:', error.message);
        }
    }

    const filter = (e) => {
        const word = e.target.value;
        setQuery(word);
        const newFilter = unis.filter((value) => {
          return value.name.toLowerCase().includes(word.toLowerCase());
        })
        setFiltered(newFilter);
    }

    const handleSearch = async () => {
        try{
          const response = await api.get('/api/unis');
          if (response.status === 200){
            setUnis(response.data);
          }
          else {
            console.log("COULDN'T FIND UNIS");
          }
        }catch (error) {
          console.log("ERROR: ", error);
        }
    }

    const api = Axios.create({
        baseURL: 'http://localhost:3000'
    });

    useEffect(() => {
        setLevel(location.state.level);
        setuniversity_id(location.state.university_id);
        setuser_id(location.state.user_id);
    }, [location]);

    useEffect(() => {
        handleSearch();
    }, [])

  return (
    <div style={{background: '#b0bbbf', height: '100vh'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px'}}>
            <p style={{fontFamily: "Raleway", fontSize: '36px'}}>Welcome to Event Nexus</p>
            <p style={{fontFamily: "Raleway", fontSize: '30px', position: 'absolute', top: '110px'}}>Get started by selecting your school</p>
      
            {/* Search bar and results */}
            <div style={{display: 'flex', flexDirection: 'column'}}>
            
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'row', paddingTop: '50px'}}>
                    <input type='text' value={query} onChange={filter} placeholder='Find your school' style={{ outline: 'none', fontSize:' 15px', height: '20px', width: '300px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px'}}/>
                    <Search style={{fontSize: '36px', padding: '8px', backgroundColor: 'white', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', cursor: 'pointer'}}/>
                </div>
            
                <div>
                { !(filtered === undefined) ? 
                    <div>
                        {!(filtered.length === 0 || query === '') ? 
                            <div style={{backgroundColor: 'white', width: '300px', marginLeft: '0px', padding: '7px', position: 'absolute', top: '295px', borderRadius: '10px', maxHeight: '200px', overflow: 'hidden', overflowY: 'auto'}}>
                            {filtered.map((uni) => (
                                <div onClick={() => selectUni(uni.university_id)} className='firstSearchResult' style={{cursor: 'pointer', padding: '2px'}}>{uni.name}</div>
                            ))}
                        </div> : null }
                    </div>
                : null}
                </div>
            </div>
        </div>
    </div> 
  )
}