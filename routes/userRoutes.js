const express = require('express');
const app = express();

const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');


router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.get('/me',authController.protect, userController.getMe, userController.getParticularUser);
router.patch('/updateMe', authController.protect, userController.updateMe)
router.delete('/deleteMe', authController.protect, userController.deleteMe)


router.route('/').get(userController.getAllUsers).post(userController.addNewUser);
router.route('/:id').get(userController.getParticularUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router;