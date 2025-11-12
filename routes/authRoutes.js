const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller.js');

router.post('/login', userController.loginUser);
router.post('/register', userController.register);

// router.get('/test-cron-api', userController.testCron);


module.exports = router;