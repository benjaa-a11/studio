
"use server";

import { cache } from "react";
import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId, Timestamp, collectionGroup, orderBy, limit } from "firebase/firestore";
import type { Channel, Match, ChannelOption, Radio, Tournament, Team, AppStatus, News, FeaturedImage } from "@/types";
import { placeholderChannels, placeholderRadios, placeholderTournaments, placeholderTeams, placeholderNews, placeholderImages } from "./placeholder-data";

// Helper function to resolve .pls file to an actual stream URL
const _resolvePlsUrl = async (url: string): Promise<string | null> => {
    if (!url || !url.endsWith('.pls')) {
        return url; // Return non-pls URLs or empty/null URLs directly
    }

    // If it is a .pls url, it must be resolved. If it can't, it's invalid.
    console.log(`Resolving .pls URL: ${url}`);
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout for a faster response

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch .pls file [${response.status}]: ${url}`);
            return null; // Return null on failure to fetch
        }

        const text = await response.text();
        const lines = text.split('\n');

        for (const line of lines) {
            if (line.trim().toLowerCase().startsWith('file1=')) {
                const streamUrl = line.substring(line.indexOf('=') + 1).trim();
                console.log(`Resolved .pls url ${url} to ${streamUrl}`);
                return streamUrl; // Return the resolved URL
            }
        }

        console.warn(`.pls file did not contain a 'File1=' entry: ${url}`);
        return null; // Return null if parsing fails
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`Timeout fetching .pls url: ${url}`);
        } else {
            console.error(`Error resolving .pls url ${url}:`, error);
        }
        return null; // Return null on any other error
    }
};


// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  // Filter hidden channels from the fallback data
  return placeholderChannels.filter(c => !c.isHidden);
};

// Uncached version of getChannels to ensure data is always fresh for the public app
export const getChannels = async (includePlaceholders = false): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty && includePlaceholders) {
      return useFallbackData();
    }
    
    const allChannels = channelSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Channel));
    
    // Server-side filter to ensure channels are visible unless explicitly hidden.
    // This shows channels where `isHidden` is `false` or the field does not exist.
    const visibleChannels = allChannels.filter(channel => channel.isHidden !== true);
    
    return visibleChannels;
  } catch (error) {
    console.error("Error al obtener canales de Firebase:", error);
    if (includePlaceholders) return useFallbackData();
    return [];
  }
};

// This version is for the admin panel and fetches ALL channels, including hidden ones.
export const getAllChannelsForAdmin = async (includePlaceholders = false): Promise<Channel[]> => {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(query(channelsCollection));
    
    if (channelSnapshot.empty && includePlaceholders) {
      return placeholderChannels; // Return all, including hidden
    }
    
    return channelSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Channel));
  } catch (error) {
    console.error("Error fetching all channels for admin:", error);
    if (includePlaceholders) return placeholderChannels;
    return [];
  }
};


export const getChannelById = async (id: string): Promise<Channel | null> => {
  try {
    const channelDoc = doc(db, "channels", id);
    const channelSnapshot = await getDoc(channelDoc);

    if (channelSnapshot.exists()) {
      return { id: channelSnapshot.id, ...channelSnapshot.data() } as Channel;
    } else {
       // Fallback for demo purposes if ID not in firestore
      const fallbackChannel = (await getAllChannelsForAdmin(true)).find(c => c.id === id);
      if (fallbackChannel) {
        console.warn(`Canal con id ${id} no encontrado en Firebase. Usando dato de demostración.`);
        return fallbackChannel;
      }
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener canal con id ${id}:`, error);
     const fallbackChannel = (await getAllChannelsForAdmin(true)).find(c => c.id === id);
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
    // Firestore 'in' query is limited to 30 elements, so we chunk the IDs.
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
    const allPlaceholderChannels = await getAllChannelsForAdmin(true);
    const placeholderMap = new Map(allPlaceholderChannels.map(c => [c.id, c]));
    return ids.map(id => placeholderMap.get(id)).filter((c): c is Channel => !!c);
  }
};

export const getCategories = async (): Promise<string[]> => {
  const channels = await getChannels(true);
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
};

export const getChannelsByCategory = async (category: string, excludeId?: string): Promise<Channel[]> => {
  const allChannels = await getChannels(true); // Gets only visible channels
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 4); // Return a max of 4 related channels
};

