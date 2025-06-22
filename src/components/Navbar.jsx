import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
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
        <button className="UserLogin">
          <Link to="/user-login" className="nav-link">
            User Login
          </Link>
        </button>
        <button className="publisherLogin"><Link to="/publisher-login" className="nav-link">
            Publisher Login
          </Link></button>
      </div>
    </nav>
  );
};

export default Navbar;
