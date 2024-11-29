//server
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');


const app = express();

// Middleware to parse JSON and handle form data with increased limit
app.use(express.json({ limit: '10mb' })); // Increase limit to 10mb
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Increase limit to 10mb
app.use(express.static(path.join(__dirname, '.')));

// Middleware to parse JSON and handle form data

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/artistou')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    required: true 
  },
  age: { 
    type: Number 
  },
  job: { 
    type: String 
  },
  profilePic: { 
    type: String 
  }
});

const User = mongoose.model('User ', UserSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Signup Route with Password Hashing
app.post('/signup', async (req, res) => {
    try {
        const { username, password, role, job } = req.body;

        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists
        const existingUser  = await User.findOne({ username });
        if (existingUser ) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser  = new User({
            username,
            password: hashedPassword, // Store hashed password
            role,
            job: role === 'Artist' ? job : null
        });

        await newUser .save();

        res.status(201).json({
            success: true,
            message: 'User  registered successfully'
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during signup'
        });
    }
});

// Single, Comprehensive Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user (case-insensitive)
        const user = await User.findOne({ 
            username: new RegExp(`^${username}$`, 'i') 
        });

        // If no user found
        if (!user) {
            console.log(`Login attempt for non-existent user: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'User  not found'
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        // Check password match
        if (!isMatch) {
            console.log(`Invalid password attempt for user: ${username}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Determine redirect URL based on role
        let redirectUrl = '';
        switch(user.role) {
            case 'Artist':
                redirectUrl = '/artist_dashboard.html';
                break;
            case 'Visitor':
                redirectUrl = '/visitor_dashboard.html';
                break;
            default:
                redirectUrl = '/';
        }

        // Successful login
        res.json({
            success: true,
            message: 'Login successful',
            redirectUrl,
            user: {
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// Middleware to check if user is logged in (for demonstration purposes)
const isAuthenticated = (req, res, next) => {
    // Here you can implement your authentication logic
    // For a simple demonstration, we'll assume the user is always authenticated.
    // In a real application, you would check for a session or token.

    // If user is authenticated, call next()
    // Otherwise, redirect to login page or send an error
    next(); // Replace this with your actual authentication logic
};

// Protect dashboard routes
app.get('/artist_dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'artist_dashboard.html'));
});

app.get('/visitor_dashboard.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'visitor_dashboard.html'));
});



//Artwoek Schema
const artworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    artistUsername: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Artwork = mongoose.model('Artwork', artworkSchema);
module.exports = Artwork;



//Api 
app.post('/artworks', async (req, res) => {
    try {
        const { title, price, imageUrl } = req.body;
        const artistUsername = req.session.username; // Ensure this is set correctly

        console.log("Received Artwork Data:", req.body); // Log incoming data

        // Validate input
        if (!title || !price || !imageUrl || !artistUsername) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
            });
        }

        const newArtwork = new Artwork({
            title,
            price,
            imageUrl,
            artistUsername,
        });

        await newArtwork.save();

        res.status(201).json({
            success: true,
            message: 'Artwork added successfully',
            artwork: newArtwork,
        });
    } catch (error) {
        console.error('Artwork Save Error:', error); // Log the error details
        res.status(500).json({
            success: false,
            message: 'Failed to add artwork',
            errorDetails: error.message, // Include error details in the response
        });
    }
});



// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});