export const getAgendaMatches = cache(async (): Promise<Match[]> => {
  try {
    const now = new Date();
    const timeZone = 'America/Argentina/Buenos_Aires';
    
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')!.value, 10);
    const month = parseInt(parts.find(p => p.type === 'month')!.value, 10);
    const day = parseInt(parts.find(p => p.type === 'day')!.value, 10);
    
    const startOfTodayUTC = new Date(Date.UTC(year, month - 1, day, 3, 0, 0)); 
    const endOfTodayUTC = new Date(Date.UTC(year, month - 1, day + 1, 3, 0, 0));

    const agendaQuery = query(
        collection(db, "agenda"),
        where("time", ">=", Timestamp.fromDate(startOfTodayUTC)),
        where("time", "<", Timestamp.fromDate(endOfTodayUTC))
    );
    const agendaSnapshot = await getDocs(agendaQuery);

    const rawMatches = agendaSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(data => {
            const matchTimestamp = (data.time as Timestamp).toDate();
            const timeSinceStart = now.getTime() - matchTimestamp.getTime();
            return timeSinceStart <= (180 * 60 * 1000); 
        });

    if (rawMatches.length === 0) {
        return [];
    }
    
    const teamIds = new Set<string>();
    const tournamentIds = new Set<string>();
    const channelIds = new Set<string>();
    
    const extractId = (field: any): string | undefined => {
      if (!field) return undefined;
      return typeof field === 'string' ? field : field.id;
    };

    rawMatches.forEach(match => {
        const team1Id = extractId(match.team1);
        const team2Id = extractId(match.team2);
        const tournamentId = extractId(match.tournamentId);

        if (team1Id) teamIds.add(team1Id);
        if (team2Id) teamIds.add(team2Id);
        if (tournamentId) tournamentIds.add(tournamentId);
        if (match.channels) match.channels.forEach((c: string) => channelIds.add(c));
    });

    // Fetch all related data in parallel
    const teamsPromise = getDocs(collectionGroup(db, 'clubs'));
    
    const tournamentPromises = [];
    const tournamentIdsArray = Array.from(tournamentIds);
    for (let i = 0; i < tournamentIdsArray.length; i += 30) {
        const chunk = tournamentIdsArray.slice(i, i + 30);
        if (chunk.length > 0) {
            tournamentPromises.push(getDocs(query(collection(db, 'tournaments'), where("id", "in", chunk))));
        }
    }
    const tournamentsPromise = Promise.all(tournamentPromises);

    const channelsPromise = getChannelsByIds(Array.from(channelIds));

    const [teamsSnapshot, tournamentSnapshots, channels] = await Promise.all([
        teamsPromise,
        tournamentsPromise,
        channelsPromise
    ]);

    // Create maps for efficient lookup
    const teamsMap = new Map(teamsSnapshot.docs.map(doc => [doc.id, doc.data()]));

    const tournamentDocs = tournamentSnapshots.flatMap(snap => snap.docs);
    const tournamentsMap = new Map(tournamentDocs.map(doc => [doc.data().id, doc.data()]));
    const channelsMap = new Map(channels.map(c => [c.id, { id: c.id, name: c.name, logoUrl: c.logoUrl }]));
    
    const allMatches: Match[] = rawMatches.map(data => {
        const matchTimestamp = (data.time as Timestamp).toDate();
        
        const team1Id = extractId(data.team1);
        const team2Id = extractId(data.team2);
        const tournamentId = extractId(data.tournamentId);

        const team1Data = teamsMap.get(team1Id);
        const team2Data = teamsMap.get(team2Id);
        const tournamentData = tournamentsMap.get(tournamentId);

        let tournamentLogo: Match['tournamentLogo'] = undefined;
        if (tournamentData?.logoUrl) {
            if (Array.isArray(tournamentData.logoUrl) && tournamentData.logoUrl.length > 1) {
                tournamentLogo = { dark: tournamentData.logoUrl[0], light: tournamentData.logoUrl[1] };
            } else if (Array.isArray(tournamentData.logoUrl) && tournamentData.logoUrl.length === 1) {
                tournamentLogo = tournamentData.logoUrl[0];
            } else if (typeof tournamentData.logoUrl === 'string') {
                tournamentLogo = tournamentData.logoUrl;
            }
        }

        const channelOptions: ChannelOption[] = (data.channels || []).map((id: string) =>
            channelsMap.get(id)
        ).filter((c: ChannelOption | undefined): c is ChannelOption => !!c);

        const isLive = now.getTime() >= matchTimestamp.getTime();
        const isWatchable = matchTimestamp.getTime() - now.getTime() <= (30 * 60 * 1000);

        return {
            id: data.id,
            team1: team1Data?.name || 'Equipo A',
            team1Logo: team1Data?.logoUrl,
            team2: team2Data?.name || 'Equipo B',
            team2Logo: team2Data?.logoUrl,
            time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
            isLive: isLive,
            isWatchable: isWatchable,
            channels: channelOptions,
            dates: data.dates,
            matchTimestamp: matchTimestamp,
            tournamentName: tournamentData?.name,
            tournamentLogo: tournamentLogo,
            statusText: data.statusText,
            imageUrl: data.imageUrl,
        };
    });

    return allMatches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());

  } catch (error) {
    console.error("Error al obtener partidos de la agenda:", error);
    return [];
  }
});


