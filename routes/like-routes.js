const express= require('express');
const {postLike, getAllLikes} = require('../controllers/like-controller');
const { verifyAuth } = require('../middleware/authentication');
const router = express.Router();

router.post('/like',verifyAuth,postLike);
router.get('/like',verifyAuth,getAllLikes);
module.exports = router;