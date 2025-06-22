import { createContext, useState, useEffect } from "react";

export const articleContext = createContext();
export const ArticleProvider = ({ children }) => {
  // Sample articles data
  // This data can be replaced with real data fetched from an API or database
  const articles = [
    {
      id: 1,
      img: "/code-background.png",
      title: "Local Tech Startup Raises $2M in Series A Funding",
      region: "North Region",
      date: "20-06-2025",
      publisher: "Tech Times Daily",
      engagement: {
        votes: 142,
        comments: 28,
      },
    },
    {
      id: 2,
      img: "/code-background.png",
      title: "Green Energy Projects Surge in Southern India",
      region: "South Region",
      date: "20-06-2025",
      publisher: "Eco News Network",
      engagement: {
        votes: 89,
        comments: 14,
      },
    },
    {
      id: 3,
      img: "/code-background.png",
      title: "Northeast Tourism Sees Record Growth Post-Pandemic",
      region: "North-East Region",
      date: "17-06-2025",
      publisher: "Travel Digest",
      engagement: {
        votes: 196,
        comments: 33,
      },
    },
    {
      id: 4,
      img: "/code-background.png",
      title: "Western States Push for AI in Agriculture",
      region: "West Region",
      date: "19-06-2025",
      publisher: "AgriTech Today",
      engagement: {
        votes: 76,
        comments: 11,
      },
    },
    {
      id: 5,
      img: "/code-background.png",
      title: "Educational Reforms Impacting Rural Schools",
      region: "Central Region",
      date: "20-06-2025",
      publisher: "Education India",
      engagement: {
        votes: 210,
        comments: 47,
      },
    },
    {
      id: 6,
      img: "/code-background.png",
      title: "Startups from Eastern India Impress at National Expo",
      region: "East Region",
      date: "20-06-2025",
      publisher: "Startup Chronicle",
      engagement: {
        votes: 131,
        comments: 20,
      },
    },
  ];

  // Extract unique regions from articles in regionOptions
  const uniqueRegions = [...new Set(articles.map((article) => article.region))];

  const initialRegions = uniqueRegions.map((region) => ({
    value: region,
    label: region.charAt(0).toUpperCase() + region.slice(1),
  }));

  initialRegions.unshift({ value: "all", label: "All Regions" });

  // State to manage selected date and region
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [regionOptions, setregionOptions] = useState(initialRegions);
  const [selectedRegion, setSelectedRegion] = useState([
    regionOptions[0].value,
  ]);

  const value = {
    articles,
    regionOptions,
    setregionOptions,
    selectedDate,
    setSelectedDate,
    selectedRegion,
    setSelectedRegion,
  };

  return (
    <articleContext.Provider value={{ ...value }}>
      {children}
    </articleContext.Provider>
  );
};