// --- RADIOS ---

const useRadioFallbackData = (includePlaceholders: boolean) => {
  if (includePlaceholders) {
    console.warn("Firebase no disponible o colección de radios vacía. Usando datos de demostración.");
    return placeholderRadios;
  }
  return [];
};

export const getRadios = async (includePlaceholders = false): Promise<Radio[]> => {
  try {
    const radiosCollection = collection(db, "radio");
    const radioSnapshot = await getDocs(query(radiosCollection));
    
    if (radioSnapshot.empty && includePlaceholders) {
      return useRadioFallbackData(true);
    }
    
    // Concurrently resolve all stream URLs and filter out invalid ones
    const radios = await Promise.all(radioSnapshot.docs.map(async (doc) => {
      const radioData = { id: doc.id, ...doc.data() } as Radio;
      if (radioData.streamUrl && Array.isArray(radioData.streamUrl)) {
        const resolvedUrls = await Promise.all(radioData.streamUrl.map(url => _resolvePlsUrl(url)));
        radioData.streamUrl = resolvedUrls.filter((url): url is string => !!url);
      }
      return radioData;
    }));
    
    return radios;
  } catch (error) {
    console.error("Error al obtener radios de Firebase:", error);
    return useRadioFallbackData(includePlaceholders);
  }
};

const processRadioData = async (data: any): Promise<Radio> => {
    const radioData = { ...data }; // Create a mutable copy
    if (radioData.streamUrl && Array.isArray(radioData.streamUrl)) {
      const resolvedUrls = await Promise.all(
        radioData.streamUrl.map(url => _resolvePlsUrl(url))
      );
      radioData.streamUrl = resolvedUrls.filter((url): url is string => !!url);
    }
    return radioData;
};

export const getRadioById = async (id: string): Promise<Radio | null> => {
  try {
    const radioDocRef = doc(db, "radio", id);
    const radioSnapshot = await getDoc(radioDocRef);

    if (radioSnapshot.exists()) {
      return await processRadioData({ id: radioSnapshot.id, ...radioSnapshot.data() });
    }
    
    const fallbackRadio = (await getRadios(true)).find(r => r.id === id);
    if (fallbackRadio) {
      console.warn(`Radio con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
      return await processRadioData(fallbackRadio);
    }

    return null;
  } catch (error) {
    console.error(`Error al obtener radio con id ${id}:`, error);
    const fallbackRadio = (await getRadios(true)).find(r => r.id === id);
    if (fallbackRadio) {
      return await processRadioData(fallbackRadio);
    }
    return null;
  }
};


// --- TOURNAMENTS ---

const useTournamentFallbackData = (includePlaceholders: boolean) => {
    if (includePlaceholders) {
      console.warn("Firebase no disponible o colección de torneos vacía. Usando datos de demostración.");
      return placeholderTournaments;
    }
    return [];
};

export const getTournaments = async (includePlaceholders = false): Promise<Tournament[]> => {
    try {
        const tournamentsCollection = collection(db, "tournaments");
        const tournamentSnapshot = await getDocs(query(tournamentsCollection));
        
        if (tournamentSnapshot.empty && includePlaceholders) {
            return useTournamentFallbackData(true);
        }
        
        const tournaments = tournamentSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              tournamentId: data.id,
              name: data.name,
              logoUrl: data.logoUrl || [],
            } as Tournament;
        });
        
        return tournaments;
    } catch (error) {
        console.error("Error al obtener torneos de Firebase:", error);
        return useTournamentFallbackData(includePlaceholders);
    }
};

// --- TEAMS ---

const useTeamFallbackData = (includePlaceholders: boolean) => {
    if (includePlaceholders) {
      console.warn("Firebase no disponible o colección de equipos vacía. Usando datos de demostración.");
      return placeholderTeams;
    }
    return [];
};

export const getTeams = async (includePlaceholders = false): Promise<Team[]> => {
    try {
        const teamsQuery = query(collectionGroup(db, 'clubs'));
        const teamSnapshot = await getDocs(teamsQuery);

        if (teamSnapshot.empty && includePlaceholders) {
            return useTeamFallbackData(true);
        }
        
        const teams = teamSnapshot.docs.map(doc => ({
          id: doc.id,
          path: doc.ref.path,
          ...doc.data()
        } as Team));
        
        return teams;
    } catch (error) {
        console.error("Error al obtener equipos de Firebase:", error);
        return useTeamFallbackData(includePlaceholders);
    }
};

// --- NEWS ---
const useNewsFallbackData = (includePlaceholders: boolean): News[] => {
  if (includePlaceholders) {
    console.warn("Firebase no disponible o colección de noticias vacía. Usando datos de demostración.");
    return placeholderNews;
  }
  return [];
};


export const getNews = async (includePlaceholders = false): Promise<News[]> => {
  try {
    const newsCollection = collection(db, "news");
    const newsSnapshot = await getDocs(query(newsCollection, orderBy("date", "desc")));
    
    if (newsSnapshot.empty && includePlaceholders) {
      return useNewsFallbackData(true);
    }
    
    const newsItems = newsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp).toDate().toISOString(),
        } as News;
    });
    
    return newsItems;
  } catch (error) {
    console.error("Error al obtener noticias de Firebase:", error);
    return useNewsFallbackData(includePlaceholders);
  }
};

export const getNewsById = async (id: string): Promise<News | null> => {
    try {
        const newsDocRef = doc(db, "news", id);
        const newsSnapshot = await getDoc(newsDocRef);

        if (newsSnapshot.exists()) {
            const data = newsSnapshot.data();
            return {
                id: newsSnapshot.id,
                ...data,
                date: (data.date as Timestamp).toDate().toISOString(),
            } as News;
        }

        const fallbackNews = (await getNews(true)).find(n => n.id === id);
        if (fallbackNews) {
            console.warn(`Noticia con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
            return fallbackNews;
        }

        return null;
    } catch (error) {
        console.error(`Error al obtener noticia con id ${id}:`, error);
        const fallbackNews = (await getNews(true)).find(n => n.id === id);
        if (fallbackNews) {
            return fallbackNews;
        }
        return null;
    }
};

// --- FEATURED IMAGES ---
const useImageFallbackData = (includePlaceholders: boolean): FeaturedImage[] => {
    if (includePlaceholders) {
        console.warn("Firebase no disponible o colección de imágenes vacía. Usando datos de demostración.");
        return placeholderImages;
    }
    return [];
};

export const getFeaturedImages = async (count: number = 3, includePlaceholders = false): Promise<FeaturedImage[]> => {
    try {
        const imagesCollection = collection(db, "images");
        const q = query(imagesCollection, orderBy("date", "desc"), limit(count));
        const imageSnapshot = await getDocs(q);

        if (imageSnapshot.empty && includePlaceholders) {
            return useImageFallbackData(true).slice(0, count);
        }

        return imageSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate().toISOString(),
            } as FeaturedImage;
        });
    } catch (error) {
        console.error("Error al obtener imágenes de Firebase:", error);
        return useImageFallbackData(includePlaceholders).slice(0, count);
    }
};

