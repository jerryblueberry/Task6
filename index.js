const express = require('express');
const path = require('path');
const cors = require('cors');
const {verifyAuth} = require('./middleware/authentication')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const pool = require('./database/database');
//  for the routes import 
const user = require('./routes/user-routes');
const post = require('./routes/post-routes');
const like = require('./routes/like-routes');
const comment = require('./routes/comment-routes');

const app = express();

app.use(cors());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    secret: 'MXIUuw6u5Ty0Ecih3XCjZ1+0575N2OTu0x9gsOl6pBc=',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if using HTTPS
}));
require('dotenv').config();
// app.use("/files", express.static(path.join(__dirname, "files")));
app.use("/files", express.static(path.join(__dirname, "files")));


const PORT = 8000;

//  for the routes setup
app.use('/',user);
app.use('/',post);
app.use('/',like);
app.use('/',comment);



// app.get('/',verifyAuth,(req,res) => {
   
//    const userId = req.user.id;
//    const userImage = req.user.profileimage
//    const userName = req.user.name;
    
//     res.render('index',{userId,userImage,userName});
// })
app.get('/', verifyAuth, async (req, res) => {
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
        res.render('index', { userId, userImage, userName, posts });
        // res.status(200).json({ userId, userImage, userName, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//  signup page
app.get('/signup',(req,res) => {
    res.render('signup');
});

// login page
app.get('/login',(req,res) => {
    res.render('login')
})

// for logout



app.listen(PORT,() => {
    console.log(`Listening on Port ${PORT}`)
})