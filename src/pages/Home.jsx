import React, { useState, useContext } from "react";
import Filters from "../components/Filters";
import ArticleCard from "../components/ArticleCard";
import { articleContext } from "../context/articleContext";
import Navbar from "../components/Navbar";

const Home = () => {
  const {
    articles,
    regionOptions,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
  } = useContext(articleContext);

  // Function to check if the date string matches the selected date
  const isSameDate = (dateStr, selectedDate) => {
    const [day, month, year] = dateStr.split("-");
    const d = new Date(`${year}-${month}-${day}`);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };
  // Filter articles to get the top three based on engagement votes for the selected date and region

  const topThree = articles
    .filter((article) => isSameDate(article.date, selectedDate))
    .filter((article) => {
      // If "all" is selected, show all articles
      if (selectedRegion.includes("all")) {
        return true;
      }
      // Otherwise, show articles matching any selected region
      return selectedRegion.includes(article.region);
    })
    .sort((a, b) => b.engagement.votes - a.engagement.votes)
    .slice(0, 3);

  return (
    <div>
      <Navbar />
      <div className="text-3xl">Stay Connected with Your Community</div>
      <div className="text-xl">
        Discover local news, engage with your community, and stay informed about
        what matters most in your neighborhood
      </div>
      <Filters />
      <div className="Popular Articles">
        <h1>Popular Articles</h1>
        {topThree.map((article, index) => {
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
      <div className="Latest Articles">
        <h1>Latest Articles</h1>
        {articles
          .filter((article) => isSameDate(article.date, selectedDate))
          .filter((article) => {
            // If "all" is selected, show all articles
            if (selectedRegion.includes("all")) {
              return true;
            }
            // Otherwise, show articles matching any selected region
            return selectedRegion.includes(article.region);
          })
          .map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
      </div>
    </div>
  );
};

export default Home;
