import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { articleContext } from "../context/articleContext";

const Navbar = () => {
  const {
    isUserLoggedIn,
    isPublisherLoggedIn,
    logout
  } = useContext(articleContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This will handle all cleanup including token removal and state resets
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <div className="w-32 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">LocalLens</span>
              </div>
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

          {/* Right section - Auth buttons */}
          <div className="flex items-center space-x-3">
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