export const getAllFeaturedImages = async (includePlaceholders = false): Promise<FeaturedImage[]> => {
    try {
        const imagesCollection = collection(db, "images");
        const q = query(imagesCollection, orderBy("date", "desc"));
        const imageSnapshot = await getDocs(q);

        if (imageSnapshot.empty && includePlaceholders) {
            return useImageFallbackData(true);
        }

        return imageSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: (data.date as Timestamp).toDate().toISOString(),
            } as FeaturedImage;
        });
    } catch (error) {
        console.error("Error al obtener todas las imágenes de Firebase:", error);
        return useImageFallbackData(includePlaceholders);
    }
};

export const getFeaturedImageById = async (id: string): Promise<FeaturedImage | null> => {
    try {
        const imageDocRef = doc(db, "images", id);
        const imageSnapshot = await getDoc(imageDocRef);

        if (imageSnapshot.exists()) {
            const data = imageSnapshot.data();
            return {
                id: imageSnapshot.id,
                ...data,
                date: (data.date as Timestamp).toDate().toISOString(),
            } as FeaturedImage;
        }

        const fallbackImage = (await getAllFeaturedImages(true)).find(i => i.id === id);
        if (fallbackImage) {
            console.warn(`Imagen con id ${id} no encontrada en Firebase. Usando dato de demostración.`);
            return fallbackImage;
        }

        return null;
    } catch (error) {
        console.error(`Error al obtener imagen con id ${id}:`, error);
        const fallbackImage = (await getAllFeaturedImages(true)).find(i => i.id === id);
        if (fallbackImage) {
            return fallbackImage;
        }
        return null;
    }
};


// --- APP STATUS ---
export const getAppStatus = cache(async (): Promise<AppStatus | null> => {
  try {
      const statusDoc = await getDoc(doc(db, "config", "app-status"));
      if (statusDoc.exists()) {
          return statusDoc.data() as AppStatus;
      }
      return null;
  } catch (error) {
      console.error("Error fetching app status:", error);
      // Return a default "all enabled" status if there's an error
      // This prevents the app from being locked out if the config doc is missing or there's a read error.
      return {
          isMaintenanceMode: false,
          maintenanceMessage: '',
          disabledSections: []
      };
  }
});
