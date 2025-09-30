const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
// const userController = require('../controllers/backend/UserController');
// const ProductController = require('../controllers/backend/ProductController');
// const SeminarController = require('../controllers/backend/SeminarController');
// const FrontController = require('../controllers/frontend/FrontController');

// CRUD routes for users
router.use(authenticateToken); // Include authentication middleware for the following routes

//user routes
// router.get('/profile/:id/edit', userController.edit);
// router.put('/profile/:id/update', userController.update);


//reviews routes

module.exports = router;