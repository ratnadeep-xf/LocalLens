import { createContext, useState, useEffect } from "react";
import { demoArticles, demoPublishers, demoUsers } from "./demoData";

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

      const response = await fetch("/api/articles", {
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
      console.log("Received articles:", data.length);

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setArticles(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError(err.message || "Failed to fetch articles");
      setArticles([]); // Reset articles on error
    } finally {
      setLoading(false);
    }
  };

  // Log articles whenever they change
  useEffect(() => {
    console.log("Articles updated:", articles);
  }, [articles]);

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

  // Fetch articles whenever filters change
  useEffect(() => {
    fetchArticles();
  }, [selectedDate, selectedRegion, token]); // Add filter dependencies

  // Extract unique regions from articles
  useEffect(() => {
    const uniqueRegions = [
      ...new Set(articles.map((article) => article.region)),
    ];
    const initialRegions = uniqueRegions.map((region) => ({
      value: region,
      label: region.charAt(0).toUpperCase() + region.slice(1),
    }));

    initialRegions.unshift({ value: "all", label: "All Regions" });
    setregionAvailable(initialRegions);
  }, [articles]);

  // Handle authentication state
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setisUserLoggedIn(false);
        setisPublisherLoggedIn(false);
        setLoggedUser(null);
        setloggedPublisher(null);
        setLoggedUserId(null);
        setloggedPublisherId(null);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        const data = await response.json();

        if (data.role === "reader") {
          setisUserLoggedIn(true);
          setisPublisherLoggedIn(false);
          setLoggedUserId(data.userId);
          setLoggedUser(data.user);
          setloggedPublisher(null);
          setloggedPublisherId(null);
        } else if (data.role === "publisher") {
          setisPublisherLoggedIn(true);
          setisUserLoggedIn(false);
          setloggedPublisherId(data.publisherId);
          setloggedPublisher(data.publisher);
          setLoggedUser(null);
          setLoggedUserId(null);
        }
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token");
        setToken(null);
        setisUserLoggedIn(false);
        setisPublisherLoggedIn(false);
        setLoggedUser(null);
        setloggedPublisher(null);
        setLoggedUserId(null);
        setloggedPublisherId(null);
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
    localStorage.removeItem("token");
    setToken(null);
    setisUserLoggedIn(false);
    setisPublisherLoggedIn(false);
    setLoggedUser(null);
    setloggedPublisher(null);
    setLoggedUserId(null);
    setloggedPublisherId(null);
  };

  // Custom setToken function that also updates localStorage
  const updateToken = (newToken) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
    setToken(newToken);
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
