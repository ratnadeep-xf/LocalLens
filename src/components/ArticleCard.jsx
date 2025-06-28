import React, { useState, useContext, useEffect } from "react";
import { ArrowUp, ArrowDown, MessageCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { articleContext } from "../context/articleContext";

const ArticleCard = ({
  article,
  isPopular = { value: false, rank: 0 },
  isDashboard = false,
}) => {
  const navigate = useNavigate();
  const { modal, setmodal, deleteArticle, setdeleteArticle, setArticles, token } = useContext(articleContext);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClick = () => {
    // Handle click event, e.g., navigate to article details page
    console.log(`Navigating to article: ${article.title}`);
    navigate(`/article/${article.id}`, { state: { article } });
  };

  const togglemodal = () => {
    setmodal(!modal);
    setError(null); // Clear any previous errors when toggling modal
  };

  useEffect(() => {
    if (deleteArticle && !isDeleting) {
      handleDelete();
    }
  }, [deleteArticle]);

  const handleDelete = async () => {
    if (!token) {
      setError("Authentication required");
      setdeleteArticle(false);
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete article');
      }

      // Remove article from state after successful deletion
      setArticles((prevArticles) =>
        prevArticles.filter((a) => a.id !== article.id)
      );
      
      setError(null);
    } catch (err) {
      console.error('Error deleting article:', err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
      setdeleteArticle(false);
    }
  };

  return (
    <div className="group">
      <div
        className="relative overflow-hidden rounded-xl bg-white shadow-card hover:shadow-card-hover cursor-pointer transition-all duration-300 hover:-translate-y-1"
        onClick={handleClick}
        role="button"
        tabIndex={0}
      >
        {/* Background Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={article.img || article.imageUrl || "/default-background.png"}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Popular Badge */}
          {isPopular.value && (
            <div className="absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full bg-accent-500 text-white text-sm font-semibold shadow-lg">
              #{isPopular.rank} Popular
            </div>
          )}

          {/* Delete Button for Dashboard */}
          {isDashboard && (
            <button
              className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-500 text-white hover:bg-accent-600 transition-colors duration-200 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                togglemodal();
              }}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-white text-xl font-bold leading-tight line-clamp-2">
              {article.title}
            </h2>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-primary-600 font-semibold text-sm">
              {article.publisher}
            </span>
            <span className="text-neutral-500 text-sm bg-neutral-100 px-2 py-1 rounded-full">
              {article.region}
            </span>
          </div>

          {/* Engagement Metrics */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <ArrowUp className="w-4 h-4" />
              <span className="font-semibold">
                {article.engagement.upVotes}
              </span>
            </div>
            <div className="flex items-center gap-1 text-accent-600">
              <ArrowDown className="w-4 h-4" />
              <span className="font-semibold">
                {article.engagement.downVotes}
              </span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold">
                {article.engagement.comments}
              </span>
            </div>
          </div>
        </div>
      </div>
      {modal && <DeleteModal error={error} isDeleting={isDeleting} />}
    </div>
  );
};

export default ArticleCard;
