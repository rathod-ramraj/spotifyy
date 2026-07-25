import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PlaylistCard from "@/components/cards/PlaylistCard";
import RecentPlayCard from "@/components/cards/RecentPlayCard";
import {
  getPopularMusicVideos,
  getVideosByCategory,
  YouTubeVideo,
} from "@/services/youtubeApi";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Dedicated genre-accurate fallback datasets
const GENRE_FALLBACKS: Record<string, YouTubeVideo[]> = {
  pop: [
    {
      id: "pop-1",
      title: "Cruel Summer",
      channelTitle: "Taylor Swift",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      description: "Pop Hits 2024",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "pop-2",
      title: "Blinding Lights",
      channelTitle: "The Weeknd",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      description: "Pop Classic",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "pop-3",
      title: "Houdini",
      channelTitle: "Dua Lipa",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      description: "Radical Optimism",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "pop-4",
      title: "As It Was",
      channelTitle: "Harry Styles",
      thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80",
      description: "Harry's House",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "pop-5",
      title: "Vampire",
      channelTitle: "Olivia Rodrigo",
      thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
      description: "GUTS Album",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "pop-6",
      title: "What Was I Made For?",
      channelTitle: "Billie Eilish",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
      description: "Pop Ballad",
      publishedAt: new Date().toISOString(),
    },
  ],
  hiphop: [
    {
      id: "hiphop-1",
      title: "Not Like Us",
      channelTitle: "Kendrick Lamar",
      thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      description: "Hip-Hop Anthems",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "hiphop-2",
      title: "FE!N (feat. Playboi Carti)",
      channelTitle: "Travis Scott",
      thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80",
      description: "UTOPIA Album",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "hiphop-3",
      title: "First Person Shooter",
      channelTitle: "Drake ft. J. Cole",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      description: "For All The Dogs",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "hiphop-4",
      title: "redrum",
      channelTitle: "21 Savage",
      thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      description: "american dream",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "hiphop-5",
      title: "Like That",
      channelTitle: "Future & Metro Boomin",
      thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80",
      description: "WE DON'T TRUST YOU",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "hiphop-6",
      title: "Houdini",
      channelTitle: "Eminem",
      thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
      description: "The Death of Slim Shady",
      publishedAt: new Date().toISOString(),
    },
  ],
  rock: [
    {
      id: "rock-1",
      title: "Do I Wanna Know?",
      channelTitle: "Arctic Monkeys",
      thumbnail: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&auto=format&fit=crop&q=80",
      description: "AM Album",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "rock-2",
      title: "Rescued",
      channelTitle: "Foo Fighters",
      thumbnail: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80",
      description: "But Here We Are",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "rock-3",
      title: "Black Summer",
      channelTitle: "Red Hot Chili Peppers",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      description: "Unlimited Love",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "rock-4",
      title: "In the End",
      channelTitle: "Linkin Park",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      description: "Hybrid Theory",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "rock-5",
      title: "Bohemian Rhapsody",
      channelTitle: "Queen",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      description: "Rock Classics",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "rock-6",
      title: "Smells Like Teen Spirit",
      channelTitle: "Nirvana",
      thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      description: "Nevermind",
      publishedAt: new Date().toISOString(),
    },
  ],
  electronic: [
    {
      id: "edm-1",
      title: "Miracle",
      channelTitle: "Calvin Harris & Ellie Goulding",
      thumbnail: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
      description: "EDM Anthem",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "edm-2",
      title: "I'm Good (Blue)",
      channelTitle: "David Guetta & Bebe Rexha",
      thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
      description: "Dance Hits",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "edm-3",
      title: "Animals",
      channelTitle: "Martin Garrix",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
      description: "Electronic Dance",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "edm-4",
      title: "Levels",
      channelTitle: "Avicii",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      description: "Electronic Classic",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "edm-5",
      title: "10:35",
      channelTitle: "Tiësto ft. Tate McRae",
      thumbnail: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600&auto=format&fit=crop&q=80",
      description: "Drive Album",
      publishedAt: new Date().toISOString(),
    },
    {
      id: "edm-6",
      title: "(It Goes Like) Nanana",
      channelTitle: "Peggy Gou",
      thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
      thumbnailHigh: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
      description: "House & Dance",
      publishedAt: new Date().toISOString(),
    },
  ],
};

