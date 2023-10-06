import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import slugify from 'slugify';
import imageSize from 'image-size';
import sharp from 'sharp'
import dotenv from 'dotenv'


dotenv.config({ path: './.env' })
const app = express();
const port = 3000;

app.use(express.json());

// File upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
 //validate
const validateInputs = [
  body('title')
    .isLength({ min: 5, max: 50 })
    .isAlphanumeric()
    .withMessage('Title must be 5 to 50 alphanumeric characters'),
  body('description').isLength({ max: 500 }).withMessage('Description must be up to 500 characters'),
  body('date_time')
    .isNumeric()
    .custom((value) => value >= Math.floor(Date.now() / 1000))
    .withMessage('Invalid date_time'),
];
async function resizeAndSaveImage(inputBuffer, outputPath, maxWidth = 800, maxHeight = 800) {
  try {
    const dimensions = imageSize(inputBuffer);
    const aspectRatio = dimensions.width / dimensions.height;

    let width = dimensions.width;
    let height = dimensions.height;

    // Resize if necessary
    if (width > maxWidth || height > maxHeight) {
      if (width / maxWidth > height / maxHeight) {
        width = maxWidth;
        height = Math.round(maxWidth / aspectRatio);
      } else {
        height = maxHeight;
        width = Math.round(maxHeight * aspectRatio);
      }
    }

    const resizedImageBuffer = await sharp(inputBuffer).resize(width, height).toBuffer();
    await fs.writeFile(outputPath, resizedImageBuffer);
  } catch (error) {
    console.error('Image Resize Error:', error);
    throw error;
  }
}

async function generateNextReference() {
  try {
    const data = await fs.readFile('blogs.json', 'utf-8');
    const existingBlogData = JSON.parse(data);

    let maxReference = 0;
    existingBlogData.forEach((blogPost) => {
      const refNumber = parseInt(blogPost.reference);
      if (!isNaN(refNumber) && refNumber > maxReference) {
        maxReference = refNumber;
      }
    });
    return (maxReference + 1).toString().padStart(5, '0');
  } catch (err) {
    console.error('Error reading blogs.json:', err);
    return '00001';
  }
}

// Add post
app.post('/api/addBlogPost',upload.fields([{ name: 'main_image' }, { name: 'additional_images' }]),validateInputs,async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, date_time } = req.body;

    try {
      //Main Image
      const mainImageBuffer = req.files['main_image'][0].buffer;
      const mainImageFileName = `images/${req.files['main_image'][0].originalname}`;
      await resizeAndSaveImage(mainImageBuffer, mainImageFileName);

      //reference number
      const referenceNumber = await generateNextReference();

      // Additional Images
      const compressedAdditionalImages = [];
      for (const file of req.files['additional_images']) {
        const additionalImageBuffer = file.buffer;
        const additionalImageFileName = `images/additional_${file.originalname}`;
        await resizeAndSaveImage(additionalImageBuffer, additionalImageFileName);
        compressedAdditionalImages.push(additionalImageFileName);
      }

      const blogPost = {
        reference: referenceNumber,
        title,
        description,
        main_image: mainImageFileName,
        additional_images: compressedAdditionalImages,
        date_time,
      };

      let existingBlogData = [];
      try {
        const data = await fs.readFile('blogs.json', 'utf-8');
        existingBlogData = JSON.parse(data);
      } catch (err) {
        console.error('Error reading blogs.json:', err);
      }

      existingBlogData.push(blogPost);

      await fs.writeFile('blogs.json', JSON.stringify(existingBlogData, null, 2));

      res.json(blogPost);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

//All Blog Post
app.get('/api/getAllBlogPosts', async (req, res) => {
  try {
    const data = await fs.readFile('blogs.json', 'utf-8');
    const formattedBlogPosts = JSON.parse(data);

    formattedBlogPosts.forEach((post) => {
      post.date_time = new Date(post.date_time * 1000).toISOString();
      post.title_slug = slugify(post.title, { lower: true });
    });
    // Return
    res.json(formattedBlogPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Generate Timed Token for Images API
app.post('/api/generateImageToken', (req, res) => {
  const { image_path } = req.body;
  const secretKey = process.env.SECRET_KEY;
  const token = jwt.sign({ image_path }, secretKey, { expiresIn: '5m' });

  res.json({ token });
});

// Get Image by Token
app.get('/api/getImageByToken', (req, res) => {
  const { image_path, token } = req.query;
  const secretKey = process.env.SECRET_KEY;

  try {
    // Verify
    const decoded = jwt.verify(token, secretKey);

    if (decoded.image_path === image_path) {
      res.sendFile(__dirname + '/' + image_path);
    } else {
      res.status(403).json({ error: 'Invalid token for this image_path' });
    }
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
