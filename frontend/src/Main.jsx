import React from 'react'
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from '@material-ui/icons';
import Axios from 'axios';
import ReactModal from 'react-modal';
import ReactStars from "react-rating-stars-component";

import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

import { GoogleMap, useJsApiLoader , Marker, Autocomplete, LoadScript } from "@react-google-maps/api";

//Google Maps API Initalization.
const key = "AIzaSyBIGfq7XEV_K8z-HOVyK229-Ezj1cdRn20"; //API KEY
const libraries = ["places"]; //Library for places, used for autocomplete
const MapLoader = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: key,
    libraries: libraries,
  });

  // Check if Google Maps API is already loaded
  const isGoogleLoaded = !!window.google;

  // If Google Maps API is already loaded, return null
  if (isGoogleLoaded) {
    return null;
  }

  return !isLoaded ? <div>Loading...</div> : null;
};

export const Main = () => {
  const location = useLocation();
  
  //For the search bar
  const [ query, setQuery ] = useState('');
  const [ rsos, setRsos ] = useState([]);
  const [ filtered, setFiltered ] = useState([]);
  const [ isOpenRSOSearch, setIsOpenRSOSearch ] = useState(false);
  const [ joinedRSO, setJoinedRSO ] = useState(false);
  const [ alreadyIn, setAlreadyIn ] = useState(false);

  //My rsos (display and levaing / joining )
  const [ myRSOs, setMyRSOs ] = useState([]);
  const [ activeRSO, setActiveRSO ] = useState([]);
  const [ isOpenMyRSO, setIsOpenMyRSO] = useState(false);
  const [ currRSO, setCurrRSO] = useState([]);
  const [ flagAdminLeave, setFlagAdminLeave ] = useState(false);
  const [  youLeft, setYouLeft ] = useState(false);
  const [ selectedRSO, setSelectedRSO ] = useState("");
  const [ rso_ids, setrso_ids ] = useState([]);

  //Switch buttons for filters
  const [ filter_public, setfilter_public ] = useState(true);
  const [ filter_private, setfilter_private ] = useState(false);
  const [ RSO, setRSO ] = useState(false);

  //Storage for create RSO rquest
  const [ NRname, setNRname ] = useState('');
  const [ NRadmin, setNRadmin ] = useState('');
  const [ NRmem1, setNRmem1 ] = useState('');
  const [ NRmem2, setNRmem2 ] = useState('');
  const [ NRmem3, setNRmem3 ] = useState('');
  //Flag for emails not being the same domain
  const [ flagRSOCreated, setFlagRSOCreated ] = useState(false);

  //Modal switches for create buttons
  const [ isOpenPublic, setIsOpenPublic ] = useState(false);
  const [ isOpenCreateRSOEvent, setIsOpenCreateRSOEvent ] = useState(false);
  const [ isOpenRSO, setIsOpenRSO ] = useState(false);

  // Sent from Login.jsx
  const [ level, setLevel ] = useState('');
  const [ university_id, setuniversity_id] = useState(null);
  const [ user_id, setuser_id] = useState('');

  //Bool for if a user is an admin and storing rsos which they are an admin of
  const [ isAdmin, setIsAdmin ] = useState(false);
  const [ adminRSOs, setAdminRSOs ] = useState([]);

  //Storage for Creating an Event
  const [ eventName, setEventName ] = useState('');
  const [ eventCategory, setEventCategory ] = useState('');
  const [ eventDesc, setEventDesc ] = useState('');
  const [ eventDate, setEventDate ] = useState();
  const [ eventTime,  setEventTime] = useState();
  const [ eventLocation, setEventLocation ] = useState('');
  const [ eventCords, setEventCords] = useState({ lat: 0, lng: 0 });
  const [ eventLocName, setEventLocName ] = useState('');
  const [ eventConPhone, setEventConPhone ] = useState('');
  const [ eventConEmail, setEventConEmail ] = useState('');
  const [ CPEsuccess, setCPEsuccess ] = useState(false); // Flag for responses when clicking Create Public Event Button
  const [ CPEfail, setCPEfail ] = useState(false); // Flag for responses when clicking Create Public Event Button
  const [ CREsuccess, setCREsuccess ] = useState(false);
  const [ CREfail, setCREfail ] = useState(false);

  //Storage for all events.
  const [ publicEvents, setPublicEvents] = useState([]);
  const [ privateEvents, setPrivateEvents] = useState([]);
  const [ rsoEvents, setRsoEvents] = useState([]);

  //Comments
  const [isOpenComments, setIsOpenComments] = useState(false);
  const [ currEvent, setCurrEvent ] = useState();

  //Grab data sent from Login
  useEffect(() => {
    if(location && location.state){
      setLevel(location.state.level);
      setuniversity_id(location.state.university_id);
      setuser_id(location.state.user_id);
    }
  }, [location]);

  // useEffect(() => {
  //   getRsos();
  // })

  //Grab All RSOs to display in search
  useEffect(() => {
    if(university_id !== null){
      getRsos();
      getPrivateEvents();
    }
  }, [university_id]);

  //Grab all RSOs the user is apart of 
  useEffect(() => {
    if(user_id !== ''){
      getMyRSOs();
    }
  }, [user_id]);

  //Filter RSOs the user is an admin of
  useEffect(() => {
    checkIfAdmin();
    get_RSO_ids();
    getActiveRSOs();
  }, [myRSOs])

  useEffect(() => {
    getActiveRSOs();
  }, [adminRSOs])

  //Get public events
  useEffect(() => {
    getPublicEvents();
  }, [])

  //get rso events
  useEffect(() => {
    if(!(rso_ids === [])){
      getRSOEvents();
    }
  }, [rso_ids])

  //const for url to localhost
  const api = Axios.create({
    baseURL: 'http://localhost:3000'
  }); 

  const get_RSO_ids = () => {
    let ids = [];
    for (let i = 0; i < myRSOs.length; i++) {
      ids.push(myRSOs[i].rso_id);
    }
    setrso_ids(ids);
  }

  const filter = (e) => {
    const input = e.target.value;
    setQuery(input);
    const newFilter = rsos.filter((value) => {
      return value.rso_name.toLowerCase().includes(input.toLowerCase());
    })
    setFiltered(newFilter);
  }

  const getRsos = async () => {
    try{
      const response = await api.post('/api/rsos', { "university_id": university_id});
      if (response.status === 200){
        //console.log("RSOS RETRIEVED")
        setRsos(response.data)
      }
      else{
        console.log("GETTING RSOS FAILED");
      }
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  const getMyRSOs = async () => {
    try{
      const response = await api.post('/api/getMyRSOs', {"user_id": user_id});

      if(response.status === 200){
        setMyRSOs(response.data);
      }

    }catch (err) {
      console.log(err);
    }
  }

  const handleCreateRSO = async () => {
    // make sure emails have same domain
    if (!checkEmails()){
      return;
    }
    try{

      const response = await api.post('api/createRSOapproval', 
        {"name": NRname, "university_id": university_id, "admin": NRadmin, "mem1": NRmem1, "mem2": NRmem2, "mem3": NRmem3}
      );

      if(response.status === 200){
        console.log("Sent approval request");
        setFlagRSOCreated(true);
      }

    }catch (error) {
      console.log("Error:", error);
    }
  }

  function checkEmails(){
    const str1 = getEmailTag(NRadmin);
    const str2 = getEmailTag(NRmem1);
    const str3 = getEmailTag(NRmem2);
    const str4 = getEmailTag(NRmem3);
    if (str1 === str2 && str1 === str3 && str1 === str4){
      return true;
    }
    return false;
  }

  function getEmailTag(email) {
    const atIndex = email.indexOf('@');
    if (atIndex !== -1) {
      return email.substring(atIndex + 1);
    }
    return null;
  }

  const switchPrivate = () => {
    setfilter_private(true);
    setfilter_public(false);
    setRSO(false);
  }

  const switchPublic = () => {
    setfilter_private(false);
    setfilter_public(true);
    setRSO(false);
  }

  const switchRSO = () => {
    setfilter_private(false);
    setfilter_public(false);
    setRSO(true);
  }

  const closeCreateRSOModal = () => {
    setIsOpenRSO(!isOpenRSO);
    setFlagRSOCreated(false);
    setNRname('');
    setNRadmin('');
    setNRmem1('');
    setNRmem2('');
    setNRmem3('');
  }

  const clickMyRSO = (rso) => {
    setIsOpenMyRSO(!isOpenMyRSO);
    setCurrRSO(rso);
  }

  const leaveRSO = async () => {
    const admin = currRSO.admin_id.toString();
    if( admin === user_id){
      setFlagAdminLeave(true);
      return;
    }
    try{
      const response = await api.post('/api/leaveRSO', {"user_id": user_id, "rso_id": currRSO.rso_id.toString()});
      if(response.status === 200){
        console.log(response.data);
        setYouLeft(true);
        removeLeftRSO();
      }
    }catch (err) {
      console.log(err);
    }
  }

  function removeLeftRSO() {
    const newRSOs = myRSOs.filter(rso => rso.rso_id !== currRSO.rso_id);
    setMyRSOs(newRSOs);
  }

  const joinRSO = async () => {
    const newRSOs = myRSOs.filter(rso => rso.rso_id === currRSO.rso_id);
    if(newRSOs.length !== 0){
      setAlreadyIn(!alreadyIn);
      return;
    }

    try {
      const response = await api.post("/api/joinRSO", {"user_id": user_id, "rso_id": currRSO.rso_id});
      if(response.status === 200){
        setJoinedRSO(true);
        getMyRSOs();
      }
    }catch (err) {
      console.log(err);
    }
  }

  const checkIfAdmin = () => {
    for(let i = 0; i < myRSOs.length; i++){
      if(myRSOs[i].admin_id.toString() === user_id){
        //console.log("FOUND ONE");
        setIsAdmin(true);
        setAdminRSOs(adminRSOs.concat(myRSOs[i]));
      }
    }
  }

  function Map(props) {
    const [center, setCenter] = useState({ lat: 28.6016, lng: -81.2005 });
    const [searchValue, setSearchValue] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [marker, setMarker] = useState(null);
    const autocompleteRef = useRef(null);
  
    const { eventLocation, setEventLocation } = props;
    const { eventCords, setEventCords } = props;
    const { eventLocName, setEventLocName } = props;
  
    const handleSelect = useCallback((place) => {
      console.log(place);
      setSearchValue(place.formatted_address);
      setSelectedAddress(place.formatted_address);
      setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
  
      setEventLocation(place.formatted_address);
      setEventCords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      setEventLocName(place.name);
  
      // Remove previous marker, if any
      if (marker) {
        setMarker(null);
      }
  
      // Place a marker on the selected location
      const newMarker = {
        position: place.geometry.location,
        title: place.formatted_address
      };
      setMarker(newMarker);
    }, [marker]);
  
    const onLoad = useCallback((autocomplete) => {
      autocompleteRef.current = autocomplete;
      autocomplete.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        handleSelect(place);
      });
    }, [handleSelect]);
  
    return (
      <div style={{ height: "200px" }}>
        <Autocomplete onLoad={onLoad}>
          <input
            type="text"
            placeholder="Enter a location"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: "96%" }}
          />
        </Autocomplete>
        {/* <GoogleMap
          mapContainerStyle={{ height: "75%", width: "75%", marginLeft: "75px" }}
          center={center}
          zoom={15}
        >
          {marker && <Marker key={marker.title} {...marker} />}
        </GoogleMap> */}
        { (eventLocName != '') ? <p>{eventLocName}</p> : null}
        { (eventLocation != '') ? <p>Address: {eventLocation}</p> : null}
        { (eventCords.lat != 0) ? <p>Latitude: {eventCords.lat} Longitude: {eventCords.lng}</p> : null}
      </div>
    );
}

  const handleCreatePublicEvent = async () => {
    try{
      const response = await api.post('/api/CreatePublicEvent', 
      {"name": eventName, "category": eventCategory, "description": eventDesc, "date": eventDate, "time": eventTime, "location": eventLocation, "lat": eventCords.lat, "lng": eventCords.lng, "conPhone": eventConPhone, "conEmail": eventConEmail, "user_id": user_id}
      );

      if(response.status === 200){
        console.log(response.data);
        setCPEsuccess(true);
      }
      else{
        setCPEfail(true);
      }

    }catch (err) {
      console.log("Error:", err);
      setCPEfail(true);
    }
  }

  const resetCPEvals = () => {
    setEventName('');
    setEventCategory('');
    setEventDesc('');
    setEventLocation('');
    setEventDate();
    setEventTime();
    setEventCords({ lat: 0, lng: 0 });
    setEventConPhone('');
    setEventConEmail('');
  }

  const getPublicEvents = async () => {
    try{
      const response = await api.post("/api/getPublicEvents", {})
      if(response.status === 200){
        setPublicEvents(response.data);
      }
    }catch(err){
      console.log(err);
    }
  }

  const getPrivateEvents = async () => {
    try{
      const response = await api.post("/api/getPrivateEvents", {"university_id": university_id});
      if(response.status === 200){
        setPrivateEvents(response.data);
      }
    }catch(err){
      console.log(err);
    }
  }

  const getRSOEvents = async () => {
    try{
      const response = await api.post("/api/getRSOEvents", {"ids": rso_ids});
      if(response.status === 200){
        setRsoEvents(response.data);
      }
    }catch(err){
      console.log(err);
    }
  }

  const handleCreateRSOEvent = async () => {
    try{
      const response = await api.post('/api/CreateRSOEvent', 
      {"name": eventName, "category": eventCategory, "description": eventDesc, "date": eventDate, "time": eventTime, "location": eventLocation, "lat": eventCords.lat, "lng": eventCords.lng, "conPhone": eventConPhone, "conEmail": eventConEmail, "user_id": user_id, "rso_id": selectedRSO}
      );

      if(response.status === 200){
        console.log(response.data);
        setCREsuccess(true);
      }
      else{
        setCREfail(true);
      }
    }catch(err){
      console.log("Error:", err);
      setCREfail(true);
    }
  }

  function Comments(props) {
    const [ comment, setComment ] = useState('');
    const [ comments, setComments ] = useState([]);
    const [ myComments, setMyComments ] = useState([]);
    const [ editComId, setEditComId ] = useState();
    const [ commentEdit, setCommentEdit ] = useState('');

    //Flags
    const [ deleted, setDeleted ] = useState(false);

    useEffect(()=>{
      getComments();
    }, [])

    useEffect(()=>{
      if(comments.length != 0){
        filterMyComments();
      }
    }, [comments])

    const filterMyComments = () => {
      const filteredComments = comments.filter((com) => com.user_id.toString() === props.userID);
      setMyComments(filteredComments);
    }

    const getComments = async () => {
      try{
        const response = await api.post('/api/getComments', {"event_id": props.eventID})
        if(response.status === 200){
          setComments(response.data);
        }
      }catch(err){
        console.log(err);
      }
    }

    const handleSubmit = async () => {
      try{
        const response = await api.post('/api/postComment', {"user_id": props.userID, "event_id": props.eventID, "comment": comment})
        if(response.status === 200){
          getComments();
          setComment('');
        }
      }catch(err){
        console.log(err);
      }
    }

    const deleteComment = async (comment_id) => {
      try{
        const response = await api.post('/api/deleteComment', {"comment_id": comment_id})
        if(response.status === 200){
          setDeleted(true);
          const del = comments.filter(comment => comment.comment_id !== comment_id);
          const delMy = myComments.filter(comment => comment.comment_id !== comment_id);
          setComments(del);
          setMyComments(delMy);
        }
      }catch(err){
        console.log(err);
      }
    }
    
    const editComment = async (comment_id) => {
      try{
        const response = await api.post('/api/editComment', {"comment_id": comment_id, "comment": commentEdit});
        if(response.status === 200){
          getComments();
          filterMyComments();
          setEditComId('');
        }
      }catch(err){
        console.log(err);
      }
    }

    return(
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: '10px', paddingRight: '10px'}}>
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)} style={{width: '400px', outline: 'none'}} placeholder='Write a comment'/>
          <SendIcon style={{paddingLeft: '10px', paddingTop: '5px', cursor: 'pointer'}} onClick={handleSubmit}/>
        </div>
        
        <div className='comments'>
          {comments.map((com, index) => {
            return(
              <div key={index}>
                <p>{com.comment}</p>
              </div>
            );
          })}
        </div>

        <p>My comments</p>
        <div>
        {myComments.map((com, index) => {
            return(
              <div style={{display: 'flex', flexDirection: 'column', marginBottom: '20px'}}>
                <div key={index} className='mycomments'>
                  <p style={{paddingLeft: '10px'}}>{com.comment}</p>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <EditIcon onClick={() => setEditComId(com.comment_id)} style={{paddingRight: '10px', cursor: 'pointer'}}/>
                    <DeleteIcon onClick={() => deleteComment(com.comment_id)} style={{paddingRight: '10px', cursor: 'pointer'}}/> 
                  </div>
                </div>
                {(editComId === com.comment_id) ? 
                  <div className='edit_comment'>
                    <input style={{outline: 'none', width: '450px'}} value={commentEdit} onChange={(e) => setCommentEdit(e.target.value)}/>
                    <SaveIcon onClick={() => editComment(editComId)} style={{paddingRight: '10px', cursor: 'pointer'}}/>
                  </div>
                  : 
                  null
                }
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  const ratingChanged = async (newRating, eventId) => {
    try{
      const response = await api.post('/api/rate', {"user_id": user_id, "event_id": eventId, "stars": newRating})
    }catch(err){
      console.log(err);
    }
  };

  async function getRating(event_id){
    if(event_id === null){
      return "N/A";
    }

    try{
      const response = await api.post('/api/getRating', {"event_id": event_id});
      if(response.status === 200){
        if(response.data[0].avg_rating === null){
          return "N/A";
        }
        return response.data[0].avg_rating.toString();
      }
    }catch(err){
      console.log(err);
    }
    return "N/A";
  }

  const checkActivity = async (rso_id) => {
    try{
      const response = await api.post('/api/checkActivity', {"rso_id": rso_id});
      if(response.data.length >= 5){
        console.log(response.data);
        return true;
      }
      else{
        return false;
      }
    }catch(err){
      console.log(err);
    }
    return false;
  }

  const getActiveRSOs = async () => {
    console.log("GETTING ACTIVE RSOS");
    if (activeRSO.length === 0) {
      for (const element of adminRSOs) {
        if (await checkActivity(element.rso_id)) {
          setActiveRSO(activeRSO.concat(element));
        }
      }
    }
  }


  return (
    <div className='main'>
      <MapLoader googleMapsApiKey={key} libraries={["places"]}/>
      <div className='main_sidebar'>

        <div className='main_rso_search'>
          <input type='text' value={query} onChange={filter} placeholder='Find an RSO' style={{ outline: 'none', fontSize:' 15px', height: '5px', width: '200px', borderTopRightRadius: '0px', borderBottomRightRadius: '0px'}}/>
          <Search style={{fontSize: '36px', padding: '0.5px', backgroundColor: 'white', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', cursor: 'pointer'}}/>
        </div>

        <div className='main_rsos'>
          { (query === '') ?
            <div>
              {rsos.map((rso, index) => (
                <p key={index} onClick={() => {setIsOpenRSOSearch(!isOpenRSOSearch); setCurrRSO(rso)}} className='main_rsos_en'>{rso.rso_name}</p>
              ))}
            </div>
          : 
            <div>
              {filtered.map((rso, index) => (
                <p onClick={() => {setIsOpenRSOSearch(!isOpenRSOSearch); setCurrRSO(rso)}} key={index} className='main_rsos_en'>{rso.rso_name}</p>
              ))}
            </div>
          }
        </div>

        <div className='main_rsos_joined'>
          <p style={{paddingLeft: '10px', fontWeight: 'bold'}}>My RSO's</p>
          {myRSOs.map((rso, index) => (
            <p key={index} onClick={() => clickMyRSO(rso)} className='main_rsos_joined_en'>{rso.rso_name}</p>
          ))}
        </div>
        
        {/* Buttons to create new events or RSOs */}
        <p onClick={() => setIsOpenRSO(!isOpenRSO)} className='main_sidebar_p'>Create New RSO</p>
        <p onClick={() => setIsOpenPublic(!isOpenPublic)} className='main_sidebar_p'>Create Public Event</p>
        { isAdmin ? <p onClick={() => setIsOpenCreateRSOEvent(!isOpenCreateRSOEvent)} className='main_sidebar_p'>Create RSO Event</p> : null}

      </div>

      <div style={{display:'flex', flexDirection:'column', width: '156vh'}}>
        {/* Filter Buttons */}
        <div className='main_filters'>
          { filter_private ? <div className='main_filters_selected'>Private</div> : <div className='main_filters_notsel' onClick={switchPrivate}>Private</div>}
          { filter_public ? <div className='main_filters_selected'>Public</div> : <div className='main_filters_notsel' onClick={switchPublic}>Public</div>}
          { RSO ? <div className='main_filters_selected'>RSO</div> : <div className='main_filters_notsel' onClick={switchRSO}>RSO</div>}
        </div>

        {/* Display events */}
        { filter_public ? 
          <div style={{width: '156vh', height: '90vh', overflow: 'hidden', overflowY: 'auto', marginBottom: '20px'}}>
            {publicEvents.map((event, index) => {
              return(
                <div className='main_event' key={index}>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <p>{event.event_name}</p>
                    <p>|</p>
                    <p style={{color: '#e2d4b7'}}>{event.category}</p>
                  </div>
                  <p style={{width: '400px'}}>{event.description}</p>
                  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '20px'}}>
                    <CalendarMonthIcon/>
                    <p>{event.date.slice(0,10)}</p>
                    <p>|</p>
                    <AccessTimeIcon style={{marginLeft: '20px'}}/>
                    <p>{event.new_time.slice(0,5)}</p>
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <p style={{backgroundColor: '#CADBC8', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', textAlign: 'center'}} onClick={() => {setIsOpenComments(!isOpenComments); setCurrEvent(event.event_id);}}>Comments</p>
                  <p>Rate This Event</p>
                  <div style={{marginLeft: '25px'}}>
                    <ReactStars
                      count={5}
                      onChange={(newRating) => ratingChanged(newRating, event.event_id)}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </div>
                  {!(event.avg_rating === null) ? <p>Event Rating: {event.avg_rating}</p> : <p>Event Rating: N/A</p>}
                </div>

                <div style={{display: 'flex', flexDirection: 'column', marginRight: '20px', marginBottom: '20px', alignItems:'center'}}>
                  <p>{event.location_name}</p>
                  <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude},${event.longitude}&zoom=16&size=400x200&markers=color:red%7C${event.latitude},${event.longitude}&key=${key}`} alt="Map with marker" />
                </div>
              </div>
              );
            })}
          </div>
          :
          null
        }

        { filter_private ? 
          <div style={{width: '156vh', height: '90vh', overflow: 'hidden', overflowY: 'auto', marginBottom: '20px'}}>
            {privateEvents.map((event, index) => (
              <div className='main_event' key={index}>
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <p>{event.event_name}</p>
                    <p>|</p>
                    <p style={{color: '#e2d4b7'}}>{event.category}</p>
                  </div>
                  <p style={{width: '400px'}}>{event.description}</p>
                  <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '20px'}}>
                    <CalendarMonthIcon/>
                    <p>{event.date.slice(0,10)}</p>
                    <p>|</p>
                    <AccessTimeIcon style={{marginLeft: '20px'}}/>
                    <p>{event.new_time.slice(0,5)}</p>
                  </div>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <p style={{backgroundColor: '#CADBC8', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', textAlign: 'center'}} onClick={() => {setIsOpenComments(!isOpenComments); setCurrEvent(event.event_id);}}>Comments</p>
                  <p>Rate This Event</p>
                  <div style={{marginLeft: '25px'}}>
                    <ReactStars
                      count={5}
                      onChange={(newRating) => ratingChanged(newRating, event.event_id)}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </div>
                  {!(event.avg_rating === null) ? <p>Event Rating: {event.avg_rating}</p> : <p>Event Rating: N/A</p>}
                </div>

                <div style={{display: 'flex', flexDirection: 'column', marginRight: '20px', marginBottom: '20px', alignItems:'center'}}>
                  <p>{event.location_name}</p>
                  <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude},${event.longitude}&zoom=16&size=400x200&markers=color:red%7C${event.latitude},${event.longitude}&key=${key}`} alt="Map with marker" />
                </div>
              </div>
            ))}
          </div>
          :
          null
        }

        { RSO ? 
          <div style={{width: '156vh', height: '90vh', overflow: 'hidden', overflowY: 'auto', marginBottom: '20px'}}>
          {rsoEvents.map((event, index) => (
            <div className='main_event' key={index}>
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <p style={{fontSize: '20px'}}>{myRSOs.find(rso => rso.rso_id === event.rso_id)?.rso_name}</p>
                <div style={{display: 'flex', flexDirection: 'row'}}>
                  <p>{event.event_name}</p>
                  <p>|</p>
                  <p style={{color: '#e2d4b7'}}>{event.category}</p>
                </div>
                <p style={{width: '400px'}}>{event.description}</p>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '20px'}}>
                  <CalendarMonthIcon/>
                  <p>{event.date.slice(0,10)}</p>
                  <p>|</p>
                  <AccessTimeIcon style={{marginLeft: '20px'}}/>
                  <p>{event.new_time.slice(0,5)}</p>
                </div>
              </div>

                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                  <p style={{backgroundColor: '#CADBC8', borderRadius: '10px', padding: '0.5rem', cursor: 'pointer', textAlign: 'center'}} onClick={() => {setIsOpenComments(!isOpenComments); setCurrEvent(event.event_id);}}>Comments</p>
                  <p>Rate This Event</p>
                  <div style={{marginLeft: '25px'}}>
                    <ReactStars
                      count={5}
                      onChange={(newRating) => ratingChanged(newRating, event.event_id)}
                      size={24}
                      activeColor="#ffd700"
                    />
                  </div>
                  {!(event.avg_rating === null) ? <p>Event Rating: {event.avg_rating}</p> : <p>Event Rating: N/A</p>}
                </div>

              <div style={{display: 'flex', flexDirection: 'column', marginRight: '20px', marginBottom: '20px', alignItems:'center'}}>
                <p>{event.location_name}</p>
                <img src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude},${event.longitude}&zoom=16&size=400x200&markers=color:red%7C${event.latitude},${event.longitude}&key=${key}`} alt="Map with marker" />
              </div>
            </div>
          ))}
        </div> 
          : 
          null
        }

      </div>

      {/* Popup for creating RSO */}
      <ReactModal isOpen={isOpenRSO} style={{
        content: {
          width: '50%',
          height: '83%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <p style={{fontSize: '20px'}}>Create an RSO</p>
          <CloseIcon style={{cursor: 'pointer', position: 'absolute', right: '0', paddingRight: '20px'}} onClick={closeCreateRSOModal}/>
        </div>
        <p style={{position:'absolute', top: '0', marginTop: '70px', marginLeft: '170px'}}>All four members must have the same email domain.</p>
        
        <div style={{display: 'flex', flexDirection: 'column', paddingTop: '20px'}}>
          <label>Name of RSO</label>
          <input style={{outline: 'none'}} type='text' value={NRname} onChange={(e) => setNRname(e.target.value)} />
          <label>Admin email</label>
          <input style={{outline: 'none'}} type='text' value={NRadmin} onChange={(e) => setNRadmin(e.target.value)} />
          <label>Member 1 email</label>
          <input style={{outline: 'none'}} type='text' value={NRmem1} onChange={(e) => setNRmem1(e.target.value)} />
          <label>Member 2 email</label>
          <input style={{outline: 'none'}} type='text' value={NRmem2} onChange={(e) => setNRmem2(e.target.value)} />
          <label>Member 3 email</label>
          <input style={{outline: 'none'}} type='text' value={NRmem3} onChange={(e) => setNRmem3(e.target.value)} />
        </div>

        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
          { !checkEmails() ? <p style={{color: 'red'}}>All emails must have the same domain</p> : null}
          {/* Button to Create RSO */}
          <p onClick={handleCreateRSO} style={{backgroundColor: '#CADBC8', borderRadius: '10px', width: '120px', padding: '7px', textAlign: 'center', cursor:'pointer'}} >Create RSO</p>
          { flagRSOCreated ? <p>Request sent to superadmin</p> : null}
        </div>

      </ReactModal>

      {/* Popup for clicking MyRSO */}
      <ReactModal isOpen={isOpenMyRSO} style={{
        content:{
          width: '20%',
          height: '25%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway'
        },
        overlay:{
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <p style={{fontSize: '30px'}}>{currRSO.rso_name}</p>
            <CloseIcon onClick={() => {setIsOpenMyRSO(!isOpenMyRSO); setFlagAdminLeave(false); setYouLeft(false);}} style={{position: 'absolute', right: '0', paddingRight: '20px', cursor: 'pointer'}}/>
          </div>
          <p onClick={leaveRSO} style={{backgroundColor: '#CADBC8', padding: '8px', borderRadius: '10px', cursor: 'pointer'}}>Leave RSO</p>
          { flagAdminLeave ? <p style={{color: 'red'}}>Admin can't leave</p> : null}
          { youLeft ? <p>You left {currRSO.rso_name}</p> : null}
        </div>
      </ReactModal>

      {/* Popup for clicking an rso in searchbar */}
      <ReactModal isOpen={isOpenRSOSearch} style={{
        content:{
          width: '20%',
          height: '25%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway'
        },
        overlay:{
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
            <p style={{fontSize: '30px'}}>{currRSO.rso_name}</p>
            <CloseIcon onClick={() => {setIsOpenRSOSearch(!isOpenRSOSearch); setAlreadyIn(false); setJoinedRSO(false);}} style={{position: 'absolute', right: '0', paddingRight: '20px', cursor: 'pointer'}}/>
          </div>
          <p onClick={joinRSO} style={{backgroundColor: '#CADBC8', padding: '8px', borderRadius: '10px', cursor: 'pointer'}}>Join RSO</p>
          { alreadyIn ? <p>You're already in {currRSO.rso_name}</p> : null}
          { joinedRSO ? <p>You joined {currRSO.rso_name}</p> : null}
        </div>
      </ReactModal>

      {/* Create Public Event Modal */}
      <ReactModal isOpen={isOpenPublic} style={{
        content: {
          width: '50%',
          height: '80%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div style={{padding: '20px'}}>

          {/* Header and close button */}
          <div style={{display: 'flex', flexDirection: 'row', justifyContent:'center'}}>
            <p style={{marginTop: '-1px', fontSize: '25px'}}>Create Public Event</p>
            <CloseIcon onClick={() => {setIsOpenPublic(!isOpenPublic); resetCPEvals();}} style={{cursor: 'pointer', position: 'absolute', right: '0', paddingRight: '20px'}}/>
          </div>

          {/* Labels and Input for info */}
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <label>Name</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} style={{outline: 'none'}}></input>
            <label>Category</label>
            <input type="text" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} style={{outline: 'none'}}></input>
            <label>Description</label>
            <input type="text" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} style={{outline: 'none'}}></input>
            <label id="time-input">Time</label>
            <input type='time' id="time-input" value={eventTime} onChange={(e) => setEventTime(e.target.value)} style={{outline: 'none'}}></input>
            <label htmlFor="date-input">Date</label>
            <input type="date" id="date-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{outline: 'none'}}></input>
            <label>Contact Phone</label>
            <input type="text" value={eventConPhone} onChange={(e) => setEventConPhone(e.target.value)} style={{outline: 'none'}}></input>
            <label>Contact Email</label>
            <input type="text" value={eventConEmail} onChange={(e) => setEventConEmail(e.target.value)} style={{outline: 'none'}}></input>
            <label>Location</label>
            <Map
                eventLocation={eventLocation} 
                setEventLocation={setEventLocation}
                eventCords={eventCords}
                setEventCords={setEventCords}
                eventLocName={eventLocName}
                setEventLocName={setEventLocName}
              />
          </div>

          {/* Button to create Event */}
          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <p onClick={handleCreatePublicEvent} style={{backgroundColor: '#CADBC8', borderRadius: '10px', width: '180px', padding: '7px', textAlign: 'center', cursor:'pointer'}}>Create Public Event</p>
            {/* Flags for createing event */}
            { CPEsuccess ? <p>Request sent to superadmin</p>: null}
            { CPEfail ? <p>Couldn't create request</p>: null}
          </div>

        </div>
      </ReactModal>

      {/* Create RSO Event Modal */}
      <ReactModal isOpen={isOpenCreateRSOEvent} style={{
        content: {
          width: '50%',
          height: '70%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div>

          <div style={{display: 'flex', flexDirection: 'row', justifyContent:'center'}}>
            <p style={{marginTop: '-1px', fontSize: '25px'}}>Create RSO Event</p>
            <CloseIcon onClick={() => {setIsOpenCreateRSOEvent(!isOpenCreateRSOEvent); resetCPEvals();}} style={{cursor: 'pointer', position: 'absolute', right: '0', paddingRight: '20px'}}/>
          </div>

          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <label style={{paddingRight: '20px'}}>Select RSO</label>
              <select onChange={(e) => {setSelectedRSO(e.target.value); console.log(selectedRSO)}} defaultValue={""}>
              <option value=""></option>
                {activeRSO.map((rso, index) => (
                  <option key={index} value={rso.rso_id}>{rso.rso_name}</option>
                ))}
              </select>
            </div>
            <label>Name</label>
            <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} style={{outline: 'none'}}></input>
            <label>Category</label>
            <input type="text" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)} style={{outline: 'none'}}></input>
            <label>Description</label>
            <input type="text" value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} style={{outline: 'none'}}></input>
            <label id="time-input">Time</label>
            <input type='time' id="time-input" value={eventTime} onChange={(e) => setEventTime(e.target.value)} style={{outline: 'none'}}></input>
            <label htmlFor="date-input">Date</label>
            <input type="date" id="date-input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={{outline: 'none'}}></input>
            <label>Contact Phone</label>
            <input type="text" value={eventConPhone} onChange={(e) => setEventConPhone(e.target.value)} style={{outline: 'none'}}></input>
            <label>Contact Email</label>
            <input type="text" value={eventConEmail} onChange={(e) => setEventConEmail(e.target.value)} style={{outline: 'none'}}></input>
            <label>Location</label>
            <Map
                eventLocation={eventLocation} 
                setEventLocation={setEventLocation}
                eventCords={eventCords}
                setEventCords={setEventCords}
                eventLocName={eventLocName}
                setEventLocName={setEventLocName}
              />
          </div>

          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <p onClick={handleCreateRSOEvent} style={{backgroundColor: '#CADBC8', borderRadius: '10px', width: '180px', padding: '7px', textAlign: 'center', cursor:'pointer'}}>Create RSO Event</p>
            { CREsuccess ? <p>RSO event created</p>: null}
            { CREfail ? <p>Couldn't create event</p>: null}
          </div>

        </div>
      </ReactModal>

      {/* Pop up for comments */}
      <ReactModal isOpen={isOpenComments} style={{
        content: {
          width: '50%',
          height: '70%',
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor : '#9c9583',
          borderColor: '#CADBC8',
          borderWidth: '5px',
          borderRadius: '10px',
          fontFamily: 'Raleway',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }
      }}>
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <CloseIcon onClick={() => setIsOpenComments(!isOpenComments)} style={{cursor: 'pointer', position: 'absolute', right: '0', paddingRight: '20px'}}/>
          <Comments eventID={currEvent} userID={user_id}/>
        </div>
      </ReactModal>

    </div>
  )
}

/*
  function Map(props) {
    const [center, setCenter] = useState({ lat: 28.6016, lng: -81.2005 });
    const [searchValue, setSearchValue] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [marker, setMarker] = useState(null);

    const { eventLocation, setEventLocation } = props;
    const { eventCords, setEventCords } = props;

    const handleSelect = useCallback((place) => {
      console.log(place);
      setSearchValue(place.formatted_address);
      setSelectedAddress(place.formatted_address);
      setCenter({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
  
      setEventLocation(place.formatted_address);
      setEventCords({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })

      // Remove previous marker, if any
      if (marker) {
        setMarker(null);
      }
  
      // Place a marker on the selected location
      const newMarker = {
        position: place.geometry.location,
        title: place.formatted_address
      };
      setMarker(newMarker);
    }, [marker]);
  
    const onLoad = useCallback((autocomplete) => {
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        handleSelect(place);
      });
    }, [handleSelect]);
  
    return (
      <div style={{ height: "400px" }}>
        <Autocomplete onLoad={onLoad}>
          <input
            type="text"
            placeholder="Enter a location"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={{ width: "96%" }}
          />
        </Autocomplete>
        <GoogleMap
          mapContainerStyle={{ height: "75%", width: "75%", marginLeft: "75px" }}
          center={center}
          zoom={15}
        >
          {marker && <Marker key={marker.title} {...marker} />}
        </GoogleMap>
    </div>
    );
  }
*/