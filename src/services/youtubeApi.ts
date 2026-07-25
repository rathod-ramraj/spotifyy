const API_KEY = 'AIzaSyCve2oBSnY4WqTsvuMqtmaUxSxTdRkYHF0';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  thumbnailHigh: string;
  description: string;
  publishedAt: string;
  duration?: string;
  durationMs?: number;
  viewCount?: string;
  formattedViews?: string;
  isVerified?: boolean;
  isTopic?: boolean;
  albumThumbnail?: string;
  rankScore?: number;
  audioUrl?: string;
}

export interface SearchResult {
  items: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}

interface CacheRecord<T> {
  data: T;
  timestamp: number;
}

// ========== CACHING LAYER ==========
const CACHE_PREFIX = 'spotify_yt_cache_';

const cache = {
  data: new Map<string, CacheRecord<unknown>>(),

  get<T>(key: string, ttlMinutes: number = 60): T | null {
    let item = this.data.get(key) as CacheRecord<T> | undefined;

    if (!item) {
      try {
        const stored = localStorage.getItem(CACHE_PREFIX + key);
        if (stored) {
          item = JSON.parse(stored) as CacheRecord<T>;
          if (item) this.data.set(key, item as CacheRecord<unknown>);
        }
      } catch (e) {
        console.warn('LocalStorage read error:', e);
      }
    }

    if (!item) return null;

    const age = Date.now() - item.timestamp;
    const ttlMs = ttlMinutes * 60 * 1000;

    if (age > ttlMs) {
      this.data.delete(key);
      try {
        localStorage.removeItem(CACHE_PREFIX + key);
      } catch {
        /* ignore */
      }
      return null;
    }

    return item.data;
  },

  set<T>(key: string, data: T) {
    const record: CacheRecord<T> = { data, timestamp: Date.now() };
    this.data.set(key, record as CacheRecord<unknown>);
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(record));
    } catch {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
    }
  },

  delete(key: string) {
    this.data.delete(key);
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch {
      /* ignore */
    }
  },

  clear() {
    this.data.clear();
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith(CACHE_PREFIX)) localStorage.removeItem(k);
      });
    } catch {
      /* ignore */
    }
  }
};

const CACHE_KEYS = {
  popular: (maxResults: number) => `popular_${maxResults}`,
  search: (query: string, maxResults: number) => `search_${normalizeQuery(query)}_${maxResults}`,
  category: (category: string, maxResults: number) => `category_${category}_${maxResults}`,
  videoDetails: (videoId: string) => `video_${videoId}`,
  related: (videoId: string, maxResults: number) => `related_${videoId}_${maxResults}`,
};

const CACHE_TTL = {
  popular: 60,
  search: 30,
  category: 60,
  videoDetails: 120,
  related: 30,
};

