import React from "react";
import { Calendar, MapPin, Building2 } from "lucide-react";
import { format, parse } from "date-fns";

const ArticleContent = ({ article }) => {
  return (
    <article className="bg-white rounded-xl shadow-card overflow-hidden">
      {/* Featured Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 relative overflow-hidden">
        <img
          src={article.image || article.img}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Article Content */}
      <div className="p-6 md:p-8">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 text-primary-600">
            <Building2 className="h-4 w-4" />
            <span className="font-semibold">{article.agency || article.publisher}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <Calendar className="h-4 w-4" />
            <span>
              {format(
                parse(article.date, "dd-MM-yyyy", new Date()),
                "dd/MM/yyyy"
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-neutral-600">
            <MapPin className="h-4 w-4" />
            <span className="bg-neutral-100 px-3 py-1 rounded-full text-sm font-medium">
              {article.region}
            </span>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-neutral-700 leading-relaxed mb-6 text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
};

export default ArticleContent;