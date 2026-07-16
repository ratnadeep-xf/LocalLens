import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import PublisherLogin from "./pages/PublisherLogin";
import AddArticle from "./pages/AddArticle";
import Dashboard from "./pages/Dashboard";
import ArticlePage from "./pages/ArticlePage";
import SearchResults from "./pages/SearchResults";
import { ArticleProvider } from "./context/articleContext";
import DeleteModal from "./components/DeleteModal";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <ArticleProvider>
        <div className="flex flex-col min-h-screen">
          <main className="main-content flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/user-login" element={<UserLogin />} />
              <Route path="/publisher-login" element={<PublisherLogin />} />
              <Route path="/add-article" element={<AddArticle />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/delete-article" element={<DeleteModal />} />
              <Route path="*" element={<h1>Page Not Found</h1>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ArticleProvider>
    </>
  );
}

export default App;
