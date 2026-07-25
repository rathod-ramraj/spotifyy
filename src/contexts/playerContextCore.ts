import { createContext, useContext } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId?: string;
  audioUrl?: string;
  duration?: number;
  formattedDuration?: string;
  formattedViews?: string;
  isVerified?: boolean;
  albumThumbnail?: string;
}

export interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  likedTracks: Track[];
  toggleLikeTrack: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
}

export const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
