import { Play, MoreHorizontal, Heart, CheckCircle2, Eye, Clock } from 'lucide-react';
import { usePlayer } from '@/contexts/playerContextCore';
import { YouTubeVideo } from '@/services/youtubeApi';
import { cn } from '@/lib/utils';
import HighlightText from '@/components/ui/HighlightText';

interface TrackCardProps {
  video: YouTubeVideo;
  index?: number;
  showIndex?: boolean;
  searchQuery?: string;
}

const TrackCard = ({ video, index, showIndex, searchQuery = '' }: TrackCardProps) => {
  const { playTrack, currentTrack, isPlaying, toggleLikeTrack, isLiked } = usePlayer();

  const trackObj = {
    id: video.id,
    title: video.title,
    artist: video.channelTitle,
    thumbnail: video.thumbnailHigh || video.thumbnail,
    videoId: video.id,
    formattedDuration: video.duration,
    formattedViews: video.formattedViews,
    isVerified: video.isVerified,
    albumThumbnail: video.albumThumbnail || video.thumbnailHigh || video.thumbnail,
  };

  const isCurrentTrack = currentTrack?.videoId === video.id || currentTrack?.id === video.id;
  const trackIsLiked = isLiked(video.id);

  const handlePlay = () => {
    playTrack(trackObj);
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-md hover:bg-[#282828] transition-colors cursor-pointer border border-transparent hover:border-[#383838]/50",
        isCurrentTrack && "bg-[#282828]"
      )}
      onClick={handlePlay}
    >
      {/* Index / Equalizer / Play Button */}
      <div className="w-5 flex items-center justify-center shrink-0">
        {showIndex && (
          <>
            <span className={cn(
              "text-xs font-semibold text-gray-400 group-hover:hidden",
              isCurrentTrack && "text-[#1fdf64]"
            )}>
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <div className="w-1 bg-[#1fdf64] animate-equalizer" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 bg-[#1fdf64] animate-equalizer" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 bg-[#1fdf64] animate-equalizer" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                index
              )}
            </span>
            <Play className="h-4 w-4 hidden group-hover:block fill-white text-white" />
          </>
        )}
        {!showIndex && (
          <Play className={cn(
            "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity fill-white text-white",
            isCurrentTrack && "opacity-100 fill-[#1fdf64] text-[#1fdf64]"
          )} />
        )}
      </div>

      {/* Album Thumbnail */}
      <div className="relative w-11 h-11 rounded overflow-hidden shrink-0 bg-[#181818] shadow-md">
        <img
          src={video.thumbnailHigh || video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Track Title & Artist Info */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn(
          "font-semibold text-sm truncate leading-tight",
          isCurrentTrack ? "text-[#1fdf64]" : "text-white group-hover:text-white"
        )}>
          <HighlightText text={video.title} query={searchQuery} />
        </p>
        
        <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
          {video.isVerified && (
            <span title="Verified Artist" className="inline-flex items-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1d9bf0] fill-[#1d9bf0]/20" />
            </span>
          )}
          <span className="truncate hover:underline hover:text-gray-200">
            <HighlightText text={video.channelTitle} query={searchQuery} />
          </span>
          {video.formattedViews && (
            <>
              <span className="text-gray-600">•</span>
              <span className="flex items-center gap-1 text-gray-400 shrink-0">
                <Eye className="h-3 w-3 text-gray-500" />
                {video.formattedViews}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Duration Badge */}
      {video.duration && (
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 font-mono shrink-0 px-2">
          <Clock className="h-3 w-3 text-gray-500" />
          <span>{video.duration}</span>
        </div>
      )}

      {/* Like Button */}
      <button
        className={cn(
          "transition-opacity p-1.5 cursor-pointer shrink-0",
          trackIsLiked ? "opacity-100 text-[#1fdf64]" : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          toggleLikeTrack(trackObj);
        }}
        title={trackIsLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
      >
        <Heart className={cn("h-4 w-4", trackIsLiked && "fill-[#1fdf64]")} />
      </button>

      {/* More Options */}
      <button 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white p-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TrackCard;
