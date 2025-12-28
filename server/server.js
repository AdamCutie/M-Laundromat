// 1. IMPORTS
const express = require('express'); // the main framework
const dotenv = require('dotenv');   // to read the .env file
const cors = require('cors');       // to allow the frontend to talk to this server 
const connectDB = require('./config/db'); //import the file

// 2. CONFIGURATION
dotenv.config(); //load the variables from .env (like PORT=5000)

//Connect to database
connectDB(); //run the function

// 3. INITIALIZE APP 
const app = express();

// 4. MIDDLEWARE (The Gatekeepers)
// This line allows your server to understand JSON data sent from the frontend.
// Without this, if you send { name: "John" }, the server sees 'undefined'.
app.use(cors());

// 5. TEST ROUTE 
app.get('/', (req, res) => {
    res.send('API is running.....');
});

// 6. START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});