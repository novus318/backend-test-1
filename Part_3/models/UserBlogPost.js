import mongoose from 'mongoose';

const userBlogPostSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blog_post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
});

const UserBlogPost = mongoose.model('UserBlogPost', userBlogPostSchema);

export default UserBlogPost;
