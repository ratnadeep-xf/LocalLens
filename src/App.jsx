import { useState } from "react";
import "./App.css";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import UserLogin from "./pages/UserLogin";
import PublisherLogin from "./pages/PublisherLogin";
import AddArticle from "./pages/AddArticle";
import Dashboard from "./pages/Dashboard";
import ArticlePage from "./pages/ArticlePage";
import { ArticleProvider } from "./context/articleContext";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ArticleProvider>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/publisher-login" element={<PublisherLogin />} />
            <Route path="/add-article" element={<AddArticle />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/article/:id" element={<ArticlePage />} />
          </Routes>
        </main>
      </ArticleProvider>
    </>
  );
}

export default App;
