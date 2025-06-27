const express = require('express');
const router = express.Router();
const { Article } = require('../models');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Base path: /api/articles

// Get all articles with optional filters
router.get('/', async (req, res) => {
  try {
    const { region, date } = req.query;
    let query = {};

    console.log('Query params:', { region, date });

    // Only add region filter if it's defined and not 'all'
    if (region && region !== 'all' && region !== 'undefined') {
      query.region = region;
    }
    if (date) {
      query.date = date;
    }

    console.log('MongoDB query:', query);

    const articles = await Article.find(query)
      .sort({ createdAt: -1 });

    console.log('Found articles:', articles.length);

    // Transform the response to match frontend expectations
    const transformedArticles = articles.map(article => ({
      id: article._id,
      title: article.title,
      content: article.content,
      img: article.img,
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

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('publisher', 'agencyName');
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Transform the response to match frontend expectations
    const transformedArticle = {
      id: article._id,
      title: article.title,
      content: article.content,
      img: article.img,
      region: article.region,
      date: article.formattedDate,
      publisher: article.publisherName,
      engagement: article.engagement
    };

    res.json(transformedArticle);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
});

// Create article (Publisher only)
router.post('/', auth.isPublisher, async (req, res) => {
  try {
    const { title, content, img, region } = req.body;

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

    // Check for duplicate article by this publisher
    const existingArticle = await Article.findOne({
      publisher: req.publisher._id,
      title: title.trim()
    });

    if (existingArticle) {
      return res.status(400).json({
        message: 'You have already published an article with this title'
      });
    }

    // Create article
    const article = new Article({
      title: title.trim(),
      content: content.trim(),
      img: img || '/default-image.png',
      region: region.trim(),
      date: new Date().toLocaleDateString('en-GB').split('/').join('-'), // dd-mm-yyyy
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
      img: savedArticle.img,
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
    // Check for duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'You have already published an article with this title'
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
      img: article.img,
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
      img: article.img,
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