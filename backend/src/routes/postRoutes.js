import express from 'express';
import Post from '../models/Post.js'; // Assuming you have a Post model
import authorization from '../middleware/authorization.js';

const router = express.Router();


// Get all posts with a category passed as a query parameter
router.get('/', async (req, res, next) => {
  const { category } = req.query;  // Extract 'category' from the query parameters
  console.log(`Fetching posts with category: ${category}`);
  
  try {
    // Fetch posts based on the category (optionId)
    const posts = await Post.find({ optionId: category }).sort({order: 1});
    res.json(posts);  // Send the filtered posts back as the response
  } catch (error) {
    next(error);  // Pass the error to the error-handling middleware
  }
});

// Create a new post
router.post('/', authorization, async (req, res, next) => {
  const newPost = new Post(req.body);
  const optionId = newPost.optionId;
  try {
    await Post.updateMany({ optionId }, { $inc: { order: 1 } });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});

// Delete a post by ID
router.delete('/:id', authorization, async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    
    if (deletedPost) {
      await Post.updateMany(
        { optionId: deletedPost.optionId, order: { $gt: deletedPost.order } }, // Filter to find posts with the same optionId and higher order
        { $inc: { order: -1 } } // Decrement their order by 1
      );
      
      res.status(200).json(deletedPost);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post', error });
  }
});

// Update specific fields of a post by ID (partial update)
router.patch('/:id', authorization, async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,     // The ID of the post to update
      { $set: req.body },  // Only update the fields that are passed in the body
      { new: true, runValidators: true }  // Options: return the updated document & run validation
    );

    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(updatedPost);  // Respond with the updated post
  } catch (error) {
    res.status(500).json({ message: 'Error updating post', error });
  }
});

// Add more routes as needed...

export default router; // Export the router
