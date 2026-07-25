import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  ListMusic,
  Laptop2,
  Heart,
  Music2,
} from "lucide-react";
import { usePlayer } from "@/contexts/playerContextCore";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const NowPlayingBar = () => {
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
    toggleLikeTrack,
    isLiked,
  } = usePlayer();

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  // Fallback demo track if no track is active yet
  const activeTrack = currentTrack || {
    id: "demo-1",
    title: "Ready to play",
    artist: "Choose a track from Library or Search",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80",
    videoId: "demo-1",
  };

  const trackIsLiked = isLiked(activeTrack.id);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between z-50 text-white select-none">
      {/* Left Track Info */}
      <div className="flex items-center gap-3 w-[30%] min-w-[180px] max-w-[320px]">
        <div
          className="relative w-14 h-14 rounded overflow-hidden shrink-0 bg-[#282828] cursor-pointer group"
          onClick={() => navigate("/now-playing")}
        >
          {activeTrack.thumbnail ? (
            <img
              src={activeTrack.thumbnail}
              alt={activeTrack.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music2 className="h-6 w-6 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <p
            onClick={() => navigate("/now-playing")}
            className="font-semibold text-sm truncate text-white hover:underline cursor-pointer"
          >
            {activeTrack.title}
          </p>
          <p className="text-xs text-gray-400 truncate hover:underline hover:text-white cursor-pointer mt-0.5">
            {activeTrack.artist}
          </p>
        </div>

        <button
          onClick={() => toggleLikeTrack(activeTrack)}
          className="text-gray-400 hover:text-white transition-colors p-1 shrink-0 ml-1 cursor-pointer"
          title={trackIsLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
        >
          <Heart className={cn("h-4 w-4", trackIsLiked && "fill-[#1fdf64] text-[#1fdf64]")} />
        </button>
      </div>

      {/* Center Player Controls & Hover Accent Progress Bar */}
      <div className="flex flex-col items-center gap-1.5 w-[40%] max-w-[680px]">
        {/* Controls Row */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className={cn(
              "text-gray-400 hover:text-white transition-colors p-1 hidden sm:block",
              shuffle && "text-[#1fdf64] hover:text-[#1fdf64]"
            )}
            title="Enable shuffle"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            onClick={previousTrack}
            className="text-gray-300 hover:text-white transition-colors p-1"
            title="Previous track"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 transition-transform flex items-center justify-center text-black shadow-md cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-black text-black" />
            ) : (
              <Play className="h-4 w-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-gray-300 hover:text-white transition-colors p-1"
            title="Next track"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={cn(
              "text-gray-400 hover:text-white transition-colors p-1 hidden sm:block relative",
              repeat !== "off" && "text-[#1fdf64] hover:text-[#1fdf64]"
            )}
            title="Enable repeat"
          >
            <RepeatIcon className="h-4 w-4" />
            {repeat === "one" && (
              <span className="absolute -top-1 -right-1 text-[9px] font-bold text-[#1fdf64]">
                1
              </span>
            )}
          </button>
        </div>

        {/* Hover Accent Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-[600px] px-2">
          <span className="text-[11px] text-gray-400 min-w-[32px] text-right font-mono">
            {formatTime(progress)}
          </span>
          <div className="flex-1 group py-1 relative cursor-pointer">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={([value]) => seekTo(value)}
              className="cursor-pointer font-bold"
            />
          </div>
          <span className="text-[11px] text-gray-400 min-w-[32px] font-mono">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right Volume & Utility Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
        <button
          className="text-gray-400 hover:text-white transition-colors hidden md:block"
          title="Queue"
        >
          <ListMusic className="h-4 w-4" />
        </button>

        <button
          className="text-gray-400 hover:text-white transition-colors hidden md:block"
          title="Connect to a device"
        >
          <Laptop2 className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 hidden sm:flex">
          <button
            onClick={() => setVolume(volume === 0 ? 50 : 0)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title={volume === 0 ? "Unmute" : "Mute"}
          >
            <VolumeIcon className="h-4 w-4" />
          </button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value)}
            className="w-20 lg:w-24 cursor-pointer"
          />
        </div>

        <button
          onClick={() => navigate("/now-playing")}
          className="text-gray-400 hover:text-white transition-colors hidden lg:block"
          title="Full screen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;
