const request = require('supertest');
const app = require('../Part_1/server');

describe('Part 2 Tests', () => {
  test('Add blog post succeeded', async () => {
    const response = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Valid Title')
    .field('description', 'Valid Description')
    .field('date_time', Math.floor(Date.now() / 1000))
    .attach('main_image', 'path-to-main-image.jpg');

  expect(response.status).toBe(200);
  expect(response.body.title).toBe('Valid Title');
  expect(response.body.description).toBe('Valid Description');
  });

  test('Add partial blog post fields', async () => {
    const response = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Invalid Title');

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    msg: 'Description is required',
    param: 'description',
    location: 'body',
  });
  });

  test('Add full blog post fields with large main_image', async () => {
    const response = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Valid Title')
    .field('description', 'Valid Description')
    .field('date_time', Math.floor(Date.now() / 1000))
    .attach('main_image', largeImage);

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    msg: 'Main image exceeded size limit of 1MB',
    param: 'main_image',
    location: 'files',
  });
  });

  test('Add full blog post fields with special characters in title', async () => {
    const response = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Invalid Title$#@')
    .field('description', 'Valid Description')
    .field('date_time', Math.floor(Date.now() / 1000))
    .attach('main_image', 'path-to-main-image.jpg');

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    msg: 'Title must not contain special characters',
    param: 'title',
    location: 'body',
  });
  });

  test('Add full blog post fields with ISO date_time', async () => {
    const response = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Valid Title')
    .field('description', 'Valid Description')
    .field('date_time', '2023-10-06T10:00:00.000Z')
    .attach('main_image', 'path-to-main-image.jpg');

  expect(response.status).toBe(400);
  expect(response.body.errors).toContainEqual({
    msg: 'Date time must be in Unix timestamp format',
    param: 'date_time',
    location: 'body',
  });
  });

  test('Add blog post then Get all blog posts successful', async () => {
    const addResponse = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Valid Title')
    .field('description', 'Valid Description')
    .field('date_time', Math.floor(Date.now() / 1000))
    .attach('main_image', 'path-to-main-image.jpg');

  // Get all blog posts
  const getResponse = await request(app).get('/api/getAllBlogPosts');

  expect(getResponse.status).toBe(200);
  expect(getResponse.body).toHaveLength(1);
  });

  test('Add blog post then Get all blog posts failed', async () => {
    const addResponse = await request(app)
    .post('/api/addBlogPost')
    .field('title', 'Invalid Title');

  // Get all blog posts
  const getResponse = await request(app).get('/api/getAllBlogPosts');

  expect(getResponse.status).toBe(200);
  expect(getResponse.body).toHaveLength(0); 
  });

  test('Get token from Generate token API and send to Get image by token API successful', async () => {
    const generateTokenResponse = await request(app)
    .post('/api/generateImageToken')
    .send({ image_path: 'path-to-your-image.jpg' });

  expect(generateTokenResponse.status).toBe(200);
  const { token } = generateTokenResponse.body;

  // Send the token to the Get image by token
  const getImageResponse = await request(app)
    .get('/api/getImageByToken')
    .query({ image_path: 'path-to-your-image.jpg', token });

  expect(getImageResponse.status).toBe(200);
  });

  test('Get token from Generate token API and send to Get image by token API failed', async () => {
    const generateTokenResponse = await request(app)
      .post('/api/generateImageToken')
      .send({ image_path: 'path-to-your-image.jpg' });

    expect(generateTokenResponse.status).toBe(200);
    const { token } = generateTokenResponse.body;

    // Send the token to the Get image
    const getImageResponse = await request(app)
      .get('/api/getImageByToken')
      .query({ image_path: 'different-image-path.jpg', token });

    expect(getImageResponse.status).toBe(403);
    expect(getImageResponse.body.error).toBe('Invalid token for this image_path');
  });
});
