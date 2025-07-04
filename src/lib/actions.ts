
"use server";

import { cache } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId, Timestamp } from "firebase/firestore";
import type { Channel, Match, ChannelOption, Movie } from "@/types";
import { placeholderChannels, placeholderMovies, placeholderMdcMatches, placeholderCopaArgentinaMatches } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

// Cached version of getChannels
export const getChannels = cache(async (): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty) {
      return useFallbackData();
    }
    
    const channels = channelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Channel));
    
    return channels;
  } catch (error) {
    console.error("Error al obtener canales de Firebase:", error);
    return useFallbackData();
  }
});

export const getChannelById = async (id: string): Promise<Channel | null> => {
  try {
    const channelDoc = doc(db, "channels", id);
    const channelSnapshot = await getDoc(channelDoc);

    if (channelSnapshot.exists()) {
      return { id: channelSnapshot.id, ...channelSnapshot.data() } as Channel;
    } else {
       // Fallback for demo purposes if ID not in firestore
      const fallbackChannel = placeholderChannels.find(c => c.id === id);
      if (fallbackChannel) {
        console.warn(`Canal con id ${id} no encontrado en Firebase. Usando dato de demostración.`);
        return fallbackChannel;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener canal con id ${id}:`, error);
     const fallbackChannel = placeholderChannels.find(c => c.id === id);
      if (fallbackChannel) {
        return fallbackChannel;
      }
    return null;
  }
};

export const getChannelsByIds = async (ids: string[]): Promise<Channel[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    // Firestore 'in' query is limited to 30 elements in Next.js 14, so we chunk the IDs.
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    const firestoreChannels: Channel[] = [];
    for (const chunk of chunks) {
        const q = query(collection(db, "channels"), where(documentId(), "in", chunk));
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
            firestoreChannels.push({ id: doc.id, ...doc.data() } as Channel);
        });
    }
    
    // To preserve the original order of IDs from the input array
    const firestoreChannelMap = new Map(firestoreChannels.map(c => [c.id, c]));
    return ids.map(id => firestoreChannelMap.get(id)).filter((c): c is Channel => !!c);

  } catch (error) {
    console.error("Error fetching channels by IDs from Firebase:", error);
    // Fallback to placeholder data for any matching IDs
    const allPlaceholderChannels = await getChannels();
    const placeholderMap = new Map(allPlaceholderChannels.map(c => [c.id, c]));
    return ids.map(id => placeholderMap.get(id)).filter((c): c is Channel => !!c);
  }
};

export const getCategories = async (): Promise<string[]> => {
  const channels = await getChannels();
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
};

export const getChannelsByCategory = async (category: string, excludeId?: string): Promise<Channel[]> => {
  const allChannels = await getChannels();
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 4); // Return a max of 4 related channels
};

export const getAgendaMatches = async (): Promise<Match[]> => {
  try {
    const now = new Date();
    const timeZone = 'America/Argentina/Buenos_Aires';
    
    // Get start and end of today in Argentina time, converted to UTC for Firestore
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')!.value, 10);
    const month = parseInt(parts.find(p => p.type === 'month')!.value, 10);
    const day = parseInt(parts.find(p => p.type === 'day')!.value, 10);
    
    // Firestore stores timestamps in UTC. We define today in Argentinian time (UTC-3).
    // The start of the day in ART is 00:00, which is 03:00 UTC.
    const startOfTodayUTC = new Date(Date.UTC(year, month - 1, day, 3, 0, 0)); 
    // The end of the day is 23:59:59 ART, which is the start of the next day 03:00 UTC.
    const endOfTodayUTC = new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0));

    const fetchMatchesFromCollection = async (collectionName: string) => {
        const matchesQuery = query(
            collection(db, collectionName),
            where("matchTimestamp", ">=", Timestamp.fromDate(startOfTodayUTC)),
            where("matchTimestamp", "<", Timestamp.fromDate(endOfTodayUTC))
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        return matchesSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(data => {
                const matchTimestamp = (data.matchTimestamp as Timestamp).toDate();
                // Disappear 3 hours (180 minutes) after start.
                const timeSinceStart = now.getTime() - matchTimestamp.getTime();
                return timeSinceStart <= (180 * 60 * 1000); 
            });
    };

    let allRawMatches: any[] = [];
    try {
        const [mdcMatches, copaArgentinaMatches] = await Promise.all([
            fetchMatchesFromCollection("mdc25"),
            fetchMatchesFromCollection("copaargentina"),
        ]);
        allRawMatches = [...mdcMatches, ...copaArgentinaMatches];

        // If firebase is empty or fails, use placeholder data
        if (allRawMatches.length === 0) {
            console.warn("No matches found in Firebase for today. Using placeholder data.");
            allRawMatches = [...placeholderMdcMatches, ...placeholderCopaArgentinaMatches];
        }

    } catch (firebaseError) {
        console.error("Error fetching matches from Firebase, using placeholder data.", firebaseError);
        allRawMatches = [...placeholderMdcMatches, ...placeholderCopaArgentinaMatches];
    }
    
    if (allRawMatches.length === 0) {
        return [];
    }

    const channelIds = new Set<string>();
    allRawMatches.forEach(match => {
        if (match.channels) {
            match.channels.forEach((c: string) => channelIds.add(c));
        }
    });

    const channels = await getChannelsByIds(Array.from(channelIds));
    const channelsMap = new Map(channels.map(c => [c.id, { id: c.id, name: c.name, logoUrl: c.logoUrl }]));
    
    const allMatches: Match[] = allRawMatches.map(data => {
        const matchTimestamp = (data.matchTimestamp as Timestamp).toDate();
        const channelOptions: ChannelOption[] = (data.channels || []).map((id: string) =>
            channelsMap.get(id)
        ).filter((c: ChannelOption | undefined): c is ChannelOption => !!c);

        const isLive = now.getTime() >= matchTimestamp.getTime();
        // A match is watchable 30 minutes before it starts
        const isWatchable = matchTimestamp.getTime() - now.getTime() <= (30 * 60 * 1000);

        return {
            id: data.id,
            team1: data.team1 || 'Equipo A',
            team1Logo: data.team1Logo,
            team2: data.team2 || 'Equipo B',
            team2Logo: data.team2Logo,
            time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
            isLive: isLive,
            isWatchable: isWatchable,
            channels: channelOptions,
            matchDetails: data.matchDetails,
            matchTimestamp: matchTimestamp,
            tournamentName: data.tournamentName,
        };
    });

    return allMatches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());

  } catch (error) {
    console.error("Error al obtener partidos:", error);
    return [];
  }
};


// --- MOVIES ---

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280";

const _fetchTMDbData = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}?api_key=${TMDB_API_KEY}&language=es-ES`);
    if (!response.ok) {
      console.error(`Error fetching TMDb data for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.success === false) {
      console.error(`TMDb API error for ${tmdbID}: ${data.status_message}`);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`Error fetching from TMDb for ${tmdbID}:`, error);
    return null;
  }
});

const _fetchTMDbCredits = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}/credits?api_key=${TMDB_API_KEY}&language=es-ES`);
    if (!response.ok) {
      console.error(`Error fetching TMDb credits for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching credits from TMDb for ${tmdbID}:`, error);
    return null;
  }
});

const _fetchTMDbVideos = cache(async (tmdbID: string) => {
  if (!tmdbID || !TMDB_API_KEY) return null;
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${tmdbID}/videos?api_key=${TMDB_API_KEY}&language=es-ES,en-US`);
    if (!response.ok) {
      console.error(`Error fetching TMDb videos for ${tmdbID}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Prioritize official trailers in Spanish, then English, then any trailer
      const trailers = data.results.filter((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
      const officialSpanishTrailer = trailers.find((v: any) => v.iso_639_1 === 'es' && v.official);
      const spanishTrailer = trailers.find((v: any) => v.iso_639_1 === 'es');
      const officialEnglishTrailer = trailers.find((v: any) => v.official);
      const anyTrailer = trailers[0];

      const bestTrailer = officialSpanishTrailer || spanishTrailer || officialEnglishTrailer || anyTrailer;
      return bestTrailer ? `https://www.youtube.com/embed/${bestTrailer.key}` : null;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching videos from TMDb for ${tmdbID}:`, error);
    return null;
  }
});


const _enrichMovieData = async (docId: string, firestoreMovie: any): Promise<Movie> => {
  if (firestoreMovie.tmdbID) {
    const [movieData, creditsData, videoUrl] = await Promise.all([
      _fetchTMDbData(firestoreMovie.tmdbID),
      _fetchTMDbCredits(firestoreMovie.tmdbID),
      _fetchTMDbVideos(firestoreMovie.tmdbID),
    ]);

    if (movieData) {
      // Format duration
      let finalDuration = firestoreMovie.duration;
      if (!finalDuration && movieData.runtime) {
        const hours = Math.floor(movieData.runtime / 60);
        const minutes = movieData.runtime % 60;
        if (hours > 0) {
          finalDuration = `${hours}h ${minutes}m`;
        } else {
          finalDuration = `${minutes}m`;
        }
      }

      // Get director and actors from credits
      const director = creditsData?.crew?.find((person: any) => person.job === 'Director')?.name;
      const actors = creditsData?.cast?.slice(0, 3).map((person: any) => person.name).join(', ');

      return {
        id: docId,
        tmdbID: firestoreMovie.tmdbID,
        title: firestoreMovie.title || movieData.title,
        posterUrl: firestoreMovie.posterUrl || (movieData.poster_path ? `${TMDB_IMAGE_BASE_URL}${movieData.poster_path}` : 'https://placehold.co/500x750.png'),
        backdropUrl: movieData.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${movieData.backdrop_path}` : undefined,
        streamUrl: firestoreMovie.streamUrl,
        trailerUrl: videoUrl,
        category: firestoreMovie.category || movieData.genres?.map((g: any) => g.name) || [],
        synopsis: firestoreMovie.synopsis || movieData.overview,
        year: firestoreMovie.year || (movieData.release_date ? parseInt(movieData.release_date.split('-')[0], 10) : undefined),
        duration: finalDuration || "N/A",
        format: firestoreMovie.format,
        director: firestoreMovie.director || director,
        actors: firestoreMovie.actors || actors,
        rating: firestoreMovie.rating || (movieData.vote_average ? movieData.vote_average.toFixed(1) : undefined),
      };
    }
  }
  // Fallback to Firestore data if no tmdbID or API fetch fails
  return {
    id: docId,
    ...firestoreMovie,
  } as Movie;
};


const useMovieFallbackData = () => {
  console.warn("Firebase no disponible o colección de películas vacía. Usando datos de demostración.");
  return placeholderMovies;
};

// Cached version of getMovies
export const getMovies = cache(async (): Promise<Movie[]> => {
  try {
    const moviesCollection = collection(db, "peliculas");
    const movieSnapshot = await getDocs(query(moviesCollection));
    
    if (movieSnapshot.empty) {
      return useMovieFallbackData();
    }
    
    const moviePromises = movieSnapshot.docs.map(doc => _enrichMovieData(doc.id, doc.data()));
    const movies = await Promise.all(moviePromises);

    return movies;
  } catch (error) {
    console.error("Error al obtener películas de Firebase:", error);
    return useMovieFallbackData();
  }
});

export const getMovieById = async (id: string): Promise<Movie | null> => {
  try {
    const movieDoc = doc(db, "peliculas", id);
    const movieSnapshot = await getDoc(movieDoc);

    if (movieSnapshot.exists()) {
      return await _enrichMovieData(movieSnapshot.id, movieSnapshot.data());
    } else {
      const fallbackMovie = placeholderMovies.find(m => m.id === id);
      if (fallbackMovie) {
        console.warn(`Película con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
        return fallbackMovie;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener película con id ${id}:`, error);
    const fallbackMovie = placeholderMovies.find(m => m.id === id);
    if (fallbackMovie) {
      return fallbackMovie;
    }
    return null;
  }
};

export const getMovieCategories = async (): Promise<string[]> => {
  const movies = await getMovies();
  if (!movies || movies.length === 0) return [];
  const categories = new Set(movies.flatMap(movie => movie.category || []));
  return Array.from(categories).sort();
};

export const getSimilarMovies = cache(async (currentMovieId: string, categories: string[] = [], limit: number = 10): Promise<Movie[]> => {
  if (!categories || categories.length === 0) {
    return [];
  }
  
  try {
    const allMovies = await getMovies();
    const similar = allMovies
      .filter(movie => 
        movie.id !== currentMovieId && 
        movie.category?.some(cat => categories.includes(cat))
      )
      .slice(0, limit);
    return similar;
  } catch (error) {
    console.error("Error fetching similar movies:", error);
    return [];
  }
});

    