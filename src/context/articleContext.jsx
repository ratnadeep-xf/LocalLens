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
  const [popular, setpopular] = useState([]);

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
  const [loggedPublisherId, setloggedPublisherId] = useState(1);

  // Find the logged-in publisher's name
  const [loggedPublisher, setloggedPublisher] = useState(
    publisherArray.find((publisher) => publisher.id === loggedPublisherId)
  );
  // Effect to update loggedPublisher when loggedPublisherId changes
  useEffect(() => {
    setloggedPublisher(
      publisherArray.find((publisher) => publisher.id === loggedPublisherId)
    );
  }, [loggedPublisherId, publisherArray]);

  // This should be dynamically set based on the logged-in user
  const [loggedUserId, setLoggedUserId] = useState(101);

  // Find the logged-in user's object
  const [loggedUser, setLoggedUser] = useState(
    userArray.find((user) => user.userId === loggedUserId)
  );

  // Effect to update loggedUser when loggedUserId or userArray changes
  useEffect(() => {
    setLoggedUser(userArray.find((user) => user.userId === loggedUserId));
  }, [loggedUserId, userArray]);

  // Reset loggedUser when user logs out
  useEffect(() => {
    if (!isUserLoggedIn) {
      setLoggedUserId(101);
    }
  }, [isUserLoggedIn]);

  // Reset loggedPublisher when publisher logs out
  useEffect(() => {
    if (!isPublisherLoggedIn) {
      setloggedPublisherId(1);
    }
  }, [isPublisherLoggedIn]);

  // If user logs in, log out publisher
  useEffect(() => {
    if (isUserLoggedIn) {
      setisPublisherLoggedIn(false);
    }
  }, [isUserLoggedIn]);

  // If publisher logs in, log out user
  useEffect(() => {
    if (isPublisherLoggedIn) {
      setisUserLoggedIn(false);
    }
  }, [isPublisherLoggedIn]);

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
      .sort(
        (a, b) =>
          (b.engagement.upVotes - b.engagement.downVotes) -
          (a.engagement.upVotes - a.engagement.downVotes)
      )
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
    console.log("Logged User:", loggedUser);
    console.log("Logged Publisher:", loggedPublisher);
  }, [
    articles,
    regionAvailable,
    selectedDate,
    selectedRegion,
    publisherArray,
    userArray,
    loggedUser,
    loggedPublisher,
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
    loggedUserId,
    setLoggedUserId,
    loggedUser,
    setLoggedUser,
    loggedPublisher,
    setloggedPublisher,
    loggedPublisherId,
    setloggedPublisherId,
  };

  return (
    <articleContext.Provider value={{ ...value }}>
      {children}
    </articleContext.Provider>
  );
};
