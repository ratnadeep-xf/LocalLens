import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { articleContext } from "../context/articleContext";

const Navbar = () => {
  const {
    isUserLoggedIn,
    isPublisherLoggedIn,
    logout
  } = useContext(articleContext);

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout(); // This will handle all cleanup including token removal and state resets
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-3">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center space-x-8 flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="LocalLens Logo" 
                className="h-14 w-auto py-1 hover:scale-105 transition-transform duration-200"
              />
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link 
                to="/" 
                className="text-neutral-700 hover:text-primary-600 font-medium transition-colors duration-200"
              >
                Home
              </Link>
            </nav>
          </div>

          {/* Center - Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-2"
            role="search"
          >
            <div className="relative w-full">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-4 py-2 pr-10 border border-neutral-200 rounded-lg text-sm text-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                aria-label="Search articles"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-primary-600 transition-colors duration-200"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right section - Auth buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {!isUserLoggedIn && !isPublisherLoggedIn && (
              <>
                <Link
                  to="/user-login"
                  className="text-neutral-700 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors duration-200"
                >
                  Reader Login
                </Link>
                <Link
                  to="/publisher-login"
                  className="bg-primary-600 text-white hover:bg-primary-700 font-medium px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Publisher Login
                </Link>
              </>
            )}
            
            {isPublisherLoggedIn && (
              <Link
                to="/dashboard"
                className="text-neutral-700 hover:text-primary-600 font-medium px-3 py-2 rounded-md transition-colors duration-200"
              >
                Dashboard
              </Link>
            )}
            
            {(isUserLoggedIn || isPublisherLoggedIn) && (
              <button
                onClick={handleLogout}
                className="bg-accent-600 text-white hover:bg-accent-700 font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
