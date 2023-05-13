import React from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { Main } from './Main';
import { Landing } from './Landing';
import { FTstudent } from './FTstudent'; 
import { FTsuperadmin } from './FTsuperadmin';
import { SuperAdminMain } from './SuperAdminMain';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';

function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={<Landing/>}/>
          <Route path='/Login' element={<Login/>}/>
          <Route path="/Register" element={<Register/>} />
          <Route path="/Main" element={<Main/>} />
          <Route path='/FTstudent' element={<FTstudent/>} />
          <Route path='/FTsuperadmin' element={<FTsuperadmin/>} />
          <Route path='/SuperAdminMain' element={<SuperAdminMain/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;