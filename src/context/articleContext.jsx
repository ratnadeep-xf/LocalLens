import { createContext, useState, useEffect } from "react";
import { demoArticles, demoPublishers, demoUsers } from "./demoData"; //
import { is } from "date-fns/locale";

export const articleContext = createContext();
export const ArticleProvider = ({ children }) => {
  // State to manage selected date and region
  const [articles, setArticles] = useState(
    Array.isArray(demoArticles) ? demoArticles : []
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [regionAvailable, setregionAvailable] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(["all"]);
  const [publisherArray, setpublisherArray] = useState(demoPublishers);
  const [userArray, setuserArray] = useState(demoUsers);
  const [isUserLoggedIn, setisUserLoggedIn] = useState(false);
  const [isPublisherLoggedIn, setisPublisherLoggedIn] = useState(false);
  const [popular, setpopular] = useState([])

  useEffect(() => {
    // Extract unique regions from articles in regionAvailable
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

  // State to manage modal visibility
  const [modal, setmodal] = useState(false);
  const [deleteArticle, setdeleteArticle] = useState(false);

  // This should be dynamically set based on the logged-in publisher
  const loggedPublisherId = 1;

  // Find the logged-in publisher's name
  const loggedPublisher = publisherArray.find(
    (publisher) => publisher.id === loggedPublisherId
  );

  // Function to check if the date string matches the selected date
  const isSameDate = (dateStr, selectedDate) => {
    const [day, month, year] = dateStr.split("-");
    const d = new Date(`${year}-${month}-${day}`);
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };
  // Filter articles to get the top three based on engagement votes for the selected date and region

  useEffect(() => {
    const topThree = articles
      .filter((article) => isSameDate(article.date, selectedDate))
      .filter((article) => {
        // If "all" is selected, show all articles
        if (selectedRegion.includes("all")) {
          return true;
        }
        // Otherwise, show articles matching any selected region
        return selectedRegion.includes(article.region);
      })
      .sort((a, b) => b.engagement.votes - a.engagement.votes)
      .slice(0, 3);
    setpopular(topThree);
  }, [articles, selectedDate, selectedRegion]);

  useEffect(() => {
    console.log("Articles updated:", articles);
    console.log("Region available updated:", regionAvailable);
    console.log("Selected date updated:", selectedDate);
    console.log("Selected region updated:", selectedRegion);
    console.log("Publisher array updated:", publisherArray);
    console.log("User array updated:", userArray);
  }, [
    articles,
    regionAvailable,
    selectedDate,
    selectedRegion,
    publisherArray,
    userArray,
  ]);

  const value = {
    articles,
    setArticles,
    regionAvailable,
    setregionAvailable,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
    publisherArray,
    setpublisherArray,
    userArray,
    setuserArray,
    modal,
    setmodal,
    deleteArticle,
    setdeleteArticle,
    loggedPublisherId,
    loggedPublisher,
    isUserLoggedIn,
    setisUserLoggedIn,
    isPublisherLoggedIn,
    setisPublisherLoggedIn,
    popular,
    setpopular,
  };

  return (
    <articleContext.Provider value={{ ...value }}>
      {children}
    </articleContext.Provider>
  );
};
