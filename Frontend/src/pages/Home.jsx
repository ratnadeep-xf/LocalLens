import React, { useState, useContext, useEffect } from "react";
import Filters from "../components/Filters";
import ArticleCard from "../components/ArticleCard";
import { articleContext } from "../context/articleContext";
import Navbar from "../components/Navbar";
import { Flame, Clock } from "lucide-react";

const Home = () => {
  const {
    articles,
    regionAvailable,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
    popular
  } = useContext(articleContext);

  // Function to check if the date string matches the selected date
  const isSameDate = (dateStr, selectedDate) => {
    try {
      // Backend date format is dd-mm-yyyy
      const [day, month, year] = dateStr.split("-");
      const articleDate = new Date(year, month - 1, day); // month is 0-based in JS Date
      
      return (
        articleDate.getDate() === selectedDate.getDate() &&
        articleDate.getMonth() === selectedDate.getMonth() &&
        articleDate.getFullYear() === selectedDate.getFullYear()
      );
    } catch (err) {
      console.error('Error comparing dates:', err);
      return false;
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-b border-primary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Stay Connected with Your Community
            </h1>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Discover local news, engage with your community, and stay informed about
              what matters most in your neighborhood
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Filters isDashboard={false} />
        
        {/* Popular Articles Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-accent-100 rounded-lg">
              <Flame className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Popular Today</h2>
          </div>
          
          {popular.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.map((article, index) => {
                const isPopular = { value: true, rank: index + 1 };
                return (
                  <ArticleCard
                    article={article}
                    isPopular={isPopular}
                    key={article.id}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <p className="text-neutral-500">No popular articles found for the selected filters.</p>
            </div>
          )}
        </section>

        {/* Latest Articles Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
              <Clock className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Latest Articles</h2>
          </div>
          
          {(() => {
            const filteredArticles = articles
              .filter((article) => isSameDate(article.date, selectedDate))
              .filter((article) => {
                // If "all" is selected, show all articles
                if (selectedRegion.includes("all")) {
                  return true;
                }
                // Otherwise, show articles matching any selected region
                return selectedRegion.includes(article.region);
              });

            return filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredArticles.map((article) => (
                  <ArticleCard article={article} key={article.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-card">
                <p className="text-neutral-500">No articles found for the selected filters.</p>
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
};

export default Home;