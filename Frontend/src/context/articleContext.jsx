import { createContext, useState, useEffect } from "react";
import { demoArticles, demoPublishers, demoUsers } from "./demoData";
import { API_BASE_URL, AUTH_ENDPOINTS, ARTICLE_ENDPOINTS } from "../utils/api";

export const articleContext = createContext();

export const ArticleProvider = ({ children }) => {
  // Authentication states
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isUserLoggedIn, setisUserLoggedIn] = useState(false);
  const [isPublisherLoggedIn, setisPublisherLoggedIn] = useState(false);

  // Data states
  const [articles, setArticles] = useState([]);
  const [publisherArray, setpublisherArray] = useState([]);
  const [userArray, setuserArray] = useState([]);
  const [popular, setpopular] = useState([]);

  // UI states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [regionAvailable, setregionAvailable] = useState([
    { value: "all", label: "All Regions" },
  ]);
  const [selectedRegion, setSelectedRegion] = useState(["all"]);
  const [modal, setmodal] = useState(false);
  const [deleteArticle, setdeleteArticle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User/Publisher states
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedPublisherId, setloggedPublisherId] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedPublisher, setloggedPublisher] = useState(null);

  // Function to fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Starting article fetch...");

      const response = await fetch(ARTICLE_ENDPOINTS.getAll, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Received articles from backend:", data.length);

      if (!Array.isArray(data)) {
        console.error("Invalid data format:", data);
        throw new Error("Invalid data format received from server");
      }

      console.log("Setting articles in state...");
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err.message || "Failed to fetch articles");
      setArticles([]); // Reset articles on error
    } finally {
      setLoading(false);
      console.log("Article fetch completed");
    }
  };

  // Log articles whenever they change
  useEffect(() => {
    console.log("Articles updated:", articles.length);
  }, [articles]);

  // Fetch articles on mount and auth changes
  useEffect(() => {
    console.log("Fetching articles...");
    fetchArticles();
  }, []);

  // Sync token with localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken !== token) {
      setToken(storedToken);
    }
  }, []);

  // Update localStorage when token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  // Extract unique regions from articles
  useEffect(() => {
    const uniqueRegions = [
      ...new Set(articles.map((article) => article.region)),
    ];
    const initialRegions = uniqueRegions.map((region) => ({
      value: region,
      label: region.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' '),
    }));

    initialRegions.unshift({ value: "all", label: "All Regions" });
    setregionAvailable(initialRegions);
  }, [articles]);

  // Handle authentication state
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("token");
      
      // If no token, clear all auth states
      if (!storedToken) {
        setToken(null);
        setisUserLoggedIn(false);
        setisPublisherLoggedIn(false);
        setLoggedUser(null);
        setloggedPublisher(null);
        setLoggedUserId(null);
        setloggedPublisherId(null);
        console.log("Auth State: No token, cleared all auth states");
        return;
      }

      try {
        const response = await fetch(AUTH_ENDPOINTS.verify, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        // Set token first
        setToken(storedToken);

        if (data.role === "reader") {
          // Set reader states
          setLoggedUserId(data.userId);
          setLoggedUser(data.user);
          setisUserLoggedIn(true);
          // Clear publisher states
          setisPublisherLoggedIn(false);
          setloggedPublisher(null);
          setloggedPublisherId(null);
          console.log("Auth State: Reader authenticated", {
            userId: data.userId,
            isUserLoggedIn: true
          });
        } else if (data.role === "publisher") {
          // Set publisher states
          setloggedPublisherId(data.publisherId);
          setloggedPublisher(data.publisher);
          setisPublisherLoggedIn(true);
          // Clear reader states
          setisUserLoggedIn(false);
          setLoggedUser(null);
          setLoggedUserId(null);
          console.log("Auth State: Publisher authenticated", {
            publisherId: data.publisherId,
            isPublisherLoggedIn: true
          });
        }
      } catch (err) {
        console.error("Auth error:", err);
        // Clear everything on auth error
        localStorage.removeItem("token");
        setToken(null);
        setisUserLoggedIn(false);
        setisPublisherLoggedIn(false);
        setLoggedUser(null);
        setloggedPublisher(null);
        setLoggedUserId(null);
        setloggedPublisherId(null);
        console.log("Auth State: Error occurred, cleared all auth states", {
          error: err.message
        });
      }
    };

    checkAuth();
  }, [token]);

  // Helper function for date comparison
  const isSameDate = (dateStr, selectedDate) => {
    const [day, month, year] = dateStr.split("-");
    const d = new Date(`${year}-${month}-${day}`);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Calculate popular articles
  useEffect(() => {
    const topThree = articles
      .filter((article) => isSameDate(article.date, selectedDate))
      .filter((article) => {
        if (selectedRegion.includes("all")) return true;
        return selectedRegion.includes(article.region);
      })
      .sort(
        (a, b) =>
          b.engagement.upVotes -
          b.engagement.downVotes -
          (a.engagement.upVotes - a.engagement.downVotes)
      )
      .slice(0, 3);
    setpopular(topThree);
  }, [articles, selectedDate, selectedRegion]);

  // Logout function
  const logout = () => {
    console.log("Logout: Starting logout process");
    // Clear token from localStorage
    localStorage.removeItem("token");
    setToken(null);
    
    // Reset all auth-related states
    setisUserLoggedIn(false);
    setisPublisherLoggedIn(false);
    setLoggedUser(null);
    setloggedPublisher(null);
    setLoggedUserId(null);
    setloggedPublisherId(null);
    
    console.log("Logout: Completed, all states cleared");
  };

  // Custom setToken function that also updates localStorage
  const updateToken = (newToken) => {
    console.log("Token Update: Processing new token");
    if (newToken) {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      console.log("Token Update: New token set");
    } else {
      localStorage.removeItem("token");
      setToken(null);
      // Also reset auth states when token is cleared
      setisUserLoggedIn(false);
      setisPublisherLoggedIn(false);
      setLoggedUser(null);
      setloggedPublisher(null);
      setLoggedUserId(null);
      setloggedPublisherId(null);
      console.log("Token Update: Token cleared, reset all auth states");
    }
  };

  const value = {
    articles,
    setArticles,
    publisherArray,
    setpublisherArray,
    userArray,
    setuserArray,
    selectedDate,
    setSelectedDate,
    regionAvailable,
    setregionAvailable,
    selectedRegion,
    setSelectedRegion,
    modal,
    setmodal,
    deleteArticle,
    setdeleteArticle,
    isUserLoggedIn,
    setisUserLoggedIn,
    isPublisherLoggedIn,
    setisPublisherLoggedIn,
    loggedUserId,
    setLoggedUserId,
    loggedPublisherId,
    setloggedPublisherId,
    loggedUser,
    setLoggedUser,
    loggedPublisher,
    setloggedPublisher,
    token,
    setToken,
    updateToken,
    logout,
    popular,
    loading,
    error,
    fetchArticles,
  };

  return (
    <articleContext.Provider value={value}>{children}</articleContext.Provider>
  );
};
