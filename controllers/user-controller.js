const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const pool = require('../database/database');
const { generateTokenAndSetCookie } = require('../utils/generateTokenandSetCookie');
const saltRounds = 10;


//  const get the index page
const indexPage = asyncHandler(async(req,res) => {


    try {
        // Fetch user details
        const userId = req.user.id;
        const userImage = req.user.profileimage;
        const userName = req.user.name;

        // Fetch all posts with their likes and comments
        const query = `
        SELECT 
            p.*, 
            users.name AS owner,
            users.profileimage AS owner_image,
            COUNT(DISTINCT l.like_id) AS like_count,
            COUNT(DISTINCT c.comment_id) AS comment_count
        FROM 
            posts p
        LEFT JOIN 
            likes l ON p.post_id = l.post_id
        LEFT JOIN 
            comments c ON p.post_id = c.post_id
        LEFT JOIN 
            users ON p.user_id = users.id
        GROUP BY 
            p.post_id, users.name, users.profileimage
        ORDER BY 
            p.created_at DESC
    `;
    
        const { rows: posts } = await pool.query(query);

        // Render the index page with user details and posts
        // res.render('index', { userId, userImage, userName, posts });
        res.status(200).json({ userId, userImage, userName, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Controller for signup
const signUpUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        let profileimage = req.file ? req.file.path : null;
        const userExistingQuery = 'SELECT * FROM users WHERE email = $1';
        const existingUser = await pool.query(userExistingQuery, [email]);

        if (existingUser.rows.length > 0) {
            return res.status(401).json({ message: "User already exists" });
        }

        const insertUserQuery = `
            INSERT INTO users (name, email, password, role, profileimage, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6)
        `;

        const currentDate = new Date(); // Get current date and time
        await pool.query(insertUserQuery, [
            name,
            email,
            hashedPassword,
            role,
            profileimage,
            currentDate // Provide the current timestamp
        ]);

        res.status(200).json({ message: 'Signup Successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Controller for login
// Controller for login
const signInUser = asyncHandler(async (req, res) => {
   
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const loginQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await pool.query(loginQuery, [email]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found for the email" });
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Password or Email Did not Matched" });
        }
        generateTokenAndSetCookie(user.id, user.name, user.role,user.profileimage, res);
        res.redirect("/"); // Redirect to the root URL after successful login
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Controller for logout
const logout = asyncHandler(async (req, res) => {
    try {
        res.clearCookie('jwt'); // Clear the JWT cookie
        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = { signUpUser, signInUser, logout,indexPage };
