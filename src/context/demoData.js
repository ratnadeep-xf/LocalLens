// This data can be replaced with real data fetched from an API or database
const today = new Date();
const formattedDate = `${String(today.getDate()).padStart(2, "0")}-${String(
  today.getMonth() + 1
).padStart(2, "0")}-${today.getFullYear()}`;

export const demoArticles = [
  {
    id: 1,
    img: "/img1.png",
    title: "Local Tech Startup Raises $2M in Series A Funding",
    region: "North Region",
    date: formattedDate, 
    publisher: "Tech Times Daily",
    content:
      "A promising local technology startup has successfully secured $2 million...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 1,
          userId: 101,
          articleId: 1,
          value: +1,
          createdAt: new Date("2025-06-20T10:00:00"),
        },
        {
          voteId: 2,
          userId: 102,
          articleId: 1,
          value: +1,
          createdAt: new Date("2025-06-20T10:05:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 1,
          userId: 101,
          articleId: 1,
          content: "This is fantastic news!",
          createdAt: new Date("2025-06-20T11:00:00"),
        },
        {
          commentId: 2,
          userId: 102,
          articleId: 1,
          content: "Congratulations to the team!",
          createdAt: new Date("2025-06-20T11:30:00"),
        },
        {
          commentId: 3,
          userId: 103,
          articleId: 1,
          content: "This could help our region shine.",
          createdAt: new Date("2025-06-20T12:00:00"),
        },
        {
          commentId: 4,
          userId: 104,
          articleId: 1,
          content: "Are they hiring?",
          createdAt: new Date("2025-06-20T12:30:00"),
        },
      ],
    },
  },
  {
    id: 2,
    img: "/img2.png",
    title: "GreenTech Expands Operations Across South Region",
    region: "South Region",
    date: formattedDate, // Use today's date in ISO format
    publisher: "Eco News Weekly",
    content:
      "GreenTech is expanding its clean energy initiatives across the South Region...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 3,
          userId: 103,
          articleId: 2,
          value: +1,
          createdAt: new Date("2025-06-18T10:00:00"),
        },
        {
          voteId: 4,
          userId: 104,
          articleId: 2,
          value: +1,
          createdAt: new Date("2025-06-18T10:10:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 5,
          userId: 105,
          articleId: 2,
          content: "Green energy growth is vital.",
          createdAt: new Date("2025-06-18T11:00:00"),
        },
        {
          commentId: 6,
          userId: 106,
          articleId: 2,
          content: "Looking forward to job openings.",
          createdAt: new Date("2025-06-18T11:30:00"),
        },
        {
          commentId: 7,
          userId: 107,
          articleId: 2,
          content: "Hope they come to our city too.",
          createdAt: new Date("2025-06-18T12:00:00"),
        },
        {
          commentId: 8,
          userId: 108,
          articleId: 2,
          content: "South is on the rise!",
          createdAt: new Date("2025-06-18T13:00:00"),
        },
      ],
    },
  },
  {
    id: 3,
    img: "/img3.png",
    title: "Healthcare App Wins Regional Innovation Award",
    region: "West Region",
    date: formattedDate, // Use today's date in ISO format
    publisher: "Tech Times Daily",
    content:
      "A new healthcare app has won a regional award for simplifying appointment booking...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 5,
          userId: 105,
          articleId: 3,
          value: +1,
          createdAt: new Date("2025-06-16T09:00:00"),
        },
        {
          voteId: 6,
          userId: 106,
          articleId: 3,
          value: +1,
          createdAt: new Date("2025-06-16T09:10:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 9,
          userId: 101,
          articleId: 3,
          content: "Much needed healthcare boost.",
          createdAt: new Date("2025-06-16T09:30:00"),
        },
        {
          commentId: 10,
          userId: 102,
          articleId: 3,
          content: "Awesome work by the devs.",
          createdAt: new Date("2025-06-16T10:00:00"),
        },
        {
          commentId: 11,
          userId: 103,
          articleId: 3,
          content: "Hope this gets nationwide.",
          createdAt: new Date("2025-06-16T10:30:00"),
        },
        {
          commentId: 12,
          userId: 104,
          articleId: 3,
          content: "Innovation for good!",
          createdAt: new Date("2025-06-16T11:00:00"),
        },
      ],
    },
  },
  {
    id: 4,
    img: "/img4.png",
    title: "AI Robotics Lab Launches in East Region",
    region: "East Region",
    date: formattedDate, // Use today's date in ISO format
    publisher: "Innovator's Journal",
    content:
      "A cutting-edge robotics lab focused on AI tech has launched in the East Region...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 7,
          userId: 107,
          articleId: 4,
          value: +1,
          createdAt: new Date("2025-06-14T08:00:00"),
        },
        {
          voteId: 8,
          userId: 108,
          articleId: 4,
          value: +1,
          createdAt: new Date("2025-06-14T08:15:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 13,
          userId: 105,
          articleId: 4,
          content: "East Region taking off!",
          createdAt: new Date("2025-06-14T09:00:00"),
        },
        {
          commentId: 14,
          userId: 106,
          articleId: 4,
          content: "Great for research students.",
          createdAt: new Date("2025-06-14T09:30:00"),
        },
        {
          commentId: 15,
          userId: 101,
          articleId: 4,
          content: "Hope there's a tour option!",
          createdAt: new Date("2025-06-14T10:00:00"),
        },
        {
          commentId: 16,
          userId: 102,
          articleId: 4,
          content: "Robotics + AI = Future.",
          createdAt: new Date("2025-06-14T10:30:00"),
        },
      ],
    },
  },
  {
    id: 5,
    img: "/img5.png",
    title: "Startup Hub Inaugurated by Government in West Region",
    region: "West Region",
    date: formattedDate, // Use today's date in ISO format
    publisher: "Tech Times Daily",
    content:
      "A new government-backed startup hub is opening opportunities for entrepreneurs...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 9,
          userId: 103,
          articleId: 5,
          value: +1,
          createdAt: new Date("2025-06-12T10:00:00"),
        },
        {
          voteId: 10,
          userId: 104,
          articleId: 5,
          value: +1,
          createdAt: new Date("2025-06-12T10:10:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 17,
          userId: 105,
          articleId: 5,
          content: "Fantastic government move.",
          createdAt: new Date("2025-06-12T11:00:00"),
        },
        {
          commentId: 18,
          userId: 106,
          articleId: 5,
          content: "Entrepreneurs needed this!",
          createdAt: new Date("2025-06-12T11:30:00"),
        },
        {
          commentId: 19,
          userId: 107,
          articleId: 5,
          content: "Hope they support funding too.",
          createdAt: new Date("2025-06-12T12:00:00"),
        },
        {
          commentId: 20,
          userId: 108,
          articleId: 5,
          content: "Would love to attend workshops.",
          createdAt: new Date("2025-06-12T12:30:00"),
        },
      ],
    },
  },
  {
    id: 6,
    img: "/img6.png",
    title: "AgriTech Innovation Center Unveiled in South Region",
    region: "South Region",
    date: formattedDate,
    publisher: "Eco News Weekly",
    content:
      "An AgriTech innovation center to help farmers using AI and data analytics...",
    engagement: {
      upVotes: 2,
      downVotes: 0,
      comments: 4,
      votesArray: [
        {
          voteId: 11,
          userId: 101,
          articleId: 6,
          value: +1,
          createdAt: new Date("2025-06-10T08:00:00"),
        },
        {
          voteId: 12,
          userId: 102,
          articleId: 6,
          value: +1,
          createdAt: new Date("2025-06-10T08:15:00"),
        },
      ],
      commentsArray: [
        {
          commentId: 21,
          userId: 103,
          articleId: 6,
          content: "Farmers will benefit greatly.",
          createdAt: new Date("2025-06-10T09:00:00"),
        },
        {
          commentId: 22,
          userId: 104,
          articleId: 6,
          content: "More AgriTech please!",
          createdAt: new Date("2025-06-10T09:30:00"),
        },
        {
          commentId: 23,
          userId: 105,
          articleId: 6,
          content: "Brilliant initiative.",
          createdAt: new Date("2025-06-10T10:00:00"),
        },
        {
          commentId: 24,
          userId: 106,
          articleId: 6,
          content: "AI for farming = win.",
          createdAt: new Date("2025-06-10T10:30:00"),
        },
      ],
    },
  },
];

