import { ChevronLeft, ChevronRight, Home as HomeIcon, Search, Bell, Download, X, ExternalLink, Play, CheckCircle2, Eye, Clock } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer } from '@/contexts/playerContextCore';
import { searchVideos, YouTubeVideo } from '@/services/youtubeApi';
import { Skeleton } from '@/components/ui/skeleton';
import HighlightText from '@/components/ui/HighlightText';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  transparent?: boolean;
  bgColor?: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Header = ({ transparent = false, bgColor }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { playTrack } = usePlayer();

  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<YouTubeVideo[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Click outside listener to hide search suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch instant search suggestions with 250ms debounce & cancellation
  const fetchSuggestions = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query.trim()) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setShowSuggestions(true);

    debounceTimerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await searchVideos(query, 5, controller.signal);
        setSuggestions(results.items);
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn('Suggestion search failed:', error);
        }
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 250); // 250ms Debounce
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSuggestions(val);

    if (location.pathname.startsWith('/search')) {
      if (val.trim()) {
        setSearchParams({ q: val });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleSelectSuggestion = (video: YouTubeVideo) => {
    playTrack({
      id: video.id,
      title: video.title,
      artist: video.channelTitle,
      thumbnail: video.thumbnailHigh || video.thumbnail,
      videoId: video.id,
      formattedDuration: video.duration,
      formattedViews: video.formattedViews,
      isVerified: video.isVerified,
    });
    setShowSuggestions(false);
    if (!location.pathname.startsWith('/search')) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (location.pathname.startsWith('/search')) {
      setSearchParams({});
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'R';

  return (
    <>
      <header
        className={cn(
          "w-full h-[76px] bg-[#000000] px-4 sm:px-6 flex items-center justify-between gap-4 z-40 transition-colors duration-300 select-none shrink-0",
          transparent ? "bg-transparent" : "bg-[#000000]"
        )}
        style={bgColor ? { backgroundColor: bgColor } : undefined}
      >
        {/* Left Section: Logo & Nav Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-3xl min-w-0">
          {/* Logo */}
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 p-1 hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
            title="Spotify Home"
          >
            <img src="/favicon.png" alt="Spotify Logo" className="h-10 w-10 object-contain" />
          </button>

          {/* Navigation Pill Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#282828] flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer"
              title="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="w-10 h-10 rounded-full bg-[#121212] hover:bg-[#282828] flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
              title="Go forward"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Circular Home Button */}
            <button
              onClick={() => navigate('/home')}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ml-1",
                location.pathname === '/home' 
                  ? "bg-[#282828] text-white" 
                  : "bg-[#1f1f1f] text-gray-300 hover:text-white hover:bg-[#282828] hover:scale-105"
              )}
              title="Home"
            >
              <HomeIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search Bar Input & Instant Suggestion Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-[160px] max-w-lg">
            <div className="flex items-center w-full bg-[#1f1f1f] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] border border-transparent focus-within:border-white focus-within:ring-1 focus-within:ring-white rounded-full px-4 py-2.5 transition-all group">
              <Search className="h-6 w-6 text-gray-400 group-focus-within:text-white flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(true);
                    if (!location.pathname.startsWith('/search')) {
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    setShowSuggestions(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                placeholder="What do you want to play?"
                className="w-full bg-transparent border-none text-white placeholder-gray-400 text-base px-2.5 focus:outline-none font-medium truncate"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="p-1 rounded-full hover:bg-[#383838] text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Panel */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl overflow-hidden z-50 p-2 space-y-1 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center justify-between">
                  <span>Instant Suggestions</span>
                  {isLoadingSuggestions && <span className="text-[#1fdf64] animate-pulse text-[10px]">Searching...</span>}
                </div>

                {isLoadingSuggestions ? (
                  <div className="space-y-2 p-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded bg-[#282828]" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3.5 w-3/4 bg-[#282828]" />
                          <Skeleton className="h-3 w-1/2 bg-[#282828]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      className="group flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer"
                    >
                      <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-[#282828]">
                        <img
                          src={item.thumbnailHigh || item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-4 w-4 fill-white text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-[#1fdf64]">
                          <HighlightText text={item.title} query={searchQuery} />
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                          {item.isVerified && (
                            <CheckCircle2 className="h-3 w-3 text-[#1d9bf0] shrink-0 fill-[#1d9bf0]/20" />
                          )}
                          <span className="truncate">
                            <HighlightText text={item.channelTitle} query={searchQuery} />
                          </span>
                          {item.formattedViews && (
                            <>
                              <span>•</span>
                              <span>{item.formattedViews}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {item.duration && (
                        <div className="text-xs font-mono text-gray-500 px-2 shrink-0">
                          {item.duration}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-400 font-medium">
                    No matching songs found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Badges & Profile Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
          <button
            onClick={() => setShowInstallModal(true)}
            className="bg-[#121212] hover:bg-[#282828] text-white font-bold text-sm sm:text-base px-4 py-2 rounded-full flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer hidden sm:flex"
            title="Install App"
          >
            <Download className="h-5 w-5 text-white" />
            <span>Install App</span>
          </button>

          <button
            className="w-11 h-11 rounded-full bg-[#121212] hover:bg-[#282828] flex items-center justify-center text-gray-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
            title="What's New"
          >
            <Bell className="h-6 w-6" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center cursor-pointer group focus:outline-none">
                <div className="w-11 h-11 rounded-full bg-[#5394fd] hover:brightness-110 flex items-center justify-center text-black font-extrabold text-base shadow-md transition-all">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#1fdf64] border-2 border-[#000000] rounded-full" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#282828] border-[#383838] text-white p-1.5 rounded-md shadow-xl">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-[#383838] mb-1">
                Account: <span className="text-white">{user?.name || 'User'}</span>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-[#383838] focus:bg-[#383838] rounded px-3 py-2 text-sm flex items-center justify-between font-medium">
                <span>Account Profile</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer hover:bg-[#383838] focus:bg-[#383838] rounded px-3 py-2 text-sm font-medium">
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#383838]" />
              <DropdownMenuItem onClick={logout} className="cursor-pointer hover:bg-[#383838] focus:bg-[#383838] rounded px-3 py-2 text-sm text-red-400 font-medium">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Browser App Install Popup Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#181818] border border-[#282828] text-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 relative select-none">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#282828] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-4">
              <img src="/favicon.png" alt="Spotify Logo" className="h-14 w-14 object-contain shrink-0" />
              <div>
                <h3 className="font-extrabold text-xl text-white">Install Spotify App</h3>
                <p className="text-xs text-gray-400">Stream seamlessly on your desktop & mobile device</p>
              </div>
            </div>

            <p className="text-sm text-gray-300">
              Get our app for fast access to your favorite music, offline playlists, and seamless background playback.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowInstallModal(false)}
                className="px-4 py-2 text-sm font-bold text-gray-300 hover:text-white rounded-full hover:bg-[#282828] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowInstallModal(false);
                  window.open('https://spotify.com/download', '_blank');
                }}
                className="px-5 py-2 text-sm font-bold text-black bg-[#1fdf64] hover:bg-[#22ef6c] rounded-full transition-transform hover:scale-105 cursor-pointer"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
