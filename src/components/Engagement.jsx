import React, { useState, useContext, useEffect } from "react";
import { ArrowUp, ArrowDown, MessageCircle, User, Send } from "lucide-react";
import { format } from "date-fns";
import { articleContext } from "../context/articleContext";

const Engagement = ({ article }) => {
  const { userArray, articles, setArticles, loggedUserId, isUserLoggedIn, token } = useContext(articleContext);
  const [userVote, setUserVote] = useState(null);
  const [newComment, setnewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      }
    }
  }, [latestArticle.engagement.votesArray, loggedUserId]);

  const handleVote = async (voteType) => {
    if (!isUserLoggedIn) return;
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/articles/${article.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          value: voteType === "up" ? 1 : -1
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cast vote');
      }

      const updatedArticle = await response.json();

      // Update articles in context
      setArticles(prevArticles =>
        prevArticles.map(a =>
          a.id === article.id ? updatedArticle : a
        )
      );

      // Update local user vote state
      const newVoteArray = updatedArticle.engagement.votesArray;
      const userVoteEntry = newVoteArray.find(vote => vote.userId === loggedUserId);
      setUserVote(userVoteEntry ? (userVoteEntry.value === 1 ? "up" : "down") : null);

    } catch (err) {
      setError(err.message);
      console.error('Error casting vote:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = async () => {
    if (!isUserLoggedIn || !newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/articles/${article.id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post comment');
      }

      const updatedArticle = await response.json();

      // Update articles in context
      setArticles(prevArticles =>
        prevArticles.map(a =>
          a.id === article.id ? updatedArticle : a
        )
      );

      // Clear comment input
      setnewComment("");

    } catch (err) {
      setError(err.message);
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voting Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Rate this article</h3>
        {error && (
          <div className="mb-4 p-3 bg-accent-50 text-accent-700 rounded-lg">
            {error}
          </div>
        )}
        {isUserLoggedIn ? (
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <button
                onClick={() => handleVote("up")}
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
                onClick={() => handleVote("down")}
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
            <p className="text-neutral-500">Please log in to vote on this article.</p>
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

        <div className="space-y-4 mb-6">
          {latestArticle.engagement.commentsArray.length > 0 ? (
            latestArticle.engagement.commentsArray.map((comment) => (
              <div
                key={comment.commentId}
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
                        {(() => {
                          const user = userArray.find(
                            (u) => u.userId === comment.userId
                          );
                          return user ? user.name : "Anonymous User";
                        })()}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-neutral-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>

        {/* Add Comment Input */}
        <div className="border-t border-neutral-100 pt-6">
          {isUserLoggedIn ? (
            <div className="space-y-3">
              {error && (
                <div className="p-3 bg-accent-50 text-accent-700 rounded-lg">
                  {error}
                </div>
              )}
              <textarea
                placeholder="Share your thoughts on this article..."
                value={newComment}
                className="w-full p-4 border border-neutral-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                rows="3"
                onChange={(e) => {
                  setnewComment(e.target.value);
                }}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleClick}
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-neutral-50 rounded-lg">
              <p className="text-neutral-500">Please log in to add a comment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Engagement;