// ========== QUERY NORMALIZATION & HELPERS ==========
export const normalizeQuery = (query: string): string => {
  return query
    .toLowerCase()
    .replace(/[([{}].*?[)\]}]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const cleanTitle = (title: string): string => {
  return title
    .replace(/\s*[([{}](official\s*(video|audio|music\s*video|lyric\s*video|hd|4k|mv|visualizer|audio\s*track)?|hd|4k|remastered|lyric\s*video|lyrics|mv)[)\]}]/gi, '')
    .replace(/ft\.|feat\.|featuring/gi, 'feat')
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseDuration = (isoDuration?: string): { seconds: number; formatted: string } => {
  if (!isoDuration) return { seconds: 180, formatted: '3:00' };
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { seconds: 180, formatted: '3:00' };

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  let formatted = '';
  if (hours > 0) {
    formatted = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return { seconds: totalSeconds, formatted };
};

export const formatViews = (views?: string | number): string => {
  if (!views) return '';
  const num = typeof views === 'string' ? parseInt(views, 10) : views;
  if (isNaN(num)) return '';
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B views`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
  return `${num} views`;
};

// String similarity & token overlap matching for typo tolerance and partial matches
export const stringSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.includes(s2) || s2.includes(s1)) return 0.85;

  const tokens1 = s1.split(/\s+/);
  const tokens2 = s2.split(/\s+/);
  let matches = 0;

  for (const t2 of tokens2) {
    if (tokens1.some(t1 => t1.includes(t2) || t2.includes(t1))) {
      matches++;
    }
  }

  return tokens2.length ? matches / tokens2.length : 0;
};

// Exclude unwanted content terms UNLESS explicitly in search query
const UNWANTED_TERMS = [
  'shorts', 'short', '#shorts', 'live', 'remix', 'karaoke', 'cover', 'nightcore',
  'slowed', 'reverb', '8d', 'podcast', 'interview', 'reaction', 'mashup',
  'fan upload', 'fanmade', 'fan video', 'unofficial', 'bass boosted', 'speed up'
];

interface RawItemSnippet {
  title?: string;
  description?: string;
  channelTitle?: string;
  publishedAt?: string;
  thumbnails?: {
    default?: { url?: string };
    medium?: { url?: string };
    high?: { url?: string };
    maxres?: { url?: string };
  };
}

interface RawYouTubeItem {
  id: string | { videoId?: string };
  snippet?: RawItemSnippet;
  contentDetails?: { duration?: string };
  statistics?: { viewCount?: string };
}

const shouldExcludeItem = (item: RawYouTubeItem, userQuery: string): boolean => {
  const normUserQuery = userQuery.toLowerCase();
  const textToScan = `${item.snippet?.title || ''} ${item.snippet?.description || ''} ${item.snippet?.channelTitle || ''}`.toLowerCase();

  for (const term of UNWANTED_TERMS) {
    if (normUserQuery.includes(term)) continue;

    const regex = new RegExp(`\\b${term.replace('#', '\\#')}\\b`, 'i');
    if (regex.test(textToScan)) {
      return true;
    }
  }
  return false;
};

const calculateRankScore = (item: RawYouTubeItem, rawQuery: string, artistName?: string): number => {
  const normQ = normalizeQuery(rawQuery);
  const title = item.snippet?.title || '';
  const channel = item.snippet?.channelTitle || '';
  const cleanT = cleanTitle(title);

  const titleLower = title.toLowerCase();
  const channelLower = channel.toLowerCase();

  const isTopic = channelLower.endsWith('- topic');
  const isVevoOrOfficial = channelLower.includes('vevo') || channelLower.includes('official') || isTopic;

  let score = 0;

  // Rank 1: Official Audio
  if ((isTopic || isVevoOrOfficial) && (titleLower.includes('audio') || titleLower.includes('official audio'))) {
    score += 1000;
  }
  // Rank 2: Topic Channel
  else if (isTopic) {
    score += 900;
  }
  // Rank 3: Official Artist Channel / VEVO
  else if (isVevoOrOfficial) {
    score += 800;
  }
  // Rank 4: Official Music Video
  else if (titleLower.includes('official video') || titleLower.includes('official music video') || titleLower.includes('m/v') || titleLower.includes('mv')) {
    score += 700;
  }
  // Rank 5: Lyric Video
  else if (titleLower.includes('lyric') || titleLower.includes('lyrics')) {
    score += 600;
  } else {
    score += 300;
  }

  // Exact & Fuzzy Match Scoring
  const similarity = stringSimilarity(`${cleanT} ${channel}`, normQ);
  score += similarity * 500;

  if (artistName) {
    const normArtist = normalizeQuery(artistName);
    if (channelLower.includes(normArtist) || titleLower.includes(normArtist)) {
      score += 600;
    }
  }

  const cleanChannel = channel.replace('- Topic', '').replace('VEVO', '').trim();
  if (cleanChannel && normQ.includes(cleanChannel.toLowerCase())) {
    score += 400;
  }

  if (item.contentDetails?.duration) {
    const { seconds } = parseDuration(item.contentDetails.duration);
    if (seconds >= 90 && seconds <= 540) {
      score += 150;
    }
  }

  const views = parseInt(item.statistics?.viewCount || '0', 10);
  if (views > 10000000) score += 100;
  else if (views > 1000000) score += 50;

  return score;
};

// YouTube Search endpoint fetcher using part=snippet, type=video, videoCategoryId=10, maxResults=15
const fetchYouTubeSearch = async (
  q: string,
  userQuery: string,
  signal?: AbortSignal
): Promise<RawYouTubeItem[]> => {
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: '10',
    maxResults: '15',
    q: q,
    key: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`, { signal });
    if (!response.ok) {
      console.warn(`YouTube search API status: ${response.status}`);
      return [];
    }
    const data = await response.json();
    const items: RawYouTubeItem[] = data.items || [];
    return items.filter(item => !shouldExcludeItem(item, userQuery));
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return [];
  }
};

