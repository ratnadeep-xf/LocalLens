import React, { useState, useContext } from "react";
import { ArrowUp, ArrowDown, MessageCircle, User, Send } from "lucide-react";
import { format } from "date-fns";
import { articleContext } from "../context/articleContext";

const Engagement = ({ article }) => {
  const { userArray, articles, setArticles, loggedUserId, isUserLoggedIn } = useContext(articleContext);
  const [userVote, setUserVote] = useState(null);
  const [newComment, setnewComment] = useState("");

  // Always get the latest article from context
  const latestArticle = articles.find((a) => a.id === article.id) || article;

  const handleVote = (voteType) => {
    setArticles((prevArticles) =>
      prevArticles.map((a) => {
        if (a.id !== article.id) return a;

        let upVotes = a.engagement.upVotes;
        let downVotes = a.engagement.downVotes;

        if (userVote === voteType) {
          // Remove vote
          if (voteType === "up") upVotes -= 1;
          else downVotes -= 1;
        } else if (userVote === null) {
          // First time voting
          if (voteType === "up") upVotes += 1;
          else downVotes += 1;
        } else {
          // Switching vote
          if (voteType === "up") {
            upVotes += 1;
            downVotes -= 1;
          } else {
            upVotes -= 1;
            downVotes += 1;
          }
        }
        return {
          ...a,
          engagement: { ...a.engagement, upVotes, downVotes },
        };
      })
    );
    setUserVote(userVote === voteType ? null : voteType);
  };

  const handleClick = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        commentId: Date.now(),
        userId: loggedUserId,
        content: newComment.trim(),
        createdAt: new Date(),
      };
      setArticles((prevArticles) =>
        prevArticles.map((a) =>
          a.id === article.id
            ? {
                ...a,
                engagement: {
                  ...a.engagement,
                  commentsArray: [...a.engagement.commentsArray, newCommentObj],
                },
              }
            : a
        )
      );
      setnewComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Voting Section */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Rate this article</h3>
        {isUserLoggedIn ? (
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <button
                onClick={() => handleVote("up")}
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                  userVote === "up"
                    ? "bg-green-500 border-green-500 text-white shadow-lg"
                    : "border-green-500 text-green-500 hover:bg-green-50 hover:shadow-md"
                }`}
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
                className={`flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-200 ${
                  userVote === "down"
                    ? "bg-accent-500 border-accent-500 text-white shadow-lg"
                    : "border-accent-500 text-accent-500 hover:bg-accent-50 hover:shadow-md"
                }`}
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
                        {format(comment.createdAt, "MMM d, h:mm a")}
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
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Send className="w-4 h-4" />
                  Post Comment
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