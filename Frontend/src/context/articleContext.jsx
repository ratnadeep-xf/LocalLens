import { createContext, useState, useEffect } from "react";
import { demoArticles, demoPublishers, demoUsers } from "./demoData";
import { API_BASE_URL, AUTH_ENDPOINTS, ARTICLE_ENDPOINTS, apiCall } from "../utils/api";
import { formatDateDDMMYYYY, isSameCalendarDate } from "../utils/date";

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
  const [selectedDate, setSelectedDate] = useState(() => {
    // Initialize with today's date at start of day (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);  // Set to midnight
    return today;
  });
  const [regionAvailable, setregionAvailable] = useState([
    { value: "all", label: "All Regions" },
  ]);
  const [selectedRegion, setSelectedRegion] = useState(["all"]);
  const [modal, setmodal] = useState(false);
  const [deleteArticle, setdeleteArticle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // User/Publisher states
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedPublisherId, setloggedPublisherId] = useState(null);
  const [loggedUser, setLoggedUser] = useState(null);
  const [loggedPublisher, setloggedPublisher] = useState(null);

  // Function to fetch articles (replace without cursor; append with cursor)
  const fetchArticles = async ({ cursor } = {}) => {
    const isLoadMore = Boolean(cursor);
    if (!isLoadMore) {
      setLoading(true);
    }
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', '10');

      // Add date parameter in DD-MM-YYYY format
      if (selectedDate) {
        params.append('date', formatDateDDMMYYYY(selectedDate));
      }

      if (cursor) {
        params.append('cursor', cursor);
      }

      // Construct URL with query parameters
      const url = `${ARTICLE_ENDPOINTS.getAll}?${params.toString()}`;
      const data = await apiCall(url);
      const {
        articles: pageArticles,
        nextCursor: responseNextCursor,
        hasMore: responseHasMore,
      } = data;

      if (isLoadMore) {
        setArticles((prev) => [...prev, ...pageArticles]);
      } else {
        setArticles(pageArticles);
      }

      setNextCursor(responseNextCursor ?? null);
      setHasMore(Boolean(responseHasMore));
    } catch (err) {
      console.error('Error in fetchArticles:', err);
      setError(err.message || "Failed to fetch articles");
    } finally {
      if (!isLoadMore) {
        setLoading(false);
      }
    }
  };

  const loadMoreArticles = async () => {
    if (!hasMore || isLoadingMore || !nextCursor) {
      return;
    }
    setIsLoadingMore(true);
    try {
      await fetchArticles({ cursor: nextCursor });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Log articles whenever they change
  useEffect(() => {
    console.log("Articles fetched:", articles.length);
  }, [articles]);

  // Fetch articles only when date changes (new pagination sequence)
  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    fetchArticles();
  }, [selectedDate]);

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
      
      // If no token, clear all auth states and fetch articles
      if (!storedToken) {
        setToken(null);
        setisUserLoggedIn(false);
        setisPublisherLoggedIn(false);
        setLoggedUser(null);
        setloggedPublisher(null);
        setLoggedUserId(null);
        setloggedPublisherId(null);
        console.log("Auth State: No token, cleared all auth states");
        return; // Don't fetch here, let the filter effect handle it
      }

      try {
        const data = await apiCall(AUTH_ENDPOINTS.verify);

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

  // Calculate popular articles
  useEffect(() => {
    const topThree = articles
      .filter((article) => isSameCalendarDate(article.date, selectedDate))
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

  // Function to remove an article from the state
  const removeArticle = (articleId) => {
    console.log("Removing article:", articleId);
    setArticles(prevArticles => {
      const updatedArticles = prevArticles.filter(article => article.id !== articleId);
      console.log("Articles after removal:", updatedArticles.length);
      return updatedArticles;
    });
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
    loading,
    error,
    popular,
    nextCursor,
    hasMore,
    isLoadingMore,
    fetchArticles,
    loadMoreArticles,
    removeArticle
  };

  return (
    <articleContext.Provider value={value}>{children}</articleContext.Provider>
  );
};