// High-reliability iTunes Music Search fallback for quota exceeded (429) & network resilience
const fetchiTunesFallback = async (query: string, signal?: AbortSignal): Promise<YouTubeVideo[]> => {
  try {
    const params = new URLSearchParams({
      term: query,
      media: 'music',
      limit: '15',
    });
    const response = await fetch(`https://itunes.apple.com/search?${params}`, { signal });
    if (!response.ok) return [];

    const data = await response.json();
    const results = data.results || [];
    if (results.length === 0) return [];

    return results.map((item: {
      trackId: number;
      trackName?: string;
      artistName?: string;
      collectionName?: string;
      artworkUrl100?: string;
      trackTimeMillis?: number;
      releaseDate?: string;
      previewUrl?: string;
      primaryGenreName?: string;
    }) => {
      const artwork = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
      const durationSec = Math.floor((item.trackTimeMillis || 180000) / 1000);
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;

      return {
        id: `itunes-${item.trackId}`,
        title: item.trackName || '',
        channelTitle: item.artistName || '',
        thumbnail: artwork || item.artworkUrl100 || '',
        thumbnailHigh: artwork || item.artworkUrl100 || '',
        albumThumbnail: artwork,
        description: `${item.collectionName || ''} - ${item.primaryGenreName || ''}`,
        publishedAt: item.releaseDate || '',
        duration: `${mins}:${secs.toString().padStart(2, '0')}`,
        durationMs: item.trackTimeMillis || 180000,
        viewCount: '1000000',
        formattedViews: '1M+ streams',
        isVerified: true,
        isTopic: false,
        audioUrl: item.previewUrl,
        rankScore: 1000,
      };
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return [];
  }
};

// ========== MAIN SEARCH FUNCTION ==========
export const searchVideos = async (
  query: string,
  maxResults: number = 15,
  signal?: AbortSignal,
  artistName?: string
): Promise<SearchResult> => {
  if (!query || !query.trim()) {
    return { items: [], totalResults: 0 };
  }

  const normalizedQ = normalizeQuery(query);
  const cacheKey = CACHE_KEYS.search(query, maxResults);
  const cached = cache.get<SearchResult>(cacheKey, CACHE_TTL.search);
  if (cached) {
    return cached;
  }

  // Exact fallback search query sequence specified:
  // Primary: "<user query> official audio"
  // Retry 1: "<user query>"
  // Retry 2: "<user query> topic"
  // Retry 3: "<user query> official"
  const searchQueriesToTry = [
    `${normalizedQ} official audio`,
    normalizedQ,
    `${normalizedQ} topic`,
    `${normalizedQ} official`,
  ];

  let rawItems: RawYouTubeItem[] = [];

  for (const qString of searchQueriesToTry) {
    if (signal?.aborted) break;
    const items = await fetchYouTubeSearch(qString, query, signal);
    if (items.length > 0) {
      rawItems = items;
      break;
    }
  }

  // If YouTube API returns empty (e.g. quota 429 exceeded or no matches), use iTunes Music API
  let processedVideos: YouTubeVideo[] = [];

  if (rawItems.length > 0) {
    const videoIds = rawItems
      .map(item => (typeof item.id === 'string' ? item.id : item.id.videoId))
      .filter((id): id is string => Boolean(id))
      .join(',');

    const videoDetailsMap = new Map<string, RawYouTubeItem>();
    if (videoIds) {
      try {
        const detailsParams = new URLSearchParams({
          part: 'snippet,contentDetails,statistics',
          id: videoIds,
          key: API_KEY,
        });
        const detailsRes = await fetch(`${BASE_URL}/videos?${detailsParams}`, { signal });
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          (detailsData.items || []).forEach((detailItem: RawYouTubeItem) => {
            if (typeof detailItem.id === 'string') {
              videoDetailsMap.set(detailItem.id, detailItem);
            }
          });
        }
      } catch {
        /* ignore */
      }
    }

    processedVideos = rawItems.map(item => {
      const videoId = typeof item.id === 'string' ? item.id : item.id.videoId || '';
      const detailItem = videoDetailsMap.get(videoId) || item;

      const channelTitle = detailItem.snippet?.channelTitle || item.snippet?.channelTitle || '';
      const isTopic = channelTitle.toLowerCase().endsWith('- topic');
      const isVerified = isTopic || channelTitle.toLowerCase().includes('vevo') || channelTitle.toLowerCase().includes('official');

      const durationInfo = parseDuration(detailItem.contentDetails?.duration);
      const rawViews = detailItem.statistics?.viewCount;
      const formattedViewsStr = formatViews(rawViews);

      const rankScore = calculateRankScore(detailItem, query, artistName);

      const thumbnail = item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '';
      const thumbnailHigh = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.maxres?.url || thumbnail;

      return {
        id: videoId,
        title: item.snippet?.title || '',
        channelTitle,
        thumbnail,
        thumbnailHigh,
        albumThumbnail: thumbnailHigh,
        description: item.snippet?.description || '',
        publishedAt: item.snippet?.publishedAt || '',
        duration: durationInfo.formatted,
        durationMs: durationInfo.seconds * 1000,
        viewCount: rawViews,
        formattedViews: formattedViewsStr,
        isVerified,
        isTopic,
        rankScore,
      };
    });
  } else {
    // Graceful fallback to iTunes Music API when YouTube Data API is rate-limited/quota exceeded
    processedVideos = await fetchiTunesFallback(query, signal);
  }

  // Sort candidates by Rank Score descending
  processedVideos.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));

  // Deduplicate identical songs by normalized title + artist
  const seenKeys = new Set<string>();
  const deduplicatedItems: YouTubeVideo[] = [];

  for (const video of processedVideos) {
    const cleanT = cleanTitle(video.title);
    const cleanC = video.channelTitle.replace('- Topic', '').replace('VEVO', '').trim();
    const dedupKey = normalizeQuery(`${cleanT} ${cleanC}`);

    if (!seenKeys.has(dedupKey)) {
      seenKeys.add(dedupKey);
      deduplicatedItems.push(video);
    }
  }

  const finalItems = deduplicatedItems.slice(0, maxResults);
  const result: SearchResult = {
    items: finalItems,
    totalResults: finalItems.length,
  };

  cache.set(cacheKey, result);
  return result;
};

