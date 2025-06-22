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

  // Demo comments data
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Left section - Article Content (majority width - 70%) */}
            <div className="flex-1 max-w-[70%]">
              <ArticleContent article={article} />
            </div>

            {/* Right section - Engagement (minority width - 30%) */}
            <div className="w-[30%] flex-shrink-0">
              <Engagement article={article} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
