import { Library, Plus, Heart, ChevronLeft, ChevronRight, Search, ListFilter, Pin, Music2, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

import { usePlayer } from '@/contexts/playerContextCore';

interface SidebarProps {
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

interface LibraryItem {
  id: string;
  title: string;
  type: string;
  itemCount: string;
  gradient?: string;
  isLiked?: boolean;
  isPinned?: boolean;
  isArtist?: boolean;
  avatar?: string;
  path: string;
}

const Sidebar = ({ isCollapsed: externalCollapsed, setIsCollapsed: externalSetIsCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { likedTracks } = usePlayer();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'playlists' | 'artists'>('all');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const defaultPlaylists: LibraryItem[] = [
    {
      id: 'liked-songs',
      title: 'Liked Songs',
      type: 'Playlist',
      itemCount: `${likedTracks.length} ${likedTracks.length === 1 ? 'song' : 'songs'}`,
      gradient: 'from-[#450af5] via-[#6533ef] to-[#8e8ee5]',
      isLiked: true,
      isPinned: true,
      path: '/library/liked',
    },
    {
      id: 'top-hits',
      title: 'Top Hits 2024',
      type: 'Playlist',
      itemCount: '32 songs',
      gradient: 'from-[#ff4e50] to-[#f9d423]',
      path: '/search/pop',
    },
    {
      id: 'chill-vibes',
      title: 'Chill Lofi & Beats',
      type: 'Playlist',
      itemCount: '18 songs',
      gradient: 'from-[#00c6ff] to-[#0072ff]',
      path: '/search/chill',
    },
    {
      id: 'hip-hop-central',
      title: 'Hip-Hop Central',
      type: 'Playlist',
      itemCount: '50 songs',
      gradient: 'from-[#f857a6] to-[#ff5858]',
      path: '/search/hiphop',
    },
    {
      id: 'rock-classics',
      title: 'Rock Classics',
      type: 'Playlist',
      itemCount: '25 songs',
      gradient: 'from-[#43e97b] to-[#38f9d7]',
      path: '/search/rock',
    },
  ];

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = () => {
    if (externalSetIsCollapsed) {
      externalSetIsCollapsed(!isCollapsed);
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const filteredItems = defaultPlaylists.filter((item) => {
    if (activeFilter === 'playlists' && item.isArtist) return false;
    if (activeFilter === 'artists' && !item.isArtist) return false;
    if (searchQuery.trim()) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#121212] rounded-lg overflow-hidden transition-all duration-300 select-none shrink-0",
        isCollapsed ? "w-[72px]" : "w-[280px] lg:w-[320px]"
      )}
    >
      {/* Library Section Header */}
      <div className="p-3 sm:p-4 flex items-center justify-between border-b border-[#1f1f1f]/50">
        <Link
          to="/library"
          className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
        >
          <Library className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-sm sm:text-base text-gray-300 group-hover:text-white transition-colors">
              Your Library
            </span>
          )}
        </Link>

        <div className="flex items-center gap-1">
          {!isCollapsed && (
            <button
              className="p-1.5 rounded-full hover:bg-[#282828] text-gray-400 hover:text-white transition-colors"
              title="Create playlist or folder"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-full hover:bg-[#282828] text-gray-400 hover:text-white transition-colors"
            title={isCollapsed ? "Expand Library" : "Collapse Library"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Filter Pills & Toolbar (Shown when expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-2 space-y-3 border-b border-[#1f1f1f]/30">
          {/* Pills: Playlists, Artists */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="w-7 h-7 rounded-full bg-[#282828] hover:bg-[#333333] text-gray-300 flex items-center justify-center text-xs shrink-0"
                title="Clear filter"
              >
                ✕
              </button>
            )}
            <button
              onClick={() => setActiveFilter(activeFilter === 'playlists' ? 'all' : 'playlists')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
                activeFilter === 'playlists'
                  ? "bg-white text-black"
                  : "bg-[#282828] text-white hover:bg-[#333333]"
              )}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveFilter(activeFilter === 'artists' ? 'all' : 'artists')}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
                activeFilter === 'artists'
                  ? "bg-white text-black"
                  : "bg-[#282828] text-white hover:bg-[#333333]"
              )}
            >
              Artists
            </button>
          </div>

          {/* Search Icon & Recents Filter Bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 px-1">
            {showSearchInput ? (
              <div className="flex items-center gap-1 bg-[#1f1f1f] rounded-md px-2 py-1 w-full">
                <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search in Your Library"
                  className="w-full bg-transparent text-white text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-1 rounded-full hover:bg-[#282828] hover:text-white transition-colors"
                  title="Search in Your Library"
                >
                  <Search className="h-4 w-4" />
                </button>
                <button className="flex items-center gap-1 hover:text-white transition-colors font-medium cursor-pointer">
                  <span>Recents</span>
                  <ListFilter className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Library List Items */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {filteredItems.map((item) => {
          const isActive = location.pathname === `/library/${item.id}`;
          return (
            <Link
              key={item.id}
              to={item.path || (item.id === 'liked-songs' ? '/library/liked' : `/search/${item.id}`)}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer group",
                isActive ? "bg-[#282828]" : "hover:bg-[#1f1f1f]"
              )}
              title={isCollapsed ? item.title : undefined}
            >
              {/* Thumbnail Icon/Image */}
              <div
                className={cn(
                  "w-12 h-12 shrink-0 flex items-center justify-center shadow-md relative overflow-hidden",
                  item.isArtist ? "rounded-full" : "rounded-md",
                  item.gradient ? `bg-gradient-to-br ${item.gradient}` : "bg-[#282828]"
                )}
              >
                {item.isLiked ? (
                  <Heart className="h-5 w-5 text-white fill-white" />
                ) : item.avatar ? (
                  <img src={item.avatar} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="h-5 w-5 text-white/80" />
                )}
              </div>

              {/* Text Meta (When Expanded) */}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="font-semibold text-sm text-white group-hover:text-white truncate">
                      {item.title}
                    </p>
                    {item.isPinned && (
                      <Pin className="h-3 w-3 text-[#1fdf64] rotate-45 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {item.isLiked ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1fdf64]" />
                        <span>{item.type} • {item.itemCount}</span>
                      </span>
                    ) : (
                      `${item.type} ${item.itemCount !== 'Artist' ? `• ${item.itemCount}` : ''}`
                    )}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
