export interface Show {
  id: string;
  title: string;
  image: string;
  rating: number;
  year: number;
  genre: string[];
  country: string;
  description: string;
  type: "tv" | "movie";
  duration: string;
  director?: string;
  cast?: string[];
  videoId?: string; // Cloudflare Stream video ID
  isAvailable?: boolean; // Whether the content is uploaded and available to watch
  quality: string;
  // Series specific fields
  seasons?: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  number: number;
  season: number;
  title: string;
  duration: string;
  thumbnail: string;
}

export const shows: Show[] = [
  // TV Series
  {
    id: "all-of-us-are-dead",
    quality: "1080p",
    title: "All of Us Are Dead",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 7.6,
    year: 2022,
    genre: ["Horror", "Action", "Drama"],
    country: "Korea",
    description:
      "A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out or turn into one of the rabid infected.",
    type: "tv",
    duration: "45-60 min",
    seasons: 1,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Episode 1",
        duration: "66 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Episode 2",
        duration: "58 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "3",
        number: 3,
        season: 1,
        title: "Episode 3",
        duration: "54 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "4",
        number: 4,
        season: 1,
        title: "Episode 4",
        duration: "61 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
    ],
  },
  // Movie
  {
    id: "inception",
    quality: "4K",
    title: "Inception",
    image:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg",
    rating: 8.8,
    year: 2010,
    genre: ["Sci-Fi", "Action", "Thriller"],
    country: "USA",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    type: "movie",
    duration: "148 min",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Ellen Page"],
  },
  {
    id: "kingdom",
    title: "Kingdom",
    quality: "WEB-DL",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 8.8,
    year: 2019,
    genre: ["Horror", "Thriller", "Drama"],
    country: "Korea",
    description:
      "While strange rumors about their ill king grip a kingdom, the crown prince becomes their only hope against a mysterious plague overtaking the land.",
    type: "tv",
    duration: "45-55 min",
    seasons: 2,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Episode 1",
        duration: "51 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Episode 2",
        duration: "48 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "3",
        number: 3,
        season: 1,
        title: "Episode 3",
        duration: "45 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
      },
    ],
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    quality: "WEB-DL",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 8.6,
    year: 2016,
    genre: ["Sci-Fi", "Horror", "Drama"],
    country: "USA",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    type: "tv",
    duration: "45-75 min",
    seasons: 4,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Chapter One: The Vanishing of Will Byers",
        duration: "49 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Chapter Two: The Weirdo on Maple Street",
        duration: "56 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
      {
        id: "3",
        number: 3,
        season: 1,
        title: "Chapter Three: Holly, Jolly",
        duration: "52 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
    ],
  },
  {
    id: "tell-me-not-to-love-you",
    title: "Tell Me Not to Love You",
    quality: "HD",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 6.8,
    year: 2023,
    genre: ["Romance", "Drama"],
    country: "Korea",
    description:
      "A heartwarming romance story about two people who find love in unexpected circumstances.",
    type: "tv",
    duration: "55-65 min",
    seasons: 1,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Episode 1",
        duration: "62 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Episode 2",
        duration: "58 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
    ],
  },
  {
    id: "high-school-king-of-savvy",
    title: "High School King of Savvy",
    quality: "HD",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 7.1,
    year: 2014,
    genre: ["Comedy", "Romance", "Drama"],
    country: "Korea",
    description:
      "A high school student pretends to be his older brother, a company director, and falls for an employee.",
    type: "tv",
    duration: "60 min",
    seasons: 1,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Episode 1",
        duration: "60 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Episode 2",
        duration: "60 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
      },
    ],
  },
  {
    id: "baki-hanma",
    title: "Baki Hanma",
    quality: "HD",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 7.0,
    year: 2021,
    genre: ["Action", "Animation"],
    country: "Japan",
    description:
      "To gain the skills he needs to surpass his powerful father, Baki enters Arizona State Prison to take on the notorious inmate known as Mr. Unchained.",
    type: "tv",
    duration: "24 min",
    seasons: 2,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Synchronicity",
        duration: "26 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Arizona State Prison",
        duration: "26 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
      },
    ],
  },
  {
    id: "squid-game",
    title: "Squid Game",
    quality: "4K",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 8.0,
    year: 2021,
    genre: ["Thriller", "Drama", "Action"],
    country: "Korea",
    description:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    type: "tv",
    duration: "55-65 min",
    seasons: 2,
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Red Light, Green Light",
        duration: "60 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Hell",
        duration: "62 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
    ],
  },
  {
    id: "the-glory",
    title: "The Glory",
    quality: "4K",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 8.1,
    year: 2022,
    genre: ["Thriller", "Drama"],
    country: "Korea",
    description:
      "Years after surviving horrific abuse in high school, a woman puts an elaborate revenge scheme in motion to make the perpetrators pay for their crimes.",
    type: "tv",
    duration: "50-70 min",
    seasons: 1,
    cast: ["Song Hye-kyo", "Lee Do-hyun", "Lim Ji-yeon"],
    episodes: [
      {
        id: "1",
        number: 1,
        season: 1,
        title: "Episode 1",
        duration: "54 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
      {
        id: "2",
        number: 2,
        season: 1,
        title: "Episode 2",
        duration: "52 min",
        thumbnail:
          "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
      },
    ],
  },
  // Movies
  {
    id: "parasite",
    title: "Parasite",
    quality: "4K",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/0fbed01c50da7bdf2aeba49123fa06e6.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 8.5,
    year: 2019,
    genre: ["Thriller", "Drama", "Comedy"],
    country: "Korea",
    description:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    type: "movie",
    duration: "2h 12min",
    director: "Bong Joon-ho",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
  },
  {
    id: "train-to-busan",
    title: "Train to Busan",
    quality: "1080p",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/01/c638fb3ed583126402f6ee5545cf0ac0.jpg?x-oss-process=image/resize%2Cw_250",
    rating: 7.6,
    year: 2016,
    genre: ["Horror", "Action", "Thriller"],
    country: "Korea",
    description:
      "While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan.",
    type: "movie",
    duration: "1h 58min",
    director: "Yeon Sang-ho",
    cast: ["Gong Yoo", "Jung Yu-mi", "Ma Dong-seok"],
  },
  {
    id: "your-name",
    title: "Your Name",
    quality: "4K",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/12/06/7da307dc7ed5f87afc4f0bb6154d2906.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 8.4,
    year: 2016,
    genre: ["Animation", "Romance", "Drama"],
    country: "Japan",
    description:
      "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?",
    type: "movie",
    duration: "1h 46min",
    director: "Makoto Shinkai",
    cast: ["Ryunosuke Kamiki", "Mone Kamishiraishi"],
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    quality: "4K",
    image:
      "https://pbcdnw.aoneroom.com/image/2025/11/03/49a8207633d9b49389ec4b809969cc8d.jpg?x-oss-process=image/resize%2Cw_250/format%2Cwebp",
    rating: 8.3,
    year: 2023,
    genre: ["Drama", "Thriller"],
    country: "USA",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    type: "movie",
    duration: "3h 0min",
    director: "Christopher Nolan",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
  },
  // Unavailable content - for testing request feature
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    quality: "4K",
    image: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    rating: 8.8,
    year: 2024,
    genre: ["Sci-Fi", "Action", "Drama"],
    country: "USA",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    type: "movie",
    duration: "2h 46min",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    isAvailable: false,
  },
  {
    id: "the-batman-2",
    title: "The Batman Part II",
    quality: "TBA",
    image: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 0,
    year: 2026,
    genre: ["Action", "Drama", "Thriller"],
    country: "USA",
    description:
      "The sequel to The Batman, continuing the story of Bruce Wayne's crusade against crime in Gotham City.",
    type: "movie",
    duration: "TBA",
    director: "Matt Reeves",
    cast: ["Robert Pattinson", "Zoë Kravitz"],
    isAvailable: false,
  },
  {
    id: "moving",
    title: "Moving",
    quality: "4K",
    image: "https://image.tmdb.org/t/p/w500/bkSuJKKwVhReSeHwPcYYYJzXtGE.jpg",
    rating: 8.9,
    year: 2023,
    genre: ["Action", "Drama", "Sci-Fi"],
    country: "Korea",
    description:
      "In a world where some people have superpowers, a group of parents with extraordinary abilities try to protect their children from a dangerous organization.",
    type: "tv",
    duration: "55-75 min",
    seasons: 1,
    cast: ["Ryu Seung-ryong", "Han Hyo-joo", "Zo In-sung"],
    episodes: [],
    isAvailable: false,
  },
  {
    id: "gyeongseong-creature",
    title: "Gyeongseong Creature",
    quality: "4K",
    image: "https://image.tmdb.org/t/p/w500/eFaFdJhKvFi2E7tiHnb9rGhvP9P.jpg",
    rating: 7.8,
    year: 2023,
    genre: ["Horror", "Thriller", "Drama"],
    country: "Korea",
    description:
      "In the spring of 1945, two people face a monster born of human greed in Gyeongseong, the old name for Seoul during Japanese occupation.",
    type: "tv",
    duration: "55-70 min",
    seasons: 1,
    cast: ["Park Seo-joon", "Han So-hee"],
    episodes: [],
    isAvailable: false,
  },
  {
    id: "demon-slayer-s4",
    title: "Demon Slayer: Hashira Training Arc",
    quality: "4K",
    image: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    rating: 8.7,
    year: 2024,
    genre: ["Animation", "Action", "Drama"],
    country: "Japan",
    description:
      "Tanjiro and his friends undergo intense training with the Hashira to prepare for the final battle against Muzan Kibutsuji.",
    type: "tv",
    duration: "24 min",
    seasons: 4,
    episodes: [],
    isAvailable: false,
  },
  {
    id: "godzilla-minus-one",
    title: "Godzilla Minus One",
    quality: "4K",
    image: "https://image.tmdb.org/t/p/w500/hkxxMIGaiCTmrEArK7J56JTKUlB.jpg",
    rating: 8.5,
    year: 2023,
    genre: ["Action", "Sci-Fi", "Drama"],
    country: "Japan",
    description:
      "Post-war Japan is at its lowest point when a new crisis emerges in the form of a giant monster.",
    type: "movie",
    duration: "2h 5min",
    director: "Takashi Yamazaki",
    isAvailable: false,
  },
];

