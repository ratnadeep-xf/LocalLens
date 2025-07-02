import React, { useState, useContext } from "react";
import { ArrowUp, ArrowDown, MessageCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import DeleteModal from "./DeleteModal";
import { articleContext } from "../context/articleContext";
import { ARTICLE_ENDPOINTS, apiCall } from "../utils/api";

const ArticleCard = ({
  article,
  isPopular = { value: false, rank: 0 },
  isDashboard = false,
}) => {
  const navigate = useNavigate();
  const { setArticles, token, isPublisherLoggedIn, removeArticle } =
    useContext(articleContext);

  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleClick = () => {
    console.log(`Navigating to article: ${article.title}`);
    navigate(`/article/${article.id}`, { state: { article } });
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    setError(null); // Clear any previous errors when toggling modal
  };

  const handleDelete = async () => {
    try {
      setDeleteError('');
      setIsDeleting(true);

      await apiCall(ARTICLE_ENDPOINTS.delete(article.id), {
        method: 'DELETE'
      });

      // Remove article from context
      removeArticle(article.id);
      toggleModal(); // Close the modal
    } catch (error) {
      console.error('Error deleting article:', error);
      setDeleteError(error.message || 'Error deleting article');
    } finally {
      setIsDeleting(false);
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
            src={article.imageUrl || "/default-background.png"}
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
          {isDashboard && isPublisherLoggedIn && (
            <button
              className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent-500 text-white hover:bg-accent-600 transition-colors duration-200 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                toggleModal();
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
              {article.region
                .split(" ")
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(" ")}
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
      {showModal && (
        <DeleteModal
          error={deleteError}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onCancel={toggleModal}
        />
      )}
    </div>
  );
};

export default ArticleCard;
