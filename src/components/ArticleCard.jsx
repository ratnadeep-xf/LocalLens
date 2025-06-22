import React from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

const ArticleCard = ({ article, isPopular = { value: false, rank: 0 } }) => {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="relative overflow-hidden rounded-lg bg-slate-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage: article.img
              ? `url(${article.img})`
              : "url(/default-background.png)",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative p-6">
          {/* Popular Badge */}
          {isPopular.value && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium mb-4">
              #{isPopular.rank} Popular
            </div>
          )}
          <h2 className="text-white text-xl font-bold leading-tight mb-6">
            {article.title}
          </h2>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-white px-6 py-4 rounded-b-lg border border-t-0 border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-600 font-medium">{article.publisher}</span>
          <span className="text-gray-500 text-sm">{article.region}</span>
        </div>

        {/* Engagement Metrics */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span className="font-semibold">{article.engagement.votes}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600">
            <MessageCircle className="w-4 h-4" />
            <span className="font-semibold">{article.engagement.comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
