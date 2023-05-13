import React, { useState } from 'react';
import {useRef} from 'react';
import { Search, Person, Add,  } from '@material-ui/icons';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

export const Sidebar = () => {
    const navigate = useNavigate();
    const windowWidth = useRef(window.innerWidth);
    const windowHeight = useRef(window.innerHeight);
    const [clickSearch, SetClickedSearch] = useState(false);
    const [clickPerson, SetClickedPerson] = useState(false);
    const [clickAdd, SetClickedAdd] = useState(false);
    const [clickLogout, SetClickedLogout] = useState(false);

    function handleAdd() {

    }

    function handlePerson() {

    }

    function handleSearch() {
        
    }

    function handleLogout() {
        SetClickedLogout(true);
        SetClickedAdd(false);
        SetClickedSearch(false);
        SetClickedPerson(false);
        navigate('../');
    }

  return (
    <div>
        <div className='sidebar' style={{height: '100vh', width: windowWidth}}>
            <div onClick={handleSearch} style ={{cursor: 'pointer', paddingTop: '25px', paddingBottom: '25px'}}>
                <Search style={{fontSize: '36px', padding: '5.5px'}}/>
            </div>
            <div onClick={handlePerson} style ={{cursor: 'pointer', paddingBottom: '25px'}}>
                <Person style={{fontSize: '36px', padding: '5.5px'}}/>
            </div>
            <div onClick={handleAdd} style ={{cursor: 'pointer'}}>
                <Add style={{fontSize: '36px', padding: '5.5px'}}/>
            </div>
            <div onClick={handleLogout} style ={{cursor: 'pointer', position: 'absolute', bottom: '0'}}>
                <LogoutIcon style={{fontSize: '36px', padding: '5.5px'}}/>
            </div>
        </div>
        <div>
            { clickSearch ? <div></div> : null }
            { clickAdd ? <div></div> : null }
            { clickPerson ? <div></div> : null }
        </div>
    </div>
  )
}