import React, { useState } from "react";
import { Login } from './Login';
import { Register } from './Register';
import { About } from './About';
import logo from './images/newlogo-removebg-preview.png';
import banner from './images/UCFbanner.jpg';


export const Landing = () => {
    const [ login, setLogin ] = useState(false);
    const [ register, setRegister ] = useState(false);
    const [ about, setAbout ] = useState(true);

    function clickLogin(){
        setLogin(true);
        setRegister(false);
        setAbout(false);
    }

    function clickRegister(){
        setLogin(false);
        setRegister(true);
        setAbout(false);
    }

    function clickAbout(){
        setLogin(false);
        setRegister(false);
        setAbout(true);
    }

    return (
        <div className="landing">
            <div className="landing-left">   
                <img src={logo} alt="logo" style={{width: '100px', height: '100px', paddingTop: '50px'}}/>
                <div style={{fontSize: 50, paddingTop: '20px', fontFamily: 'Raleway'}}>Event Nexus</div>
                <div style={{fontSize: 30}}></div>
                <img src={banner} alt="banner" style={{wdith: '300px', height: '300px'}}/>
            </div>
            <div className="landing-form-right">
                <div className="landing-right">
                    {about ? <div className="landing-btn" style={{ marginRight: '1rem' , backgroundColor: '#9c9583', color: '#CADBC8', fontFamily: 'Raleway'}} onClick={clickAbout}>About</div> : <div className="landing-btn" style={{ marginRight: '1rem' }} onClick={clickAbout}>About</div>}
                    { login ? <div className="landing-btn" style={{ marginRight: '1rem' , backgroundColor: '#9c9583', color: '#CADBC8', fontFamily: 'Raleway'}} onClick={clickLogin}>Login</div> : <div className="landing-btn" style={{ marginRight: '1rem' }} onClick={clickLogin}>Login</div> }
                    { register ? <div className="landing-btn" onClick={clickRegister} style={{backgroundColor: '#9c9583', color: '#CADBC8', fontFamily: 'Raleway'}}>Register</div> : <div className="landing-btn" onClick={clickRegister}>Register</div> }
                </div>
                <div className="landing-popup">
                    { login ? <Login/> : null }
                    { register ? <Register/> : null }
                    { about ? <About/> : null}
                </div>
            </div>
        </div>
    )
}


/*
import React, { useState } from "react";
import { Login } from './Login';
import { Register } from './Register';
import { About } from './About';
import logo from './images/newlogo-removebg-preview.png';



export const Landing = () => {
    const [ login, setLogin ] = useState(false);
    const [ register, setRegister ] = useState(false);
    const [ about, setAbout ] = useState(true);

    function clickLogin(){
        setLogin(true);
        setRegister(false);
        setAbout(false);
    }

    function clickRegister(){
        setLogin(false);
        setRegister(true);
        setAbout(false);
    }

    function clickAbout(){
        setLogin(false);
        setRegister(false);
        setAbout(true);
    }

    return (
        <div className="landing">
            <div className="landing-left">   
                <img src={logo} alt="logo" style={{width: '50%', height: '25%', paddingTop: '100px'}}/>
                <div style={{fontSize: 50, paddingTop: '200px'}}>What's The Move?</div>
                <div style={{fontSize: 30}}>Find events - near you - worth a move</div>
            </div>
            <div className="landing-form-right">
                <div className="landing-right">
                    {about ? <div className="landing-btn" style={{ marginRight: '1rem' , backgroundColor: '#d5ed86', color: '#4b50d1'}} onClick={clickAbout}>About</div> : <div className="landing-btn" style={{ marginRight: '1rem' }} onClick={clickAbout}>About</div>}
                    { login ? <div className="landing-btn" style={{ marginRight: '1rem' , backgroundColor: '#d5ed86', color: '#4b50d1'}} onClick={clickLogin}>Login</div> : <div className="landing-btn" style={{ marginRight: '1rem' }} onClick={clickLogin}>Login</div> }
                    { register ? <div className="landing-btn" onClick={clickRegister} style={{backgroundColor: '#d5ed86', color: '#4b50d1'}}>Register</div> : <div className="landing-btn" onClick={clickRegister}>Register</div> }
                </div>
                <div className="landing-popup">
                    { login ? <Login/> : null }
                    { register ? <Register/> : null }
                    { about ? <About/> : null}
                </div>
            </div>
        </div>
    )
}
*/

/*
<div>
            <div className="LandingHeader">
                <img src={logo} alt="logo" style={{width: '75px', height: '75px'}}/>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                    <div style={{paddingRight: '20px', fontSize: '30px', cursor: 'pointer'}}>Login</div>
                    <div style={{paddingRight: '20px', fontSize: '30px', cursor: 'pointer'}}>Register</div>
                </div>
            </div>
            <img src={banner} alt='banner' style={{width: '209.6vh', height: '600px'}}/>
            <div style={{backgroundColor: '#93C0A4', width: '209.6vh', height: '235px', marginTop: '-5px'}}>

            </div>
        </div>
*/