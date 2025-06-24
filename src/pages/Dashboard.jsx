import React, { useState, useContext } from "react";
import Navbar from "../components/Navbar";
import { articleContext } from "../context/articleContext";
import Filters from "../components/Filters";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";
import { Plus, FileText, BarChart3 } from "lucide-react";

const Dashboard = () => {
  const {
    articles,
    selectedRegion,
    selectedDate,
    loggedPublisher,
    loggedPublisherId,
    deleteArticle,
    setdeleteArticle,
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

  // Calculate stats
  const totalArticles = articles.filter(
    (article) => article.publisher === loggedPublisherName
  ).length;
  const totalEngagement = articles
    .filter((article) => article.publisher === loggedPublisherName)
    .reduce(
      (sum, article) =>
        sum + article.engagement.upVotes + article.engagement.comments,
      0
    );

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">
                Publisher Dashboard
              </h1>
              <p className="text-neutral-600 mt-1">
                Welcome back, {loggedPublisherName}
              </p>
            </div>
            <Link
              to="/add-article"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              Add New Article
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Articles</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalArticles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Total Engagement</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {totalEngagement}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-accent-100 rounded-lg">
                <FileText className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-600">Filtered Results</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {filteredArticles.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Filters isDashboard={true} publisherId={loggedPublisherId} />

        {/* Articles Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Your Articles
          </h2>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard
                  article={article}
                  key={article.id}
                  isDashboard={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">
                No articles found for the selected filters.
              </p>
              <Link
                to="/add-article"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Create Your First Article
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
