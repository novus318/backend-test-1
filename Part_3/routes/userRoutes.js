import express from 'express';
import { addUser, deleteUserById, getAllUsers, getUserById, updateUserById } from '../controllers/UserController.js';


const router = express.Router();

// routes
router.get('/getAllUsers', getAllUsers);
router.get('/getUser/:id', getUserById);
router.post('/addUser', addUser);
router.patch('/updateUser/:id',updateUserById);
router.delete('/deleteUser/:id',deleteUserById);

export default router;