import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { articleContext } from "../context/articleContext";
import Filters from "../components/Filters";
import ArticleCard from "../components/ArticleCard";

const Dashboard = () => {
  const loggedPublisherId = 1; // This should be dynamically set based on the logged-in publisher
  const { articles, setArticles, publisherArray } = useContext(articleContext);

  // Find the logged-in publisher's name
  const loggedPublisher = publisherArray.find(
    (publisher) => publisher.id === loggedPublisherId
  );
  const loggedPublisherName =
    loggedPublisher?.agencyName || "Unknown Publisher";

  // Filter articles for the logged-in publisher
  const [filteredArticles, setfilteredArticles] = useState(
    articles.filter((article) => article.publisher === loggedPublisherName)
  );

  return (
    <>
      <Navbar />
      <Filters isDashboard={true} publisherId={loggedPublisherId} />
      <h1>Your Previous Uploads</h1>
        {filteredArticles.map((article) => (
            <ArticleCard article={article} key={article.id} />
          ))}
    </>
  );
};

export default Dashboard;
