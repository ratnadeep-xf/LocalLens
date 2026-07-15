const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title should be less than 100 characters'],
    index: false // Explicitly disable indexing
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content should be at least 50 characters long']
  },
  imageUrl: {
    type: String
  },
  region: {
    type: String,
    required: [true, 'Region is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        // Validate dd-mm-yyyy format
        return /^\d{2}-\d{2}-\d{4}$/.test(v);
      },
      message: props => `${props.value} is not a valid date format! Use dd-mm-yyyy`
    }
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
      userName: {
        type: String,
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

articleSchema.index({ region: 1 });
articleSchema.index({ date: 1 });
articleSchema.index({ publisher: 1 });
articleSchema.index({ date: 1, _id: -1 });

// Virtual for formatted date
articleSchema.virtual('formattedDate').get(function() {
  return this.date; // Already in dd-mm-yyyy format
});

// Virtual for base64 image
// articleSchema.virtual('imageUrl').get(function() {
//   if (this.image && this.image.data && this.image.contentType) {
//     return `data:${this.image.contentType};base64,${this.image.data.toString('base64')}`;
//   }
//   return '/default-image.png';
// });

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

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 