const express = require('express');
const {createPost, getAllPosts, getPostDetails} = require('../controllers/post-controller');
const { verifyAuth } = require('../middleware/authentication');
const { multipleUpload } = require('../middleware/uploadMiddleware');
const router = express.Router();

router.post('/post',verifyAuth,multipleUpload,createPost);
router.get('/post',verifyAuth,getAllPosts)
router.get('/post/:postId',verifyAuth,getPostDetails);
module.exports = router;