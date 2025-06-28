const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

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
      img: article.imageUrl, // Use the virtual getter
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
router.post('/', auth.isPublisher, upload.single('image'), async (req, res) => {
  try {
    const { title, content, region } = req.body;

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

    // Create article
    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      region: region.trim(),
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

    // Add image if provided
    if (req.file) {
      article.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }

    // Save article
    const savedArticle = await article.save();
    if (!savedArticle) {
      throw new Error('Failed to save article');
    }

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: savedArticle._id,
      title: savedArticle.title,
      content: savedArticle.content,
      img: savedArticle.imageUrl, // Use the virtual getter
      region: savedArticle.region,
      date: savedArticle.formattedDate,
      publisher: savedArticle.publisherName,
      engagement: savedArticle.engagement
    };

    res.status(201).json(transformedArticle);
  } catch (error) {
    console.error('Error creating article:', error);
    // Check for validation errors
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
router.delete('/:id', auth.isPublisher, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Verify publisher owns this article
    if (article.publisher.toString() !== req.publisher._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this article' });
    }

    await article.deleteOne();
    res.json({ message: 'Article deleted successfully', id: article._id });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Error deleting article', error: error.message });
  }
});

// Add/Update vote (User only)
router.post('/:id/vote', auth.isUser, async (req, res) => {
  try {
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
      img: article.imageUrl, // Use the virtual getter
      region: article.region,
      date: article.formattedDate,
      publisher: article.publisherName,
      engagement: article.engagement
    };

    res.json(transformedArticle);
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ message: 'Error processing vote', error: error.message });
  }
});

// Add comment (User only)
router.post('/:id/comment', auth.isUser, async (req, res) => {
  try {
    const { content } = req.body;
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Add new comment
    article.engagement.commentsArray.push({
      userId: req.user._id,
      content,
      createdAt: new Date()
    });

    await article.save();

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      img: article.imageUrl, // Use the virtual getter
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