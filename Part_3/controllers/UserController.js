import User from '../models/UserModel.js';
import UserBlogPost from '../models/UserBlogPost.js';
import { hashPassword } from '../helpers/authhelpers.js';
import jwt from 'jsonwebtoken'
//all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a new user
export const addUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '4h',
    });

    res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Bad Request' });
  }
};

// Update user by ID
export const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;
    const hashedPassword = await hashPassword(password);
    const user = await User.findByIdAndUpdate(
      id,
      { username, email, password:hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Bad Request' });
  }
};

// Delete user by ID
export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove user blog posts
    await UserBlogPost.deleteMany({ user_id: id });
    
    res.status(200).json('User deleted Successfully');
  } catch (error) {
    res.status(400).json({ error: 'Bad Request' });
  }
};

