const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller.js');
const authenticateToken = require('../middleware/authenticateToken.js');

router.post('/login', userController.loginUser);
router.post('/register', userController.register);

// router.get('/test-cron-api', userController.testCron);


router.use(authenticateToken);
// router.get('/user/:id/edit', userController.getsingleUser);
// router.get('/users', userController.getAllUsers);
// router.put('/user/:id/update', userController.updateUser);
// router.delete('/user/:id/delete', userController.deleteUser);


module.exports = router;