import { useState } from 'react';
import { Search, List, Grid3X3, Plus, Heart, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'playlists' | 'artists' | 'albums' | 'podcasts';
type ViewType = 'list' | 'grid';

const Library = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [view, setView] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'playlists', label: 'Playlists' },
    { value: 'artists', label: 'Artists' },
    { value: 'albums', label: 'Albums' },
    { value: 'podcasts', label: 'Podcasts & Shows' },
  ];

  // Mock library items
  const libraryItems = [
    {
      id: 'liked',
      title: 'Liked Songs',
      type: 'Playlist',
      icon: Heart,
      gradient: 'from-indigo-700 to-muted-foreground',
      songCount: 0,
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 pb-32 space-y-6">
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Library</h1>
          <button className="p-2 rounded-full hover:bg-accent transition-colors">
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground hover:bg-accent"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in Your Library"
              className="w-full bg-transparent border-0 pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Recents</span>
            <div className="flex gap-1">
              <button
                onClick={() => setView('list')}
                className={cn(
                  "p-2 rounded transition-colors",
                  view === 'list' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={cn(
                  "p-2 rounded transition-colors",
                  view === 'grid' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Library Content */}
        <div className={cn(
          view === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            : "space-y-2"
        )}>
          {libraryItems.map((item) => (
            view === 'grid' ? (
              <div
                key={item.id}
                className="spotify-card animate-fade-in"
              >
                <div className={cn(
                  "aspect-square rounded-md mb-4 flex items-center justify-center bg-gradient-to-br",
                  item.gradient
                )}>
                  <item.icon className="h-12 w-12 text-foreground fill-foreground" />
                </div>
                <h3 className="font-bold truncate">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.type}</p>
              </div>
            ) : (
              <div
                key={item.id}
                className="flex items-center gap-4 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer animate-fade-in"
              >
                <div className={cn(
                  "w-12 h-12 rounded flex items-center justify-center bg-gradient-to-br shrink-0",
                  item.gradient
                )}>
                  <item.icon className="h-5 w-5 text-foreground fill-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.type} • {item.songCount} songs
                  </p>
                </div>
              </div>
            )
          ))}

          {/* Empty State / Create Playlist Prompt */}
          <div className={cn(
            "flex items-center justify-center p-8",
            view === 'grid' ? "col-span-full" : ""
          )}>
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center">
                <Music className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Create your first playlist</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  It's easy, we'll help you
                </p>
              </div>
              <button className="spotify-button-primary">
                Create playlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
