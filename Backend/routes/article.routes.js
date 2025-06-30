const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const { verifyToken } = require('../middleware/auth');
const upload = require('../middleware/multer.middleware');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const mongoose = require('mongoose');

// Base path: /api/articles

// Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 });

    console.log('Found articles:', articles.length);

    // Transform the response to match frontend expectations
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      region: article.region,
      date: article.formattedDate,
      publisher: article.publisherName,
      engagement: article.engagement
    }));

    console.log('Transformed articles:', transformedArticles.length);
    res.json(transformedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Error fetching articles', error: error.message });
  }
});

// Create article (Publisher only)
router.post('/', [verifyToken, upload.single('image')], async (req, res) => {
  try {
    // Check if user is a publisher
    if (req.role !== 'publisher') {
      return res.status(403).json({ message: 'Access denied. Publishers only.' });
    }

    console.log('Request body:', req.body);
    console.log('File details:', req.file);
    
    // Get form data
    const title = req.body.title;
    const content = req.body.content;
    const region = req.body.region;

    // Validate required fields
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }
    if (!region?.trim()) {
      return res.status(400).json({ message: 'Region is required' });
    }

    // Validate field lengths
    if (title.length > 100) {
      return res.status(400).json({ message: 'Title should be less than 100 characters' });
    }
    if (content.length < 50) {
      return res.status(400).json({ message: 'Content should be at least 50 characters long' });
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
      console.log('Uploading file to Cloudinary:', req.file.path);
      const cloudinaryUrl = await uploadOnCloudinary(req.file.path);
      console.log('Cloudinary upload result:', cloudinaryUrl);
      if (cloudinaryUrl) {
        imageUrl = cloudinaryUrl;
      }
    } else {
      console.log('No file was uploaded');
    }

    // Create article
    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      region: region.trim(),
      imageUrl,
      date: new Date().toISOString().split('T')[0].split('-').reverse().join('-'),
      publisher: req.publisher._id,
      publisherName: req.publisher.agencyName,
      engagement: {
        upVotes: 0,
        downVotes: 0,
        comments: 0,
        votesArray: [],
        commentsArray: []
      }
    });

    console.log('Article to be saved:', article);

    // Save article
    const savedArticle = await article.save();
    if (!savedArticle) {
      throw new Error('Failed to save article');
    }

    console.log('Saved article:', savedArticle);

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: savedArticle._id,
      title: savedArticle.title,
      content: savedArticle.content,
      imageUrl: savedArticle.imageUrl,
      region: savedArticle.region,
      date: savedArticle.formattedDate,
      publisher: savedArticle.publisherName,
      engagement: savedArticle.engagement
    };

    res.status(201).json(transformedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        error: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
});

// Delete article (Publisher only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is a publisher
    if (req.role !== 'publisher') {
      return res.status(403).json({ message: 'Access denied. Publishers only.' });
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid article ID format' });
    }

    console.log('Delete request for article ID:', req.params.id);

    // First find the article to verify ownership
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Delete only if article exists and matches the exact ID
    const result = await Article.deleteOne({
      _id: req.params.id
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
});

// Add/Update vote (User only)
router.post('/:id/vote', verifyToken, async (req, res) => {
  try {
    // Check if user is a reader
    if (req.role !== 'reader') {
      return res.status(403).json({ message: 'Access denied. Readers only.' });
    }

    const { value } = req.body; // 1 for upvote, -1 for downvote
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find existing vote index
    const existingVoteIndex = article.engagement.votesArray.findIndex(
      vote => vote.userId.toString() === req.user._id.toString()
    );

    if (existingVoteIndex !== -1) {
      // If same vote type, remove the vote
      if (article.engagement.votesArray[existingVoteIndex].value === value) {
        article.engagement.votesArray.splice(existingVoteIndex, 1);
      } else {
        // If different vote type, update the vote
        article.engagement.votesArray[existingVoteIndex].value = value;
        article.engagement.votesArray[existingVoteIndex].createdAt = new Date();
      }
    } else {
      // Add new vote
      article.engagement.votesArray.push({
        userId: req.user._id,
        value,
        createdAt: new Date()
      });
    }

    await article.save();

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      region: article.region,
      date: article.formattedDate,
      publisher: article.publisherName,
      engagement: article.engagement
    };

    res.json(transformedArticle);
  } catch (error) {
    console.error('Error updating vote:', error);
    res.status(500).json({ message: 'Error updating vote', error: error.message });
  }
});

// Add comment (User only)
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    // Check if user is a reader
    if (req.role !== 'reader') {
      return res.status(403).json({ message: 'Access denied. Readers only.' });
    }

    const { content } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Add new comment
    article.engagement.commentsArray.push({
      userId: req.user._id,
      userName: req.user.name,
      content,
      createdAt: new Date()
    });

    await article.save();

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      region: article.region,
      date: article.formattedDate,
      publisher: article.publisherName,
      engagement: article.engagement
    };

    res.json(transformedArticle);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

module.exports = router; 