const carouselSections = [
  { id: "popular", title: "Popular right now" },
  { id: "pop", title: "Pop" },
  { id: "hiphop", title: "Hip-Hop" },
  { id: "rock", title: "Rock" },
  { id: "electronic", title: "Electronic" },
];

const Home = () => {
  const navigate = useNavigate();
  const [popularVideos, setPopularVideos] = useState<YouTubeVideo[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<Record<string, YouTubeVideo[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);

  // Refs for horizontal scrolling carousels
  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollCarousel = (id: string, direction: "left" | "right") => {
    const el = carouselRefs.current[id];
    if (el) {
      const scrollAmount = direction === "left" ? -400 : 400;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let popular: YouTubeVideo[] = [];
        try {
          popular = await getPopularMusicVideos(14);
        } catch (err) {
          console.warn("Could not fetch popular videos:", err);
          popular = [];
        }

        setPopularVideos(popular.length > 0 ? popular : GENRE_FALLBACKS.pop);
        setRecentlyPlayed(popular.length > 0 ? popular.slice(0, 6) : GENRE_FALLBACKS.pop.slice(0, 6));

        const categories = [
          { id: "pop", query: "pop music hits 2024" },
          { id: "hiphop", query: "hip hop rap music" },
          { id: "rock", query: "rock music anthems" },
          { id: "electronic", query: "electronic dance edm" },
        ];

        const categoryData: Record<string, YouTubeVideo[]> = {};

        await Promise.allSettled(
          categories.map(async (cat) => {
            try {
              const videos = await getVideosByCategory(cat.query, 10);
              categoryData[cat.id] = videos.length > 0 ? videos : GENRE_FALLBACKS[cat.id];
            } catch {
              categoryData[cat.id] = GENRE_FALLBACKS[cat.id] || GENRE_FALLBACKS.pop;
            }
          })
        );

        setCategoryVideos(categoryData);
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full overflow-y-auto relative text-white bg-[#121212]">
      {/* Background Image with Backdrop Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none"
        style={{ backgroundImage: `url('/bg.jpg')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/75 via-[#121212]/90 to-[#121212] backdrop-blur-sm pointer-events-none" />

      {/* Main Content Area */}
      <div className="relative z-10 p-4 sm:p-6 pb-32 space-y-6">
        {/* Greeting Section */}
        <div className="pt-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {getGreeting()}
          </h1>
        </div>

        {/* Recently Played 2x3 Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-md bg-[#282828]/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {recentlyPlayed.map((video) => (
                <RecentPlayCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </section>

        {/* Carousels: Popular right now, Pop, Hip-Hop, Rock, Electronic */}
        {carouselSections.map((section) => {
          const videos =
            section.id === "popular"
              ? (popularVideos.length > 0 ? popularVideos : GENRE_FALLBACKS.pop)
              : (categoryVideos[section.id] && categoryVideos[section.id].length > 0)
              ? categoryVideos[section.id]
              : GENRE_FALLBACKS[section.id] || GENRE_FALLBACKS.pop;

          return (
            <section key={section.id} className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2
                  className="text-xl sm:text-2xl font-bold hover:underline cursor-pointer tracking-tight"
                  onClick={() => navigate(`/search/${section.id}`)}
                >
                  {section.title}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/search/${section.id}`)}
                    className="text-xs sm:text-sm font-bold text-gray-400 hover:text-white hover:underline transition-colors"
                  >
                    Show all
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => scrollCarousel(section.id, "left")}
                      className="w-7 h-7 rounded-full bg-[#181818] hover:bg-[#282828] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Scroll left"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollCarousel(section.id, "right")}
                      className="w-7 h-7 rounded-full bg-[#181818] hover:bg-[#282828] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Scroll right"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isLoading && videos.length === 0 ? (
                <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-[160px] sm:w-[180px] shrink-0 space-y-3">
                      <Skeleton className="aspect-square rounded-md bg-[#282828]/50" />
                      <Skeleton className="h-4 w-3/4 bg-[#282828]/50" />
                      <Skeleton className="h-3 w-1/2 bg-[#282828]/50" />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  ref={(el) => (carouselRefs.current[section.id] = el)}
                  className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide scroll-smooth"
                >
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="w-[160px] sm:w-[180px] shrink-0"
                    >
                      <PlaylistCard
                        title={video.title}
                        description={video.channelTitle}
                        image={video.thumbnailHigh || video.thumbnail}
                        tracks={[video]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
