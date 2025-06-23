import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { articleContext } from "../context/articleContext";
import Filters from "../components/Filters";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const {
    articles,
    selectedRegion,
    selectedDate,
    loggedPublisher,
    loggedPublisherId,
  } = useContext(articleContext);

  const loggedPublisherName =
    loggedPublisher?.agencyName || "Unknown Publisher";

  // Filter articles for the logged-in publisher
  const filteredArticles = articles.filter((article) => {
    // Filter by publisher
    if (article.publisher !== loggedPublisherName) return false;
    // Filter by region
    if (
      selectedRegion.length &&
      !selectedRegion.includes("all") &&
      !selectedRegion.includes(article.region)
    )
      return false;
    // Filter by date (assuming article.date is a string in dd-mm-yyyy)
    const articleDate = new Date(
      article.date.split("-").reverse().join("-")
    ).setHours(0, 0, 0, 0);
    const selected = selectedDate
      ? new Date(selectedDate).setHours(0, 0, 0, 0)
      : null;
    if (selected && articleDate !== selected) return false;
    return true;
  });

  return (
    <>
      <Navbar />
      <button>
        <Link className="text-blue-500 hover:underline" to="/add-article">
          Add New Article
        </Link>
      </button>
      <Filters isDashboard={true} publisherId={loggedPublisherId} />
      <h1>Your Previous Uploads</h1>
      {filteredArticles.map((article) => (
        <ArticleCard article={article} key={article.id} isDashboard={true} />
      ))}
    </>
  );
};

export default Dashboard;
