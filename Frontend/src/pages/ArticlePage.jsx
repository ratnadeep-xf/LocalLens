import React, { useContext, useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ArticleContent from "../components/ArticleContent";
import Engagement from "../components/Engagement";
import { useLocation, useParams } from "react-router-dom";
import { articleContext } from "../context/articleContext";
import { ARTICLE_ENDPOINTS, apiCall } from "../utils/api";
import socket from "../utils/socket";

const ArticlePage = () => {
  const location = useLocation();
  const { id } = useParams();
  const { articles } = useContext(articleContext);
  const [fetchedArticle, setFetchedArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const articleFromNav =
    location.state?.article ||
    articles.find((a) => String(a.id) === String(id));

  const article = articleFromNav || fetchedArticle;

  useEffect(() => {
    if (!id) {
      return;
    }

    socket.emit("join:article", id);

    return () => {
      socket.emit("leave:article", id);
    };
  }, [id]);

  useEffect(() => {
    if (articleFromNav || !id) {
      return;
    }

    let cancelled = false;

    const fetchArticle = async () => {
      setIsLoading(true);
      setNotFound(false);
      setFetchedArticle(null);

      try {
        const data = await apiCall(ARTICLE_ENDPOINTS.getById(id));
        if (!cancelled) {
          setFetchedArticle(data);
        }
      } catch (error) {
        if (!cancelled) {
          setNotFound(true);
        }
        console.error("Error fetching article:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchArticle();

    return () => {
      cancelled = true;
    };
  }, [id, articleFromNav]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !article && (
          <div className="text-center py-16 text-neutral-600">
            Loading article...
          </div>
        )}

        {notFound && !article && !isLoading && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              Article not found
            </h2>
            <p className="text-neutral-600">
              The article you are looking for does not exist or may have been
              removed.
            </p>
          </div>
        )}

        {article && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left section - Article Content (majority width - 70%) */}
            <div className="lg:col-span-2">
              <ArticleContent article={article} />
            </div>

            {/* Right section - Engagement (minority width - 30%) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Engagement article={article} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
