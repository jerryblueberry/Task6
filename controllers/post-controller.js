const asyncHandler = require('express-async-handler');
const pool = require('../database/database')


const createPost = asyncHandler(async(req,res) => {
    try {
        const {title}  = req.body;
        const userId = req.user.id;
        const created_at = new Date();

        const images = req.files? req.files.map((file) => file.path):null

        const insertQuery = `INSERT INTO posts (user_id,title,images,created_at) VALUES ($1,$2,$3,$4)`;
        await pool.query(insertQuery,[userId,title,images,created_at]);
        res.status(200).json({message:"Post created Successfully"});
    } catch (error) {
        res.status(500).json({error:error.message});
    }
});


//  get all posts 

const getAllPosts = asyncHandler(async(req,res) => {

    try {
        // const query = `SELECT * FROM posts ORDER BY created_at DESC`;
        const query = `SELECT posts.post_id,posts.title,posts.images,posts.created_at,users.name FROM posts JOIN users ON posts.user_id = users.id ORDER BY created_at DESC` ;
        const {rows} = await pool.query(query);
        if(rows.length ===0){
            return res.status(401).json({error:"Rows not found"});
        }
        return res.status(200).json({posts:rows})
        // res.render("index",{posts:rows})
    } catch (error) {
       res.status(500).json({error:error.message}); 
    }
})

// get specific post
const getPostDetails = asyncHandler(async (req, res) => {
    try {
        const  postId = req.params.postId;

        // SQL query to retrieve post details
        const query = `
            SELECT 
                posts.post_id,
                posts.title,
                posts.images,
                posts.created_at,
                users.name AS owner_name,
                users.profileimage AS owner_image,
                COUNT(DISTINCT likes.user_id) AS like_count,
                json_agg(json_build_object('comment_id', comments.comment_id, 'comment_content', comment, 'comment_owner', comment_users.name, 'comment_owner_image', comment_users.profileimage)) AS comments
            FROM 
                posts
            JOIN 
                users ON posts.user_id = users.id
            LEFT JOIN 
                likes ON posts.post_id = likes.post_id
            LEFT JOIN 
                comments ON posts.post_id = comments.post_id
            LEFT JOIN 
                users AS comment_users ON comments.user_id = comment_users.id
            WHERE 
                posts.post_id = $1
            GROUP BY 
                posts.post_id, users.name, users.profileimage`;

        const { rows } = await pool.query(query, [postId]);

        // Check if the post exists
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Return the post details
        res.status(200).json({ post: rows[0] });
        // res.render('postDetail',{post:rows[0]});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports  = {createPost,getAllPosts,getPostDetails};