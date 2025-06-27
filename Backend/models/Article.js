const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title should be less than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content should be at least 50 characters long']
  },
  img: {
    type: String,
    default: undefined
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  publisher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publisher',
    required: [true, 'Publisher is required']
  },
  publisherName: {
    type: String,
    required: [true, 'Publisher name is required']
  },
  engagement: {
    upVotes: {
      type: Number,
      default: 0
    },
    downVotes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    votesArray: [{
      _id: false, // Disable automatic _id for subdocuments
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      value: {
        type: Number,
        enum: [-1, 1],
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    commentsArray: [{
      _id: false, // Disable automatic _id for subdocuments
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Virtual for formatted date
articleSchema.virtual('formattedDate').get(function() {
  const date = new Date(this.date);
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
});

// Middleware to update comment and vote counts
articleSchema.pre('save', function(next) {
  // Update comment count
  if (this.engagement.commentsArray) {
    this.engagement.comments = this.engagement.commentsArray.length;
  }

  // Update vote counts
  if (this.engagement.votesArray) {
    // Count upvotes (value: 1) and downvotes (value: -1)
    const voteCounts = this.engagement.votesArray.reduce((acc, vote) => {
      if (vote.value === 1) acc.upVotes++;
      else if (vote.value === -1) acc.downVotes++;
      return acc;
    }, { upVotes: 0, downVotes: 0 });

    // Update the counts
    this.engagement.upVotes = voteCounts.upVotes;
    this.engagement.downVotes = voteCounts.downVotes;
  }

  next();
});

// Drop all indexes and recreate them
const dropIndexes = async () => {
  try {
    await mongoose.model('Article').collection.dropIndexes();
    console.log('Successfully dropped Article indexes');
  } catch (error) {
    console.error('Error dropping Article indexes:', error);
  }
};

// Call dropIndexes when the model is compiled
articleSchema.post('compile', () => {
  dropIndexes();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 