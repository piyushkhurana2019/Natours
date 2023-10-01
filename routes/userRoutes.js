const express = require('express');
// const app = express();
const multer = require('multer');

const router = express.Router();
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

const upload = multer({ dest: 'public/img/users' })

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgotPassword',authController.forgotPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.use(authController.protect); // This statement will automatically get run before the lower statements as middlewares run sequentially, so we dont need to seperately write auth.protect in front of every route


router.get('/me',userController.getMe, userController.getParticularUser);
router.patch('/updateMe', upload.single('photo'), userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)


router.use(authController.restrictTo('admin')); // From this onwards only admin has the access to perform the below routes 

router.route('/').get(userController.getAllUsers).post(userController.addNewUser);
router.route('/:id').get(userController.getParticularUser).patch(userController.updateUser).delete(userController.deleteUser);


module.exports = router;