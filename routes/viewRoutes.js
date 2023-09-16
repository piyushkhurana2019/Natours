const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', authController.protect, viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
// router.get('/me', authController.protect, viewsController.getAccount);

module.exports = router;