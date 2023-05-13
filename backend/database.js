const express = require('express');
const mysql = require('mysql2');
const cors = require("cors");
const path = require('path');

// Create an express app
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static(path.join(__dirname, 'build')));


// Set up a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "groot",
  database: "event_app",
});

const db = pool.promise();

app.post("/api/register", async (req, res) => {
  const email = req.body.email;
  const pass = req.body.password;
  const level = req.body.level;
  console.log("Registering with [" + email + ", " + pass + ", " + level + "]");

  try{

    const result = await db.query(
      "INSERT INTO users (email, password, user_level) VALUES (?, ?, ?)", 
      [email, pass, level]
    );

    console.log(result);
    res.status(200).send("User inserted successfully");

  }catch (err) {
    console.log(err);
    res.status(500).send("Error registering user");
  }
});

app.post('/api/login', async (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    console.log("LOGGING IN WITH [" + email + ", " + pass + "]");

    try{
      const [rows, fields] = await db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, pass]
      );

      if(rows.length > 0){
        console.log(rows);
        res.status(200).send(rows[0].user_level + ", " + rows[0].university_id + ", " + rows[0].user_id);
      }
      else{
        res.status(401).send("Invalid email or password");
      }
  } catch (err) {
      console.log(err);
      res.status(500).send("Error with login query");
    }
});

