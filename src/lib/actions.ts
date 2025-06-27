"use server";

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId } from "firebase/firestore";
import type { Channel, Match, ChannelOption } from "@/types";
import { placeholderChannels } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

export const getChannels = async (): Promise<Channel[]> => {
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
};

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
    const allPlaceholderChannels = placeholderChannels;
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
  }).slice(0, 5); // Return a max of 5 related channels
};

// Function to normalize channel names for better matching
const normalizeChannelName = (name: string) => {
    return name
        .toLowerCase()
        .replace(/ sports/g, ' sport')
        .replace(/ tv/g, '')
        .replace(/ hd/g, '')
        .replace(/ premium/g, '')
        .replace(/ futbol/g, ' fútbol')
        .replace(/[-_.\s]/g, '');
};

export const getAgendaMatches = async (): Promise<Match[]> => {
    try {
        const [response, allChannels] = await Promise.all([
            fetch('https://www.futbollibre.futbol/api/agenda.php', {
                next: { revalidate: 1800 }, // Revalidate every 30 minutes
                headers: {
                    'Accept': 'application/json'
                }
            }),
            getChannels()
        ]);

        if (!response.ok) {
            throw new Error(`Failed to fetch agenda API: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data || !Array.isArray(data.agenda)) {
            console.warn("Agenda API returned invalid data format.");
            return [];
        }

        const matches: Match[] = [];
        const channelsMap = new Map(allChannels.map(c => [normalizeChannelName(c.name), c]));
        const now = new Date();

        for (const event of data.agenda) {
            const { event_time, event_title, event_league, channels: scrapedChannels, live } = event;

            if (!event_time || !event_title) continue;

            const [hours, minutes] = event_time.split(':').map(Number);
            const matchTimestamp = new Date();
            matchTimestamp.setHours(hours, minutes, 0, 0);
            
            // Filter out matches that ended more than 2h 15m ago
            const timeDiff = now.getTime() - matchTimestamp.getTime();
            if (timeDiff > ((2 * 60 + 15) * 60 * 1000)) {
              continue; 
            }

            const teams = event_title.split(' vs ');
            if (teams.length < 2) continue;

            const [team1, team2] = teams;

            const channelOptions: ChannelOption[] = (scrapedChannels || []).map((ch: any) => {
                const normalizedName = normalizeChannelName(ch.channel_name);
                const matchedChannel = channelsMap.get(normalizedName);
                
                if (matchedChannel) {
                    return { id: matchedChannel.id, name: matchedChannel.name, logoUrl: matchedChannel.logoUrl };
                }
                return null;
            }).filter((c: ChannelOption | null): c is ChannelOption => c !== null);

            if (channelOptions.length === 0) continue;

            matches.push({
                id: event.event_id || `${team1}-${team2}-${event_time}`.replace(/\s+/g, '-').toLowerCase(),
                team1: team1.trim(),
                team2: team2.trim(),
                team1Logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(team1.trim())}&background=random&color=fff`,
                team2Logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(team2.trim())}&background=random&color=fff`,
                time: event_time,
                isLive: live === "1",
                channels: channelOptions,
                tournamentName: event_league,
                matchTimestamp: matchTimestamp,
            });
        }
        
        return matches.sort((a, b) => a.matchTimestamp.getTime() - b.matchTimestamp.getTime());
    } catch (error) {
        console.error("Error fetching or processing agenda:", error);
        return [];
    }
};
