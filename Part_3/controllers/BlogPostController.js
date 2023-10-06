import BlogPost from '../models/BlogPostModel.js';
import validationSchema from '../helpers/BlogPostValidation.js';
import UserBlogPost from '../models/UserBlogPost.js';

//all blog posts
export const getAllblog = async (req, res) => {
  try {
    const blogPosts = await BlogPost.find();
    res.status(200).json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//blog post by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blogPost = await BlogPost.findById(id);
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.status(200).json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

//new blog post
export const addBlog = async (req, res) => {
  try {
    // Validate the request data
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, content } = req.body;
    const author = req.params.id;

    const blogPost = new BlogPost({ title, content, author });
    await blogPost.save();

    // Create a user_blog_post entry
    const userBlogPost = new UserBlogPost({ user_id: author, blog_post_id: blogPost._id });
    await userBlogPost.save();

    res.status(201).json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Update blog post by ID
export const updateBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedBlogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.status(200).json(updatedBlogPost);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Delete blog post by ID
export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlogPost = await BlogPost.findByIdAndRemove(id);

    if (!deletedBlogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.status(200).json('successfully deleted');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