export const demoPublishers = [
    {
      agencyName: "Ropar Times",
      email: "editor@ropartimes.com",
      password: "hashed_password_123", // Replace with hashed password in real app
      regions: ["Ropar", "Chandigarh"],
      role: "publisher",
      createdAt: new Date().toISOString(),
    },
    {
      agencyName: "Ludhiana Chronicle",
      email: "contact@ludhianachronicle.in",
      password: "hashed_password_456",
      regions: ["Ludhiana"],
      role: "publisher",
      createdAt: new Date().toISOString(),
    },
    {
      agencyName: "Jalandhar Gazette",
      email: "admin@jalandhargazette.com",
      password: "hashed_password_789",
      regions: ["Jalandhar", "Hoshiarpur"],
      role: "publisher",
      createdAt: new Date().toISOString(),
    },
  ];
  export const demoUsers = [
  {
    userId: 101,
    name: "Aarav Mehta",
    email: "aarav@example.com",
    passwordHash: "hashed_password_101",
    preferredRegions: ["North Region", "East Region"],
    role: "reader",
    createdAt: "2025-06-18T10:00:00Z"
  },
  {
    userId: 102,
    name: "Simran Kaur",
    email: "simran@example.com",
    passwordHash: "hashed_password_102",
    preferredRegions: ["South Region"],
    role: "reader",
    createdAt: "2025-06-16T09:30:00Z"
  },
  {
    userId: 103,
    name: "Raj Patel",
    email: "raj@example.com",
    passwordHash: "hashed_password_103",
    preferredRegions: ["North Region", "South Region"],
    role: "reader",
    createdAt: "2025-06-15T08:45:00Z"
  },
  {
    userId: 104,
    name: "Nikita Verma",
    email: "nikita@example.com",
    passwordHash: "hashed_password_104",
    preferredRegions: ["East Region", "West Region"],
    role: "reader",
    createdAt: "2025-06-14T11:20:00Z"
  },
  {
    userId: 105,
    name: "Manav Singh",
    email: "manav@example.com",
    passwordHash: "hashed_password_105",
    preferredRegions: ["West Region"],
    role: "reader",
    createdAt: "2025-06-13T13:00:00Z"
  },
  {
    userId: 106,
    name: "Priya Sharma",
    email: "priya@example.com",
    passwordHash: "hashed_password_106",
    preferredRegions: ["South Region", "West Region"],
    role: "reader",
    createdAt: "2025-06-12T15:45:00Z"
  },
  {
    userId: 107,
    name: "Karan Joshi",
    email: "karan@example.com",
    passwordHash: "hashed_password_107",
    preferredRegions: ["East Region"],
    role: "reader",
    createdAt: "2025-06-11T17:10:00Z"
  },
  {
    userId: 108,
    name: "Ishita Bansal",
    email: "ishita@example.com",
    passwordHash: "hashed_password_108",
    preferredRegions: ["North Region", "South Region"],
    role: "reader",
    createdAt: "2025-06-10T18:30:00Z"
  }
];
