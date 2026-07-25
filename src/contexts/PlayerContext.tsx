import React, { useState, useRef, useCallback, useEffect } from 'react';
import { getVideoDetails, searchVideos } from '@/services/youtubeApi';
import {
  PlayerContext,
  usePlayer,
  type Track,
  type PlayerContextType,
} from './playerContextCore';

interface YTPlayerInstance {
  loadVideoById: (options: string | { videoId: string; startSeconds?: number }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  unMute: () => void;
  mute: () => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
}

interface YTEvent {
  target: YTPlayerInstance;
  data: number;
}

const PLAYER_STATE_KEY = 'spotify_player_persistent_state';

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: unknown) => YTPlayerInstance;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const savedState = (() => {
    try {
      const raw = localStorage.getItem(PLAYER_STATE_KEY);
      return raw ? (JSON.parse(raw) as Partial<PlayerContextType>) : null;
    } catch {
      return null;
    }
  })();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(savedState?.currentTrack || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState<number>(savedState?.volume ?? 100);
  const [progress, setProgress] = useState<number>(savedState?.progress || 0);
  const [duration, setDuration] = useState<number>(savedState?.duration || 180);
  const [queue, setQueue] = useState<Track[]>(savedState?.queue || []);
  const [shuffle, setShuffle] = useState<boolean>(savedState?.shuffle || false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>(savedState?.repeat || 'off');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentTrackRef = useRef(currentTrack);
  const queueRef = useRef(queue);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const volumeRef = useRef(volume);
  const playTrackRef = useRef<(track: Track) => void>(() => {});
  const nextTrackRef = useRef<() => void>(() => {});

  useEffect(() => {
    currentTrackRef.current = currentTrack;
    queueRef.current = queue;
    repeatRef.current = repeat;
    shuffleRef.current = shuffle;
    volumeRef.current = volume;
  }, [currentTrack, queue, repeat, shuffle, volume]);

  useEffect(() => {
    try {
      localStorage.setItem(
        PLAYER_STATE_KEY,
        JSON.stringify({
          currentTrack,
          volume,
          progress,
          duration,
          queue,
          shuffle,
          repeat,
        })
      );
    } catch (e) {
      console.warn('Player state saving error:', e);
    }
  }, [currentTrack, volume, progress, duration, queue, shuffle, repeat]);

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('spotify_liked_tracks');
      return saved ? (JSON.parse(saved) as Track[]) : [];
    } catch {
      return [];
    }
  });

  const toggleLikeTrack = useCallback((track: Track) => {
    setLikedTracks(prev => {
      const exists = prev.some(t => t.id === track.id || (t.videoId && t.videoId === track.videoId));
      if (exists) {
        return prev.filter(t => t.id !== track.id && t.videoId !== track.videoId);
      } else {
        return [track, ...prev];
      }
    });
  }, []);

  const isLiked = useCallback(
    (trackId: string) => {
      return likedTracks.some(t => t.id === trackId || t.videoId === trackId);
    },
    [likedTracks]
  );

  const stopProgressLoop = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startProgressLoop = useCallback(() => {
    stopProgressLoop();
    progressInterval.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        const totalDuration = playerRef.current.getDuration() || 180;
        setProgress(currentTime);
        if (totalDuration > 0) setDuration(totalDuration);
      }
    }, 1000);
  }, [stopProgressLoop]);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      nextTrackRef.current();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  // Fix 1: Load YouTube IFrame API script
  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;

    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
    };

    return () => {
      window.onYouTubeIframeAPIReady = () => {};
    };
  }, []);

  useEffect(() => {
    if (queue.length > 0 && queue[0].videoId) {
      getVideoDetails(queue[0].videoId).catch(() => {
        /* ignore */
      });
    }
  }, [queue]);

  const initPlayer = useCallback(
    (videoId: string, startSec: number = 0) => {
      // Fix 2: Log if YT API not loaded
      if (!window.YT || !window.YT.Player) {
        console.log("YT API not loaded");
        return;
      }

      if (playerRef.current) {
        if (typeof playerRef.current.loadVideoById === 'function') {
          try {
            playerRef.current.loadVideoById({
              videoId: videoId,
              startSeconds: startSec,
            });
            playerRef.current.unMute();
            playerRef.current.setVolume(volumeRef.current || 100);
            playerRef.current.playVideo();
          } catch (e) {
            console.warn('loadVideoById warning:', e);
          }
          setIsPlaying(true);
          startProgressLoop();
          return;
        }
      }

      let playerDiv = document.getElementById('yt-player');
      if (!playerDiv) {
        playerDiv = document.createElement('div');
        playerDiv.id = 'yt-player';
        playerDiv.style.position = 'fixed';
        playerDiv.style.bottom = '0';
        playerDiv.style.right = '0';
        playerDiv.style.width = '1px';
        playerDiv.style.height = '1px';
        playerDiv.style.opacity = '0.01';
        playerDiv.style.pointerEvents = 'none';
        playerDiv.style.zIndex = '1';
        document.body.appendChild(playerDiv);
      }

      try {
        playerRef.current = new window.YT.Player('yt-player', {
          height: '1',
          width: '1',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            enablejsapi: 1,
            origin: window.location.origin,
            start: Math.floor(startSec),
          },
          events: {
            // Fix 4: Print Player Ready in onReady
            onReady: (event: YTEvent) => {
              console.log("Player Ready");
              try {
                event.target.unMute();
                event.target.setVolume(volumeRef.current || 100);
                if (startSec > 0 && typeof event.target.seekTo === 'function') {
                  event.target.seekTo(startSec, true);
                }
                event.target.playVideo();
              } catch (e) {
                console.warn(e);
              }
              setIsPlaying(true);
              startProgressLoop();
            },
            // Fix 4: Print Player State in onStateChange
            onStateChange: (event: YTEvent) => {
              console.log("Player State", event.data);
              if (event.data === window.YT.PlayerState.PLAYING) {
                try {
                  event.target.unMute();
                  event.target.setVolume(volumeRef.current || 100);
                } catch (e) {
                  console.warn(e);
                }
                setIsPlaying(true);
                const dur = playerRef.current?.getDuration() || 180;
                setDuration(dur);
                startProgressLoop();
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                stopProgressLoop();
              } else if (event.data === window.YT.PlayerState.ENDED) {
                setIsPlaying(false);
                stopProgressLoop();
                nextTrackRef.current();
              }
            },
            // Fix 4: Print Player Error in onError
            onError: (event: YTEvent) => {
              console.log("Player Error", event.data);
              nextTrackRef.current();
            },
          },
        });
      } catch (e) {
        console.error('Player initialization error:', e);
      }
    },
    [startProgressLoop, stopProgressLoop]
  );

  const playTrackInternal = useCallback(
    async (track: Track) => {
      let targetTrack = track;

      if (!targetTrack.videoId && !targetTrack.audioUrl) {
        try {
          const searchRes = await searchVideos(`${targetTrack.title} ${targetTrack.artist}`, 5, undefined, targetTrack.artist);
          if (searchRes.items.length > 0) {
            const topResult = searchRes.items[0];
            targetTrack = {
              ...targetTrack,
              videoId: topResult.id,
              audioUrl: topResult.audioUrl,
              thumbnail: topResult.thumbnailHigh || topResult.thumbnail,
              formattedDuration: topResult.duration,
              formattedViews: topResult.formattedViews,
              isVerified: topResult.isVerified,
            };
          }
        } catch (e) {
          console.warn('Failed to resolve track video ID:', e);
        }
      }

      setCurrentTrack(targetTrack);
      setIsPlaying(true);
      setProgress(0);

      if (targetTrack.audioUrl) {
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          try {
            playerRef.current.pauseVideo();
          } catch {
            /* ignore */
          }
        }
        stopProgressLoop();

        if (audioRef.current) {
          audioRef.current.src = targetTrack.audioUrl;
          audioRef.current.volume = volumeRef.current / 100;
          audioRef.current.play().catch(e => console.warn('Audio playback error:', e));
        }
        return;
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const videoId = targetTrack.videoId || targetTrack.id;

      // Fix 3: Log videoId, track, and YT before calling initPlayer
      console.log({
        videoId,
        track: targetTrack,
        YT: window.YT
      });

      initPlayer(videoId);
    },
    [initPlayer, stopProgressLoop]
  );

  useEffect(() => {
    playTrackRef.current = playTrackInternal;
  }, [playTrackInternal]);

  const nextTrack = useCallback(() => {
    const activeRepeat = repeatRef.current;
    const activeCurrentTrack = currentTrackRef.current;
    const activeQueue = queueRef.current;
    const activeShuffle = shuffleRef.current;

    if (activeRepeat === 'one' && activeCurrentTrack) {
      playTrackRef.current(activeCurrentTrack);
      return;
    }

    if (activeQueue.length > 0) {
      let nextIndex = 0;
      if (activeShuffle && activeQueue.length > 1) {
        nextIndex = Math.floor(Math.random() * activeQueue.length);
      }
      const next = activeQueue[nextIndex];
      setQueue(prev => prev.filter((_, idx) => idx !== nextIndex));
      playTrackRef.current(next);
    } else {
      setIsPlaying(false);
      stopProgressLoop();
    }
  }, [stopProgressLoop]);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [nextTrack]);

  const playTrack = useCallback(
    (track: Track) => {
      playTrackInternal(track);
    },
    [playTrackInternal]
  );

  const pauseTrack = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
      } catch {
        /* ignore */
      }
    }
    setIsPlaying(false);
    stopProgressLoop();
  }, [stopProgressLoop]);

  const resumeTrack = useCallback(() => {
    if (!currentTrack) return;

    if (currentTrack.audioUrl && audioRef.current) {
      audioRef.current.play().catch(e => console.warn(e));
    } else if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(volumeRef.current || 100);
        playerRef.current.playVideo();
      } catch (e) {
        console.warn(e);
      }
      startProgressLoop();
    } else if (currentTrack.videoId || currentTrack.id) {
      initPlayer(currentTrack.videoId || currentTrack.id, progress);
    }
    setIsPlaying(true);
  }, [currentTrack, initPlayer, progress, startProgressLoop]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    if (playerRef.current) {
      try {
        if (newVolume === 0) {
          if (typeof playerRef.current.mute === 'function') playerRef.current.mute();
        } else {
          if (typeof playerRef.current.unMute === 'function') playerRef.current.unMute();
          if (typeof playerRef.current.setVolume === 'function') playerRef.current.setVolume(newVolume);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    setProgress(time);
    if (currentTrack?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = time;
    } else if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(time, true);
      } catch {
        /* ignore */
      }
    }
  }, [currentTrack]);

  const previousTrack = useCallback(() => {
    if (progress > 3) {
      seekTo(0);
      return;
    }
    if (currentTrack?.audioUrl && audioRef.current) {
      audioRef.current.currentTime = 0;
      setProgress(0);
    } else if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(0, true);
      } catch {
        /* ignore */
      }
      setProgress(0);
    }
  }, [currentTrack, progress, seekTo]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        queue,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        setVolume,
        seekTo,
        nextTrack,
        previousTrack,
        addToQueue,
        clearQueue,
        shuffle,
        repeat,
        toggleShuffle,
        toggleRepeat,
        likedTracks,
        toggleLikeTrack,
        isLiked,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