export const years = [
  "All",
  "2024",
  "2023",
  "2022",
  "2021",
  "2020",
  "2019",
  "2018",
];
export const countries = ["All", "Korea", "USA", "Japan", "China", "UK"];

export const categories = [
  { id: "tv-series", name: "TV Series", type: "tv" },
  { id: "movies", name: "Movies", type: "movie" },
  { id: "trending", name: "Trending", type: "all" },
  { id: "korean-drama", name: "Korean Drama", type: "tv", country: "Korea" },
  { id: "anime", name: "Anime", type: "tv", country: "Japan" },
];

export function getShowById(id: string): Show | undefined {
  return shows.find((show) => show.id === id);
}

export function getShowsByCategory(category: string): Show[] {
  const cat = categories.find((c) => c.id === category);
  if (!cat) return shows;

  let filtered = shows;
  if (cat.type !== "all") {
    filtered = filtered.filter((show) => show.type === cat.type);
  }
  if (cat.country) {
    filtered = filtered.filter((show) => show.country === cat.country);
  }
  return filtered;
}

export function filterShows(
  showList: Show[],
  genre?: string,
  year?: string,
  country?: string
): Show[] {
  return showList.filter((show) => {
    if (genre && genre !== "All" && !show.genre.includes(genre)) return false;
    if (year && year !== "All" && show.year.toString() !== year) return false;
    if (country && country !== "All" && show.country !== country) return false;
    return true;
  });
}
