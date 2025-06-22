import { createContext, useState, useEffect } from "react";
import { demoArticles, demoPublishers, demoUsers } from "./demoData"; //

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
    console.log("Initial Regions:", initialRegions);
    setregionAvailable(initialRegions);
    console.log("Updated regionAvailable:", regionAvailable);
  }, [articles]);

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
    setuserArray
  };

  return (
    <articleContext.Provider value={{ ...value }}>
      {children}
    </articleContext.Provider>
  );
};