export const getPopularMusicVideos = async (maxResults: number = 20): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.popular(maxResults);
  const cached = cache.get<YouTubeVideo[]>(cacheKey, CACHE_TTL.popular);
  if (cached) return cached;

  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    chart: 'mostPopular',
    videoCategoryId: '10',
    regionCode: 'US',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) return fetchiTunesFallback('top pop hits');

    const data = await response.json();

    const result: YouTubeVideo[] = (data.items || []).map((item: RawYouTubeItem) => {
      const durationInfo = parseDuration(item.contentDetails?.duration);
      const channelTitle = item.snippet?.channelTitle || '';
      const isTopic = channelTitle.toLowerCase().endsWith('- topic');
      const isVerified = isTopic || channelTitle.toLowerCase().includes('vevo') || channelTitle.toLowerCase().includes('official');

      return {
        id: typeof item.id === 'string' ? item.id : '',
        title: item.snippet?.title || '',
        channelTitle,
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
        thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.maxres?.url || '',
        albumThumbnail: item.snippet?.thumbnails?.high?.url,
        description: item.snippet?.description || '',
        publishedAt: item.snippet?.publishedAt || '',
        duration: durationInfo.formatted,
        durationMs: durationInfo.seconds * 1000,
        viewCount: item.statistics?.viewCount,
        formattedViews: formatViews(item.statistics?.viewCount),
        isVerified,
        isTopic,
      };
    });

    cache.set(cacheKey, result);
    return result;
  } catch {
    return fetchiTunesFallback('top pop hits');
  }
};

