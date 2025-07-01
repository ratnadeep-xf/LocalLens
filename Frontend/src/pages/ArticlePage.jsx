import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import ArticleContent from "../components/ArticleContent";
import Engagement from "../components/Engagement";
import { useLocation, useParams } from "react-router-dom";
import { articleContext } from "../context/articleContext";

const ArticlePage = () => {
  const location = useLocation();
  const { id } = useParams();
  const { articles } = useContext(articleContext);

  const article =
    location.state?.article ||
    articles.find((a) => String(a.id) === String(id));

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </div>
  );
};

export default ArticlePage;