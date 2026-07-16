import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import Navbar from "../components/Navbar";
import ArticleCard from "../components/ArticleCard";
import { ARTICLE_ENDPOINTS, apiCall } from "../utils/api";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiCall(ARTICLE_ENDPOINTS.search(query));
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error searching articles:", err);
          setError(err.message || "Failed to search articles");
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg">
              <Search className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">
              {query ? `Search results for "${query}"` : "Search"}
            </h2>
          </div>

          {!query && (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <p className="text-neutral-500">
                Enter a search term in the navigation bar to find articles.
              </p>
            </div>
          )}

          {query && loading && (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <p className="text-neutral-500">Searching...</p>
            </div>
          )}

          {query && !loading && error && (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <p className="text-accent-600">{error}</p>
            </div>
          )}

          {query && !loading && !error && results.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-card">
              <p className="text-neutral-500">
                No results found for &quot;{query}&quot;.
              </p>
            </div>
          )}

          {query && !loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((article) => (
                <ArticleCard article={article} key={article.id} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchResults;
