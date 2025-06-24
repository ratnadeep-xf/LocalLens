import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { articleContext } from "../context/articleContext";

const Navbar = () => {
  const {
    isUserLoggedIn,
    isPublisherLoggedIn,
    setisUserLoggedIn,
    setisPublisherLoggedIn,
  } = useContext(articleContext);

  const navigate = useNavigate();

  const handleLogout = () => {
    if (isUserLoggedIn) setisUserLoggedIn(false);
    if (isPublisherLoggedIn) setisPublisherLoggedIn(false);
    navigate("/"); // Optionally redirect to home
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex items-center gap-6">
        <div className="logo w-[150px] h-[50px] bg-gray-200 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="LocalLens"
            className="w-full h-full object-contain"
          />
        </div>
        <ul className="nav-links flex gap-6">
          <li>
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
        </ul>
      </div>
      <div className="loginOptions flex gap-4">
        {!isUserLoggedIn && (
          <button className="UserLogin">
            <Link to="/user-login" className="nav-link">
              User Login
            </Link>
          </button>
        )}
        {!isPublisherLoggedIn && (
          <button className="publisherLogin">
            <Link to="/publisher-login" className="nav-link">
              Publisher Login
            </Link>
          </button>
        )}
        {isPublisherLoggedIn && (
          <button className="dashboard button">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </button>
        )}
        {(isUserLoggedIn || isPublisherLoggedIn) && (
          <button
            className="logout button bg-red-600 text-white px-4 py-2 rounded"
            onClick={handleLogout}
          >
            Log Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