app.get('/api/users', async (req, res) => {
  console.log("GETTING USERS");
  try {
    const [rows, fields] = await db.query("SELECT * FROM users");
    console.log(rows);
    res.status(200).send(rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error retrieving users");
  }
});

app.get('/api/unis', async (req, res) => {
  try{
    const [rows, fields] = await db.query("SELECT * FROM universities");
    //console.log(rows);
    res.status(200).send(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error searching");
  }
});

app.post('/api/rsos', async (req, res) => {
  const uni_id = req.body.university_id;

  try{
    const [rows, fields] = await db.query(
      "SELECT * FROM rso WHERE university_id = ?",
      [uni_id]
    );

    //console.log(rows);      
  
    if(rows.length === 0){
      console.log("NO RSOS FOUND");
    }
    if(rows.length > 0){
      res.status(200).send(rows);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error getting RSOS");
  }
});

app.post('/api/updateUniId', async (req, res) => {
  const user_id = req.body.user_id;
  const university_id = req.body.university_id;

  try {
    const [rows, fields] = await db.query(
      "UPDATE users SET university_id = ? WHERE user_id = ?",
      [university_id, user_id]
    );

    if (rows.affectedRows > 0) {
      res.status(200).send("University ID updated successfully");
    } else {
      res.status(404).send("User not found");
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send("Error updating university ID");
  }
});

app.post('/api/createUni', async (req, res) => {
  const name = req.body.name;
  const location = req.body.location;
  const description = req.body.description;
  const numStudents = req.body.numStudents;
  //console.log("USING [",name, ", ", location, ", ", description, ", ", numStudents, "]");

  try {

    const result = await db.query(
      "INSERT INTO universities (name, location, description, num_students) VALUES (?, ?, ?, ?)",
      [name, location, description, numStudents]
    );

    res.status(200).send(result[0].insertId.toString());

  }catch (error) {
    console.log(error);
    res.status(500).send("Error creating university");
  }
});

app.post('/api/createRSOapproval', async (req, res) => {
  const name = req.body.name;
  const admin = req.body.admin;
  const mem1 = req.body.mem1;
  const mem2 = req.body.mem2;
  const mem3 = req.body.mem3;
  const uni_id = req.body.university_id;

  try{
    const result = await db.query(
      "INSERT INTO approval_rso (name, university_id, admin_email, mem1_email, mem2_email, mem3_email) VALUES (?, ?, ?, ?, ?, ?)", 
      [name, uni_id, admin, mem1, mem2, mem3]
    );

    res.status(200).json({ success: true, message: "RSO created successfully" });

  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ success: false, message: "RSO creation failed" });
  }
});

app.post('/api/getApprovalRso', async (req, res) => {
  const uni_id = req.body.university_id;

  try{
    const [rows, fields] = await db.query(
      "SELECT * FROM approval_rso WHERE university_id = ?",
      [uni_id]
    );

    if(rows.length === 0){
      console.log("NO APPROVAL RSOS FOUND");
      res.status(200).send([]);
    }
    if(rows.length > 0){
      res.status(200).send(rows);
    }

  } catch (error) {
    console.log(err);
    res.status(500).send("Error getting approval RSOS");
  }
});

app.post('/api/rejectRSO', async (req, res) => {
  const approval_id = req.body.approval_id;

  try{
    const result = await db.query('DELETE FROM approval_rso WHERE approval_id = ?', [approval_id])
    res.status(200).json({ message: `Approval with ID ${approval_id} has been rejected and deleted` });
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getAdminId', async (req, res) => {
  const email = req.body.email;
  try{
    const [rows, fields] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    
    if(rows.length > 0){
      res.status(200).send(rows);
    }
    else{
      res.status(201).send("No users found");
    }

  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/api/createRSO', async (req, res) => {
  const adminId = req.body.adminId;
  const uniId = req.body.uniId;
  const name = req.body.name;

  try{
    const result = await db.query("INSERT INTO rso (rso_name, admin_id, university_id) VALUES (?, ?, ?)", 
      [name, adminId, uniId]
    );

    res.status(200).send(result[0].insertId.toString());

  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/api/add4members', async (req, res) => {
  const rso_id = req.body.rso_id;
  const admin_id = req.body.admin_id;
  const mem1_id = req.body.mem1_id;
  const mem2_id = req.body.mem2_id;
  const mem3_id = req.body.mem3_id;

  try{
    const result = await db.query("INSERT INTO members (user_id, rso_id) VALUES (?,?), (?,?), (?,?), (?,?)",
      [admin_id, rso_id, mem1_id, rso_id, mem2_id, rso_id, mem3_id, rso_id]
    );

    res.status(200).json({ success: true, message: "Members added" });

  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }

});

app.post('/api/getMyRSOs', async (req,res) => {
  const user_id = req.body.user_id;

  try { 
    const result = await db.query("SELECT r.rso_id, r.rso_name, r.admin_id, r.university_id FROM rso r JOIN members m ON r.rso_id = m.rso_id WHERE m.user_id = ?", 
      [user_id]
    );

    res.status(200).send(result[0]);

  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/api/leaveRSO', async (req, res) => {
  const user_id = req.body.user_id;
  const rso_id = req.body.rso_id;

  try{
    const result = await db.query('DELETE FROM members WHERE user_id = ? AND rso_id = ?', [user_id, rso_id]);
    console.log(result);
    res.status(200).send("Left RSO");
  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/api/joinRSO', async (req, res) => {
  const user_id = req.body.user_id;
  const rso_id = req.body.rso_id;

  try {
    const result = await db.query("INSERT INTO members (user_id, rso_id) VALUES (?, ?)", [user_id, rso_id]);

    console.log(result);
    res.status(200).send("JOINED");

  }catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
});

app.post('/api/CreatePublicEvent', async (req, res) => {
  const name = req.body.name;
  const category = req.body.category;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const formattedTime = `${time}:00`;
  const location = req.body.location;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const conPhone = req.body.conPhone;
  const conEmail = req.body.conEmail;
  const user_id = req.body.user_id;

  const sql = "INSERT INTO events (event_name, category, description, new_time, date, location_name, latitude, longitude, contact_phone, contact_email, is_public, is_rso, rso_id, user_id, approved_by_superadmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [name, category, description, formattedTime, date, location, lat, lng, conPhone, conEmail, true, false, null, user_id, false];

  try {
    // Insert new event into the database
    const result = await db.query(sql, values);

    res.status(200).json({ success: true, message: 'Event created successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

app.post('/api/CreatePrivateEvent', async (req, res) => {
  const name = req.body.name;
  const category = req.body.category;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const formattedTime = `${time}:00`;
  const location = req.body.location;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const conPhone = req.body.conPhone;
  const conEmail = req.body.conEmail;
  const user_id = req.body.user_id;

  const sql = "INSERT INTO events (event_name, category, description, new_time, date, location_name, latitude, longitude, contact_phone, contact_email, is_public, is_rso, rso_id, user_id, approved_by_superadmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [name, category, description, formattedTime, date, location, lat, lng, conPhone, conEmail, false, false, null, user_id, true];

  try{
    const result = await db.query(sql, values);
    res.status(200).json({ success: true, message: 'Event created successfully!' });
  }catch(err){
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

app.post('/api/CreateRSOEvent', async (req, res) => {
  const rso_id = req.body.rso_id;
  const name = req.body.name;
  const category = req.body.category;
  const description = req.body.description;
  const date = req.body.date;
  const time = req.body.time;
  const formattedTime = `${time}:00`;
  const location = req.body.location;
  const lat = req.body.lat;
  const lng = req.body.lng;
  const conPhone = req.body.conPhone;
  const conEmail = req.body.conEmail;
  const user_id = req.body.user_id;

  const sql ="INSERT INTO events (event_name, category, description, new_time, date, location_name, latitude, longitude, contact_phone, contact_email, is_public, is_rso, rso_id, user_id, approved_by_superadmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [name, category, description, formattedTime, date, location, lat, lng, conPhone, conEmail, false, true, rso_id, user_id, true];

  try{
    const result = await db.query(sql, values);
    res.status(200).json({ success: true, message: 'Event created successfully!' });
  }catch(err){
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
});

app.post('/api/getEventsForApproval', async (req, res) => {
  const university_id = req.body.university_id;

  const sql = "SELECT * FROM events WHERE approved_by_superadmin = ? AND user_id IN ( SELECT user_id FROM users WHERE university_id = ? )";
  const values = [false, university_id];

  try{
    const [rows, fields] = await db.query(sql, values);

    res.status(200).send(rows);

  }catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed grab events for approval.' });
  }

});

app.post('/api/rejectEvent', async (req, res) => {
  const event_id = req.body.event_id;

  const sql = "DELETE FROM events WHERE event_id = ?";
  const values = [event_id];

  try{
    const result = db.query(sql, values);
    res.status(200).json({ message: `Event has been rejected and deleted` });
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/approveEvent', async (req, res) => {
  const event_id = req.body.event_id;

  const sql = "UPDATE events SET approved_by_superadmin = true WHERE event_id = ?;";
  const values = [event_id];

  try{
    const result = db.query(sql, values);
    res.status(200).json({ message: `Event has been approved` });
  }catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getPublicEvents', async (req, res) => {
  const sql = "SELECT * FROM events WHERE is_public = ? AND approved_by_superadmin = ?";
  const values = [1, 1];

  try{
    const [rows, fields] = await db.query(sql, values);
    res.status(200).send(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getPrivateEvents', async (req, res) => {
  const university_id = req.body.university_id;

  const sql = "SELECT * FROM events WHERE is_public = ? AND is_rso = ? AND approved_by_superadmin = ? AND user_id IN (SELECT user_id FROM users WHERE university_id = ? AND user_level = ?)";
  const values = [0, 0, 1, university_id, "superadmin"];

  try{
    const [rows, fields] = await db.query(sql, values);
    res.status(200).send(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getRSOEvents', async (req, res) => {
  const ids = req.body.ids;

  if (ids.length == 0){
    return;
  }

  const sql = "SELECT * FROM events WHERE is_rso = ? AND rso_id IN (" + ids.map(() => '?').join(',') + ")";
  const values = [1, ...ids];

  try{
    const [rows, fields] = await db.query(sql, values);
    res.status(200).send(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/postComment', async (req, res) => {
  const event_id = req.body.event_id;
  const user_id = req.body.user_id;
  const comment = req.body.comment;

  const sql = "INSERT INTO comments (user_id, event_id, comment) VALUES (?, ?, ?)";
  const values = [user_id, event_id, comment];

  try{
    const result = await db.query(sql, values);
    res.status(200).send(result);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getComments', async (req, res) => {
  const event_id = req.body.event_id;

  const sql = "SELECT * FROM comments WHERE event_id = ?";
  const values = [event_id];

  try{
    const [rows, fields] = await db.query(sql, values);
    res.status(200).send(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/deleteComment', async (req, res) => {
  const comment_id = req.body.comment_id;
  const sql = "DELETE FROM comments WHERE comment_id = ?";
  const values = [comment_id];

  try{
    const result = await db.query(sql, values);
    res.status(200).json({message: 'Comment deleted'})
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/editComment', async (req, res) => {
  const comment_id = req.body.comment_id;
  const comment = req.body.comment;

  const sql = "UPDATE comments SET comment = ? WHERE comment_id = ?";
  const values = [comment, comment_id];

  try{
    const result = await db.query(sql, values);
    res.status(200).json({message: 'Edited comment'});
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/rate', async (req,res) => {
  const stars = req.body.stars;
  const user_id = req.body.user_id;
  const event_id = req.body.event_id;

  const sql = "INSERT INTO comments (user_id, event_id, rating) VALUES (?, ?, ?)";
  const values = [user_id, event_id, stars];

  try{
    const result = await db.query(sql, values);
    res.status(200).json({message: 'Event rated'});
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/getRating', async (req,res) => {
  const event_id = req.body.event_id;

  const sql = "SELECT AVG(rating) AS avg_rating FROM comments WHERE event_id = ? AND comment IS NULL";
  const values = [event_id];

  try{
    const result = await db.query(sql, values);
    res.status(200).send(result[0]);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/checkActivity', async (req, res) => {
  const rso_id = req.body.rso_id;

  const sql = "SELECT * FROM members WHERE rso_id = ?";
  const values = [rso_id];

  try{
    const [rows, fields] = await db.query(sql, values);
    res.status(200).send(rows);
  }catch(err){
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));


/*

*/