import React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Axios from 'axios';
import ReactModal from 'react-modal';
import CloseIcon from '@mui/icons-material/Close';

import { GoogleMap, useJsApiLoader , Marker, Autocomplete } from "@react-google-maps/api";

//Google Maps API Initalization.
const key = "AIzaSyBIGfq7XEV_K8z-HOVyK229-Ezj1cdRn20";
const libraries = ["places"];
const MapLoader = () => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: key,
    libraries,
  });

  return !isLoaded ? <div>Loading...</div> : null;
};

export const SuperAdminMain = () => {
    const location = useLocation();
    
    // Sent from Login.jsx
    const [ level, setLevel ] = useState('');
    const [ university_id, setuniversity_id] = useState(null);
    const [ user_id, setuser_id] = useState('');

    //Rejecting and Approving
    const [ approvalRSO, setApprovalRSO ] = useState([]);
    const [ approvalEvent, setApprovalEvent ] = useState([]);

    //Creating a Private event
    const [ isOpenPrivate, setIsOpenPrivate ] = useState(false);
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

    //Grab data sent from Login
    useEffect(() => {
        setLevel(location.state.level);
        setuniversity_id(location.state.university_id);
        setuser_id(location.state.user_id);
    }, [location]);

    useEffect(() => {
        if(university_id !== null){
            getApprovalsRso();
            getApprovalEvents();
        }
    }, [university_id]);

    //const for url to localhost
    const api = Axios.create({
        baseURL: 'http://localhost:3000'
    });

    const getApprovalsRso = async () => {
        if (university_id === null){
            console.log("CANT BE NULL");
            return;
        }

        try{
            const response = await api.post('/api/getApprovalRso', {"university_id": university_id});
            if(response.status === 200){
                setApprovalRSO(response.data);
            }
            else{
                console.log("No approval RSO requests", response.status);
            }
        }catch (error) {
            console.log("Error:", error);
        }
    }

    const rejectRSO = async (rso, index) => {
        try {
            const response = api.post('/api/rejectRSO', {"approval_id": rso.approval_id})
            if (response.status === 200){
                console.log(response.message);
            }
        }catch (err) {
            console.log(err);
        }
        approvalRSO.splice(index, 1);
        setApprovalRSO([...approvalRSO]);
    }

    const add4members = async (admin_id, mem1_id, mem2_id, mem3_id, rso_id) => {
        try{
            const response = await api.post('/api/add4members', 
                {"admin_id": admin_id, "rso_id": rso_id, "mem1_id": mem1_id, "mem2_id": mem2_id, "mem3_id": mem3_id}
            );

            if(response.status === 200){
                console.log(response.data)
            }

        }catch (err){
            console.log(err);
        }
    }

    const approveRSO = async (rso, index) => {
        console.log("HERE");
        let adminId = 0;
        let mem1Id = 0;
        let mem2Id = 0;
        let mem3Id = 0;

        try {
            const response = await api.post('/api/getAdminId', {"email": rso.admin_email});
            if(response.status === 200){
                adminId = response.data[0].user_id;
            }
        }catch (err) {
            console.log(err);
        }

        try {
            const response = await api.post('/api/getAdminId', {"email": rso.mem1_email});
            if(response.status === 200){
                mem1Id = response.data[0].user_id;
            }
        }catch (err) {
            console.log(err);
        }

        try {
            const response = await api.post('/api/getAdminId', {"email": rso.mem2_email});
            if(response.status === 200){
                mem2Id = response.data[0].user_id;
            }
        }catch (err) {
            console.log(err);
        }

        try {
            const response = await api.post('/api/getAdminId', {"email": rso.mem3_email});
            if(response.status === 200){
                mem3Id = response.data[0].user_id;
            }
        }catch (err) {
            console.log(err);
        }

        try{
            const response = await api.post('/api/createRSO', {"adminId": adminId, "uniId": university_id, "name": rso.name}); 
            if(response.status === 200){
                console.log("RSO CREATED");
                let rso_id = response.data;
                add4members(adminId, mem1Id, mem2Id, mem3Id, rso_id);
                rejectRSO(rso, index);
            }
        } catch (err) {
            console.log(err);
        }

        
    }

    const getApprovalEvents = async () => {
        try{
            const response = await api.post('/api/getEventsForApproval', {university_id: university_id});

            if(response.status === 200){
                setApprovalEvent(response.data);
            }

        }catch (err) {
            console.log("ERROR", err);
        }
    }

    const approveEvent = async (event, index) => {
        try{
            const response = await api.post('/api/approveEvent', {"event_id": event.event_id})
            if(response.status === 200){
                console.log(response.message);
            }
        }catch (err) {
            console.log(err);
        }
        approvalEvent.splice(index, 1);
        setApprovalEvent([...approvalEvent]);
    } 

    const rejectEvent = async (event, index) => {
        try{
            const response = await api.post('/api/rejectEvent', {"event_id": event.event_id})
            if (response === 200){
                console.log(response.message);
            }
        }catch (err) {
            console.log(err);
        }
        approvalEvent.splice(index, 1);
        setApprovalEvent([...approvalEvent]);
    }

    const handleCreatePrivateEvent =async (req, res) => {
        try{
            const response = await api.post('/api/CreatePrivateEvent', 
            {"name": eventName, "category": eventCategory, "description": eventDesc, "date": eventDate, "time": eventTime, "location": eventLocation, "lat": eventCords.lat, "lng": eventCords.lng, "conPhone": eventConPhone, "conEmail": eventConEmail, "user_id": user_id}
            );

            if(response.status === 200){
                console.log(response.data);
                setCPEsuccess(true);
              }
            else{
                setCPEfail(true);
            }

        }catch(err){
            console.log("Error:", err);
            setCPEfail(true);
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

  return (
    <div className='SuperAdminPage'>
        <MapLoader/>
        <div className='SuperAdminPage_con'>
            <p>Events awaiting approval</p>
            {approvalEvent.map((event, index) => (
                <div key={index} className='approval_event' style={{marginTop: '20px'}}>
                    <p>Name: {event.event_name}</p>
                    <p>Category: {event.category}</p>
                    <p>Date: {event.date.slice(0,10)}</p>
                    <p>Time: {event.new_time}</p>
                    <p>Location: {event.location_name}</p>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button onClick={()=> rejectEvent(event, index)} className='approval_rso_button'>Reject</button>
                        <button onClick={()=> approveEvent(event, index)} className='approval_rso_button'>Approve</button>
                    </div>
                </div>
            ))}
        </div>

        <div>
            <p onClick={()=> setIsOpenPrivate(!isOpenPrivate)} style={{backgroundColor: '#CADBC8', padding: '1rem', borderRadius: '10px', cursor: 'pointer'}}>Create Private Event</p>
        </div>

        <div className='SuperAdminPage_con'>
            <p>RSO's awaiting approval</p>
            {approvalRSO.map((rso, index) => (
                <div key={index} className='approval_rso'>
                    <p>Name: {rso.name}</p>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <button onClick={()=> rejectRSO(rso)} className='approval_rso_button'>Reject</button>
                        <button onClick={()=> approveRSO(rso, index)} className='approval_rso_button'>Approve</button>
                    </div>
                </div>
            ))}
        </div>

        {/* Create Private Event Modal */}
        <ReactModal isOpen={isOpenPrivate} style={{
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
            <div style={{padding: '20px'}}>

            {/* Header and close button */}
            <div style={{display: 'flex', flexDirection: 'row', justifyContent:'center'}}>
                <p style={{marginTop: '-1px', fontSize: '25px'}}>Create Private Event</p>
                <CloseIcon onClick={() => {setIsOpenPrivate(!isOpenPrivate); resetCPEvals();}} style={{cursor: 'pointer', position: 'absolute', right: '0', paddingRight: '20px'}}/>
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
                <p onClick={handleCreatePrivateEvent} style={{backgroundColor: '#CADBC8', borderRadius: '10px', width: '180px', padding: '7px', textAlign: 'center', cursor:'pointer'}}>Create Private Event</p>
                {/* Flags for createing event */}
                { CPEsuccess ? <p>Private event created</p>: null}
                { CPEfail ? <p>Couldn't create event</p>: null}
            </div>

            </div>
        </ReactModal>

    </div>
  )
}