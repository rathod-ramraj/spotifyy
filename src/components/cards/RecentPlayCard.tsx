import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/playerContextCore';
import { YouTubeVideo } from '@/services/youtubeApi';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { getRandomColor } from '@/lib/cardColors';

interface RecentPlayCardProps {
  video: YouTubeVideo;
}

const RecentPlayCard = ({ video }: RecentPlayCardProps) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const backgroundColor = useMemo(() => getRandomColor(), []);

  const isCurrentTrack = currentTrack?.videoId === video.id;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack({
        id: video.id,
        title: video.title,
        artist: video.channelTitle,
        thumbnail: video.thumbnail,
        videoId: video.id,
      });
    }
  };

  return (
    <div 
      className={cn(
        "group flex items-center justify-between gap-3 rounded-md overflow-hidden transition-all duration-300 cursor-pointer animate-fade-in hover:bg-white/10 relative pr-4",
        isCurrentTrack && "bg-white/10"
      )}
      style={{ backgroundColor: `${backgroundColor}25` }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-14 h-14 sm:w-16 sm:h-16 object-cover shrink-0 shadow-md"
        />
        <span className="font-bold text-sm sm:text-base text-white truncate pr-2">
          {video.title}
        </span>
      </div>

      <button 
        className={cn(
          "w-11 h-11 rounded-full bg-[#1fdf64] hover:bg-[#22ef6c] flex items-center justify-center text-black shadow-xl transition-all duration-200 cursor-pointer shrink-0",
          "opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 hover:scale-105",
          isCurrentTrack && isPlaying && "opacity-100 translate-y-0"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        title="Play"
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-5 w-5 fill-black text-black" />
        ) : (
          <Play className="h-5 w-5 fill-black text-black ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default RecentPlayCard;
