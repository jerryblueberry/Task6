const express  = require('express');
const {postComment, getComments} = require('../controllers/comment-controller');
const { verifyAuth } = require('../middleware/authentication');

const router = express.Router();

router.post('/comment',verifyAuth,postComment);
router.get('/comment',verifyAuth,getComments);

module.exports = router;