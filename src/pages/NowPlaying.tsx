import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/contexts/playerContextCore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  MoreVertical,
  ChevronDown,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const NowPlaying = () => {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    togglePlay,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  if (!currentTrack) {
    navigate("/home");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-blue-800 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:scale-110 transition-transform"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-xs text-white/70 uppercase tracking-wider">
            Playing from
          </p>
          <p className="text-sm font-semibold text-white">Your Music</p>
        </div>
        <button className="text-white hover:scale-110 transition-transform">
          <MoreVertical className="h-6 w-6" />
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-md aspect-square">
          <img
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Track Info */}
      <div className="px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">
              {currentTrack.title}
            </h1>
            <p className="text-base text-white/70 truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>
          <button className="text-white hover:scale-110 transition-transform mt-1">
            <Heart className="h-7 w-7" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-2">
        <Slider
          value={[progress]}
          max={duration || 100}
          step={1}
          onValueChange={([value]) => seekTo(value)}
          className="cursor-pointer"
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/60">
            {formatTime(progress)}
          </span>
          <span className="text-xs text-white/60">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Player Controls */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={toggleShuffle}
            className={cn(
              "text-white/70 hover:text-white transition-colors",
              shuffle && "text-green-500"
            )}
          >
            <Shuffle className="h-6 w-6" />
          </button>

          <button
            onClick={previousTrack}
            className="text-white hover:scale-110 transition-transform"
          >
            <SkipBack className="h-8 w-8 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="bg-white text-black rounded-full p-4 hover:scale-105 transition-transform shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="h-8 w-8 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-white hover:scale-110 transition-transform"
          >
            <SkipForward className="h-8 w-8 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={cn(
              "text-white/70 hover:text-white transition-colors relative",
              repeat !== "off" && "text-green-500"
            )}
          >
            <RepeatIcon className="h-6 w-6" />
            {repeat === "one" && (
              <span className="absolute -top-1 -right-1 text-xs font-bold text-green-500">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="px-6 pb-8">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Volume2 className="h-5 w-5 text-white/60" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value)}
            className="flex-1 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default NowPlaying;
