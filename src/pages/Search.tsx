import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Eye, Clock, Music } from 'lucide-react';
import CategoryCard from '@/components/cards/CategoryCard';
import TrackCard from '@/components/cards/TrackCard';
import PlaylistCard from '@/components/cards/PlaylistCard';
import { searchVideos, YouTubeVideo, musicCategories } from '@/services/youtubeApi';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayer } from '@/contexts/playerContextCore';
import HighlightText from '@/components/ui/HighlightText';
import { cn } from '@/lib/utils';

const categoryColors = [
  '#E13300', '#1E3264', '#8C1932', '#E8115B', '#BC5900',
  '#608108', '#0D73EC', '#477D95', '#503750', '#AF2896',
  '#148A08', '#E91429', '#27856A', '#A56752', '#7358FF',
  '#1D3164', '#BA5D07', '#777777', '#509BF5', '#E1118C',
];

const SearchPage = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const queryFromUrl = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await searchVideos(searchQuery, 30, controller.signal);
      setSearchResults(results.items);
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search failed:', error);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Sync search execution with URL query parameter
  useEffect(() => {
    if (queryFromUrl) {
      performSearch(queryFromUrl);
    } else if (category) {
      const cat = musicCategories.find((c) => c.id === category);
      if (cat) {
        performSearch(cat.query);
      }
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    }
  }, [queryFromUrl, category, performSearch]);

  const topResult = searchResults[0];
  const songResults = searchResults.slice(1, 6);
  const gridResults = searchResults.slice(6);

  const handlePlayTopResult = () => {
    if (topResult) {
      playTrack({
        id: topResult.id,
        title: topResult.title,
        artist: topResult.channelTitle,
        thumbnail: topResult.thumbnailHigh || topResult.thumbnail,
        videoId: topResult.id,
        formattedDuration: topResult.duration,
        formattedViews: topResult.formattedViews,
        isVerified: topResult.isVerified,
        albumThumbnail: topResult.albumThumbnail || topResult.thumbnailHigh || topResult.thumbnail,
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#121212] text-white p-4 sm:p-6 pb-32 space-y-6 select-none">
      {hasSearched ? (
        <div className="space-y-8">
          {/* Loading Skeleton */}
          {isSearching ? (
            <div className="space-y-6">
              <Skeleton className="h-8 w-48 bg-[#282828]" />
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Skeleton className="lg:col-span-2 h-[260px] rounded-lg bg-[#282828]" />
                <div className="lg:col-span-3 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded bg-[#282828]" />
                  ))}
                </div>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {/* Split Presentation: Top Result & Songs List */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Column (2-span): Highest Ranked Top Result Card */}
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Top result</h2>
                  {topResult && (
                    <div
                      onClick={handlePlayTopResult}
                      className="bg-[#181818] hover:bg-[#282828] p-5 rounded-xl relative group flex flex-col justify-between transition-all duration-300 cursor-pointer h-[260px] sm:h-[280px] shadow-xl border border-[#282828]/60"
                    >
                      {/* Album Art / High-Res Thumbnail */}
                      <div className="relative w-28 h-28 rounded-lg shadow-2xl overflow-hidden bg-[#282828]">
                        <img
                          src={topResult.thumbnailHigh || topResult.thumbnail}
                          alt={topResult.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Title & Metadata */}
                      <div className="space-y-2 mt-3">
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white line-clamp-1 group-hover:underline tracking-tight">
                          <HighlightText text={topResult.title} query={queryFromUrl} />
                        </h3>

                        <div className="flex items-center gap-2 flex-wrap text-sm text-gray-300 font-medium">
                          <span className="bg-[#000000]/70 text-xs px-3 py-1 rounded-full text-white font-bold tracking-wide border border-white/10">
                            Song
                          </span>

                          <div className="flex items-center gap-1.5 line-clamp-1">
                            {topResult.isVerified && (
                              <span title="Verified Artist" className="inline-flex items-center shrink-0">
                                <CheckCircle2 className="h-4 w-4 text-[#1d9bf0] fill-[#1d9bf0]/20" />
                              </span>
                            )}
                            <span className="font-semibold text-gray-200">
                              <HighlightText text={topResult.channelTitle} query={queryFromUrl} />
                            </span>
                          </div>

                          {topResult.formattedViews && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-xs text-gray-400 font-normal flex items-center gap-1">
                                <Eye className="h-3 w-3 text-gray-500" />
                                {topResult.formattedViews}
                              </span>
                            </>
                          )}

                          {topResult.duration && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-xs text-gray-400 font-mono flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-500" />
                                {topResult.duration}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Floating Green Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayTopResult();
                        }}
                        className="w-13 h-13 rounded-full bg-[#1fdf64] hover:bg-[#22ef6c] text-black shadow-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105 opacity-0 group-hover:opacity-100 absolute bottom-5 right-5 cursor-pointer"
                        title="Play"
                      >
                        <Play className="h-6 w-6 fill-black text-black ml-0.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Column (3-span): Songs List */}
                <div className="lg:col-span-3 space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Songs</h2>
                  <div className="space-y-1">
                    {songResults.map((video, idx) => (
                      <TrackCard
                        key={video.id}
                        video={video}
                        index={idx + 1}
                        showIndex
                        searchQuery={queryFromUrl}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Category Playlists & Featured Videos */}
              {gridResults.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Featuring</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {gridResults.map((video) => (
                      <PlaylistCard
                        key={video.id}
                        title={video.title}
                        description={video.channelTitle}
                        image={video.thumbnailHigh || video.thumbnail}
                        tracks={[video]}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Music className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-xl font-extrabold text-white">No results found for "{queryFromUrl}"</p>
              <p className="text-sm text-gray-400 max-w-md mx-auto">
                Please make sure your words are spelled correctly or try searching for another track or artist.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Default Browse All View */
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {musicCategories.map((cat, index) => (
              <CategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                color={categoryColors[index % categoryColors.length]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
