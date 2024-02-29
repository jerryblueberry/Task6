const express = require('express');
const { signUpUser, signInUser,logout, indexPage } = require('../controllers/user-controller');
const { singleUpload } = require('../middleware/uploadMiddleware');
const { verifyAuth } = require('../middleware/authentication');


const router = express.Router();
router.get('/',verifyAuth,indexPage);
router.post('/signup',singleUpload,signUpUser)
router.post('/login',signInUser);
router.post('/logout',logout);


module.exports = router;