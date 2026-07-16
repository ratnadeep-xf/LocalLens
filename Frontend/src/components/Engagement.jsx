import React, { useState, useContext, useEffect } from "react";
import { ArrowUp, ArrowDown, MessageCircle, User, Send } from "lucide-react";
import { format } from "date-fns";
import { articleContext } from "../context/articleContext";
import { ARTICLE_ENDPOINTS, apiCall } from "../utils/api";
import socket from "../utils/socket";

const Engagement = ({ article }) => {
  const { 
    userArray, 
    articles, 
    setArticles, 
    loggedUserId, 
    isUserLoggedIn, 
    token, 
    logout,
    loggedUser 
  } = useContext(articleContext);
  const [userVote, setUserVote] = useState(null);
  const [newComment, setnewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [commentError, setCommentError] = useState('');

  // Always get the latest article from context
  const latestArticle = articles.find((a) => a.id === article.id) || article;

  // Initialize userVote based on existing votes when component mounts
  useEffect(() => {
    if (latestArticle.engagement.votesArray) {
      const existingVote = latestArticle.engagement.votesArray.find(
        vote => vote.userId === loggedUserId
      );
      if (existingVote) {
        setUserVote(existingVote.value === 1 ? "up" : "down");
      } else {
        setUserVote(null);
      }
    }
  }, [latestArticle.engagement.votesArray, loggedUserId]);

  useEffect(() => {
    const upvoteEvent = `upvote:${article.id}`;
    const commentEvent = `comment:${article.id}`;

    const handleUpvote = ({ upVotes, downVotes }) => {
      setArticles((prevArticles) =>
        prevArticles.map((currentArticle) =>
          currentArticle.id === article.id
            ? {
                ...currentArticle,
                engagement: {
                  ...currentArticle.engagement,
                  upVotes,
                  downVotes,
                },
              }
            : currentArticle
        )
      );
    };

    const handleComment = (incomingComment) => {
      setArticles((prevArticles) =>
        prevArticles.map((currentArticle) => {
          if (currentArticle.id !== article.id) {
            return currentArticle;
          }

          const hasComment = currentArticle.engagement.commentsArray.some(
            (comment) =>
              comment.createdAt === incomingComment.createdAt &&
              comment.userId === incomingComment.userId &&
              comment.content === incomingComment.content
          );

          if (hasComment) {
            return currentArticle;
          }

          return {
            ...currentArticle,
            engagement: {
              ...currentArticle.engagement,
              commentsArray: [
                ...currentArticle.engagement.commentsArray,
                incomingComment,
              ],
            },
          };
        })
      );
    };

    socket.on(upvoteEvent, handleUpvote);
    socket.on(commentEvent, handleComment);

    return () => {
      socket.off(upvoteEvent, handleUpvote);
      socket.off(commentEvent, handleComment);
    };
  }, [article.id, setArticles]);

  const handleVote = async (value) => {
    try {
      setVoteError('');
      setIsSubmitting(true);

      if (!isUserLoggedIn) {
        setVoteError('Please log in to vote');
        return;
      }

      const voteValue = value === "up" ? 1 : -1;
      const data = await apiCall(ARTICLE_ENDPOINTS.vote(article.id), {
        method: 'POST',
        body: JSON.stringify({ value: voteValue })
      });

      // Update articles in context
      setArticles(prevArticles =>
        prevArticles.map(a =>
          a.id === article.id ? data : a
        )
      );

      // Update local user vote state
      const newVoteArray = data.engagement.votesArray;
      const userVoteEntry = newVoteArray.find(vote => vote.userId === loggedUserId);
      setUserVote(userVoteEntry ? (userVoteEntry.value === 1 ? "up" : "down") : null);

    } catch (error) {
      console.error('Error voting:', error);
      setVoteError(error.message || 'Error submitting vote');
      if (error.message.includes('Token') || error.message.includes('authentication')) {
        logout();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      setCommentError('');
      setIsSubmitting(true);

      if (!isUserLoggedIn) {
        setCommentError('Please log in to comment');
        return;
      }

      if (!newComment.trim()) {
        setCommentError('Comment cannot be empty');
        return;
      }

      const data = await apiCall(ARTICLE_ENDPOINTS.comment(article.id), {
        method: 'POST',
        body: JSON.stringify({ content: newComment.trim() })
      });

      // Update articles in context
      setArticles(prevArticles =>
        prevArticles.map(a =>
          a.id === article.id ? data : a
        )
      );

      // Clear comment input
      setnewComment("");

    } catch (error) {
      console.error('Error commenting:', error);
      setCommentError(error.message || 'Error submitting comment');
      if (error.message.includes('Token') || error.message.includes('authentication')) {
        logout();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voting Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Rate this article</h3>
        {voteError && (
          <div className="mb-4 p-3 bg-accent-50 text-accent-700 rounded-lg">
            {voteError}
          </div>
        )}
        {isUserLoggedIn && loggedUser ? (
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <button
                onClick={(e) => { e.preventDefault(); handleVote("up"); }}
                disabled={isSubmitting}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                  userVote === "up"
                    ? "bg-green-500 border-green-500 text-white shadow-lg"
                    : "border-green-500 text-green-500 hover:bg-green-50 hover:shadow-md"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ArrowUp className="h-6 w-6" />
              </button>
              <div className="mt-2">
                <div className="text-2xl font-bold text-neutral-900">
                  {latestArticle.engagement.upVotes}
                </div>
                <div className="text-sm text-neutral-500">upvotes</div>
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={(e) => { e.preventDefault(); handleVote("down"); }}
                disabled={isSubmitting}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                  userVote === "down"
                    ? "bg-accent-500 border-accent-500 text-white shadow-lg"
                    : "border-accent-500 text-accent-500 hover:bg-accent-50 hover:shadow-md"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <ArrowDown className="h-6 w-6" />
              </button>
              <div className="mt-2">
                <div className="text-2xl font-bold text-neutral-900">
                  {latestArticle.engagement.downVotes}
                </div>
                <div className="text-sm text-neutral-500">downvotes</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded-lg">
            <p className="text-neutral-500">Please log in as a reader to vote on this article.</p>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <MessageCircle className="h-5 w-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-neutral-900">Comments</h3>
          <span className="bg-primary-100 text-primary-700 text-sm font-medium px-2 py-1 rounded-full">
            {latestArticle.engagement.commentsArray.length}
          </span>
        </div>

        {/* Comment Form */}
        {isUserLoggedIn && loggedUser ? (
          <form onSubmit={handleComment} className="mb-6">
            {commentError && (
              <div className="mb-4 p-3 bg-accent-50 text-accent-700 rounded-lg">
                {commentError}
              </div>
            )}
            <div className="flex space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-grow">
                <div className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setnewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 min-h-[100px]"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-200 ${
                      newComment.trim() && !isSubmitting
                        ? "bg-primary-500 text-white hover:bg-primary-600"
                        : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-8 bg-neutral-50 rounded-lg mb-6">
            <p className="text-neutral-500">Please log in as a reader to comment on this article.</p>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {latestArticle.engagement.commentsArray.length > 0 ? (
            [...latestArticle.engagement.commentsArray]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((comment, index) => (
              <div
                key={`${comment.userId}-${comment.createdAt}-${index}`}
                className="border-b border-neutral-100 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-neutral-900">
                        {comment.userName || "Anonymous User"}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-neutral-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Engagement;