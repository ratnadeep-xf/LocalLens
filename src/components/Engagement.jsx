import React, { useState, useContext } from "react";
import { ArrowUp, ArrowDown, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";
import { articleContext } from "../context/articleContext";

const Engagement = ({ article }) => {
  const { userArray, articles, setArticles } = useContext(articleContext);
  const [userVote, setUserVote] = useState(null);
  const [currentVotes, setCurrentVotes] = useState({
    upVotes: article.engagement.upVotes,
    downVotes: article.engagement.downVotes,
  });
  const [newComment, setnewComment] = useState(null);

  // Always get the latest article from context
  const latestArticle = articles.find((a) => a.id === article.id) || article;

  const handleVote = (voteType) => {
    if (userVote === voteType) {
      // User is removing their vote
      setUserVote(null);
      setCurrentVotes((prevVote) => {
        return {
          upVotes: voteType === "up" ? prevVote.upVotes - 1 : prevVote.upVotes,
          downVotes:
            voteType === "down" ? prevVote.downVotes - 1 : prevVote.downVotes,
        };
      });
    } else {
      // User is changing or adding a vote
      if (userVote === null) {
        // First time voting
        setCurrentVotes((prevVotes) =>
          voteType === "up"
            ? { upVotes: prevVotes.upVotes + 1, downVotes: prevVotes.downVotes }
            : { upVotes: prevVotes.upVotes, downVotes: prevVotes.downVotes + 1 }
        );
      } else {
        // Switching vote (up <-> down)
        setCurrentVotes((prevVotes) => {
          if (voteType === "up") {
            return {
              upVotes: prevVotes.upVotes + 1,
              downVotes: prevVotes.downVotes - 1,
            };
          } else {
            return {
              upVotes: prevVotes.upVotes - 1,
              downVotes: prevVotes.downVotes + 1,
            };
          }
        });
      }
      setUserVote(voteType);
    }
    setArticles((prevArticles) =>
      prevArticles.map((a) =>
        a.id === article.id
          ? {
              ...a,
              engagement: {
                ...a.engagement,
                upVotes: currentVotes.upVotes,
                downVotes: currentVotes.downVotes,
              },
            }
          : a
      )
    );
  };

  const handleClick = () => {
    if (newComment) {
      const newCommentObj = {
        commentId: Date.now(),
        userId: "currentUserId", // Replace with actual user ID
        content: newComment,
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
      console.log("New comment added:", newCommentObj);
      setnewComment("");
    }
  };
  return (
    <div className="space-y-6">
      {/* Voting Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Rate this article</h3>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => handleVote("up")}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
              userVote === "up"
                ? "bg-green-500 border-green-500 text-white"
                : "border-green-500 text-green-500 hover:bg-green-50"
            }`}
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {currentVotes.upVotes}
            </div>
            <div className="text-sm text-gray-500"> upVotes</div>
          </div>

          <button
            onClick={() => handleVote("down")}
            className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors ${
              userVote === "down"
                ? "bg-red-500 border-red-500 text-white"
                : "border-red-500 text-red-500 hover:bg-red-50"
            }`}
          >
            <ArrowDown className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {currentVotes.downVotes}
            </div>
            <div className="text-sm text-gray-500"> downVotes</div>
          </div>
        </div>
      </div>

      { /* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Comments</h3>
          <span className="text-sm text-gray-500">
            ({latestArticle.engagement.commentsArray.length})
          </span>
        </div>

        <div className="space-y-4">
          {latestArticle.engagement.commentsArray.map((comment) => (
            <div
              key={comment.commentId}
              className="border-b border-gray-100 pb-4 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        const user = userArray.find(
                          (u) => u.userId === comment.userId
                        );
                        return user ? user.name : "no user";
                      })()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(comment.createdAt, "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Comment Input */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <textarea
            placeholder="Add a comment..."
            value={newComment || ""} 
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="3"
            onChange={(e) => {
              setnewComment(e.target.value);
            }}
          />
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleClick}
          >
            Post Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Engagement;
