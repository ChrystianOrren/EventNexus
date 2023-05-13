import React, { useState } from 'react';
import { Search,  } from '@material-ui/icons';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import data from './dummydata/searchdata.json'

export const SearchBar = () => {
    const [ query, setQuery ] = useState('');
    const navigate = useNavigate();

    function handleClick() {
        //search api
        console.log("CLCIKED")
    }

    return (
        <div className='SearchHeader'>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <div className='SearchBar'>
                    <input style={{ outline: 'none', fontSize:' 15px'}} className='SearchInput' type='text' value={query} onChange={(e) => setQuery(e.target.value)} placeholder='Search...'/>
                    <div className='SearchBtn' onClick={handleClick} style ={{cursor: 'pointer'}}>
                        <Search style={{fontSize: '36px', padding: '5.5px'}}/>
                    </div>
                </div>
                <div className='SearchResults'>
                    {data.map((value, key) => {
                        return(
                            <p className='SearchResult'>{value.name}</p>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}