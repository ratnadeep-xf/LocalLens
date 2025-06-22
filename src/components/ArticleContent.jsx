import React from "react";
import { Calendar } from "lucide-react";
import { format, parse } from "date-fns";

const ArticleContent = ({ article }) => {
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Featured Image */}
      <div className="w-full h-64 md:h-80 lg:h-96">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="p-6 md:p-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="font-medium text-blue-600">{article.agency}</span>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(
                  parse(article.date, "dd-MM-yyyy", new Date()),
                  "dd/MM/yyyy"
                )}
              </span>
            </div>
          </div>
          <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
            {article.region}
          </span>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-gray-700 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ArticleContent;
