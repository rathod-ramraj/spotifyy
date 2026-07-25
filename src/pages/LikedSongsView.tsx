import { Play, Pause, Heart, Clock3, Music2, Trash2 } from 'lucide-react';
import { usePlayer, Track } from '@/contexts/playerContextCore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LikedSongsView = () => {
  const navigate = useNavigate();
  const { likedTracks, toggleLikeTrack, playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const isCurrentPlaylistPlaying =
    isPlaying && currentTrack && likedTracks.some((t) => t.id === currentTrack.id);

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return;
    if (isCurrentPlaylistPlaying) {
      togglePlay();
    } else {
      playTrack(likedTracks[0]);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#121212] text-white p-4 sm:p-6 pb-32 space-y-6 select-none">
      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-4 pb-2">
        <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-md bg-gradient-to-br from-[#450af5] via-[#6533ef] to-[#8e8ee5] flex items-center justify-center shadow-2xl shrink-0">
          <Heart className="h-24 w-24 text-white fill-white" />
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-300">
            Playlist
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Liked Songs
          </h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-300 font-semibold pt-1">
            <span className="text-white">Your Library</span>
            <span>•</span>
            <span className="text-white">{likedTracks.length} {likedTracks.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center gap-4 py-2 border-b border-[#282828]/60">
        <button
          onClick={handlePlayAll}
          disabled={likedTracks.length === 0}
          className={cn(
            "w-14 h-14 rounded-full bg-[#1fdf64] text-black shadow-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer",
            likedTracks.length === 0 && "opacity-50 cursor-not-allowed hover:scale-100"
          )}
          title="Play Liked Songs"
        >
          {isCurrentPlaylistPlaying ? (
            <Pause className="h-6 w-6 fill-black text-black" />
          ) : (
            <Play className="h-6 w-6 fill-black text-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Track Table / List */}
      {likedTracks.length > 0 ? (
        <div className="space-y-1 pt-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-2 text-xs font-bold text-gray-400 border-b border-[#282828] mb-2 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-7 sm:col-span-8">Title</div>
            <div className="col-span-4 sm:col-span-3 text-right flex items-center justify-end gap-1">
              <Clock3 className="h-4 w-4" />
            </div>
          </div>

          {/* Track Rows */}
          {likedTracks.map((track, idx) => {
            const isSelected = currentTrack?.id === track.id;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className={cn(
                  "grid grid-cols-12 items-center px-4 py-2.5 rounded-md hover:bg-[#282828] transition-colors cursor-pointer group",
                  isSelected && "bg-[#282828]"
                )}
              >
                {/* Index / Play indicator */}
                <div className="col-span-1 text-sm font-semibold text-gray-400 group-hover:text-white">
                  {isSelected && isPlaying ? (
                    <span className="text-[#1fdf64] font-bold">▶</span>
                  ) : (
                    idx + 1
                  )}
                </div>

                {/* Track Title & Artist */}
                <div className="col-span-7 sm:col-span-8 flex items-center gap-3 min-w-0">
                  <img
                    src={track.thumbnail}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover shrink-0 bg-[#181818]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-bold text-sm truncate", isSelected ? "text-[#1fdf64]" : "text-white")}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{track.artist}</p>
                  </div>
                </div>

                {/* Like Toggle & Actions */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track);
                    }}
                    className="text-[#1fdf64] hover:scale-110 transition-transform p-1"
                    title="Remove from Liked Songs"
                  >
                    <Heart className="h-4 w-4 fill-[#1fdf64]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track);
                    }}
                    className="text-gray-400 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#181818] mx-auto flex items-center justify-center text-gray-400">
            <Music2 className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Songs you like will appear here</h3>
            <p className="text-sm text-gray-400">Save songs by tapping the heart icon anywhere in Spotify.</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="bg-white hover:bg-gray-200 text-black font-bold text-sm px-6 py-2.5 rounded-full transition-transform hover:scale-105 mt-2 cursor-pointer"
          >
            Find songs
          </button>
        </div>
      )}
    </div>
  );
};

export default LikedSongsView;