export const getVideosByCategory = async (
  category: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.category(category, maxResults);
  const cached = cache.get<YouTubeVideo[]>(cacheKey, CACHE_TTL.category);
  if (cached) return cached;

  const result = await searchVideos(`${category} music playlist`, maxResults).then(res => res.items);
  cache.set(cacheKey, result);
  return result;
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
  const cacheKey = CACHE_KEYS.videoDetails(videoId);
  const cached = cache.get<YouTubeVideo>(cacheKey, CACHE_TTL.videoDetails);
  if (cached) return cached;

  if (videoId.startsWith('itunes-')) {
    return null;
  }

  const params = new URLSearchParams({
    part: 'snippet,contentDetails,statistics',
    id: videoId,
    key: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/videos?${params}`);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.items || data.items.length === 0) return null;

    const item: RawYouTubeItem = data.items[0];
    const durationInfo = parseDuration(item.contentDetails?.duration);
    const channelTitle = item.snippet?.channelTitle || '';
    const isTopic = channelTitle.toLowerCase().endsWith('- topic');
    const isVerified = isTopic || channelTitle.toLowerCase().includes('vevo') || channelTitle.toLowerCase().includes('official');

    const result: YouTubeVideo = {
      id: typeof item.id === 'string' ? item.id : '',
      title: item.snippet?.title || '',
      channelTitle,
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
      thumbnailHigh: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.maxres?.url || '',
      albumThumbnail: item.snippet?.thumbnails?.high?.url,
      description: item.snippet?.description || '',
      publishedAt: item.snippet?.publishedAt || '',
      duration: durationInfo.formatted,
      durationMs: durationInfo.seconds * 1000,
      viewCount: item.statistics?.viewCount,
      formattedViews: formatViews(item.statistics?.viewCount),
      isVerified,
      isTopic,
    };

    cache.set(cacheKey, result);
    return result;
  } catch {
    return null;
  }
};

export const getRelatedVideos = async (videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.related(videoId, maxResults);
  const cached = cache.get<YouTubeVideo[]>(cacheKey, CACHE_TTL.related);
  if (cached) return cached;

  if (videoId.startsWith('itunes-')) {
    return fetchiTunesFallback('popular hits');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    videoCategoryId: '10',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`);
    if (!response.ok) return fetchiTunesFallback('popular hits');

    const data = await response.json();
    const result: YouTubeVideo[] = (data.items || [])
      .filter((item: RawYouTubeItem) => typeof item.id !== 'string' && item.id.videoId)
      .map((item: RawYouTubeItem) => {
        const vidId = typeof item.id === 'string' ? item.id : item.id.videoId || '';
        return {
          id: vidId,
          title: item.snippet?.title || '',
          channelTitle: item.snippet?.channelTitle || '',
          thumbnail: item.snippet?.thumbnails?.medium?.url || '',
          thumbnailHigh: item.snippet?.thumbnails?.high?.url || '',
          description: item.snippet?.description || '',
          publishedAt: item.snippet?.publishedAt || '',
        };
      });

    cache.set(cacheKey, result);
    return result;
  } catch {
    return fetchiTunesFallback('popular hits');
  }
};

export const clearCache = (_pattern?: string) => {
  cache.clear();
};

export const musicCategories = [
  { id: 'pop', name: 'Pop', query: 'pop hits 2024' },
  { id: 'hiphop', name: 'Hip-Hop', query: 'hip hop music 2024' },
  { id: 'rock', name: 'Rock', query: 'rock music hits' },
  { id: 'electronic', name: 'Electronic', query: 'electronic dance music' },
  { id: 'rnb', name: 'R&B', query: 'r&b music hits' },
  { id: 'indie', name: 'Indie', query: 'indie music 2024' },
  { id: 'jazz', name: 'Jazz', query: 'jazz music' },
  { id: 'classical', name: 'Classical', query: 'classical music' },
  { id: 'latin', name: 'Latin', query: 'latin music hits' },
  { id: 'kpop', name: 'K-Pop', query: 'k-pop music 2024' },
  { id: 'country', name: 'Country', query: 'country music hits' },
  { id: 'workout', name: 'Workout', query: 'workout music' },
  { id: 'chill', name: 'Chill', query: 'chill lofi music' },
  { id: 'party', name: 'Party', query: 'party music hits' },
  { id: 'focus', name: 'Focus', query: 'focus study music' },
  { id: 'sleep', name: 'Sleep', query: 'sleep music relaxing' },
];