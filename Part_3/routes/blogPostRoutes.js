import express  from "express";
import { addBlog, deleteBlogById, getAllblog, getBlogById, updateBlogById } from "../controllers/BlogPostController.js";
const router=express.Router()

router.get('/getAllBlog',getAllblog);
router.get('/getBlog/:id',getBlogById);
router.post('/addblog/:id',addBlog);
router.patch('/updateBlog/:id',updateBlogById);
router.delete('/deleteBlog/:id',deleteBlogById);


export default router