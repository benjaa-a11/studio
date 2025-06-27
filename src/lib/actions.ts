"use server";

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, documentId } from "firebase/firestore";
import type { Channel, Match, ChannelOption } from "@/types";
import { placeholderChannels } from "./placeholder-data";
import * as cheerio from 'cheerio';

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
            fetch('https://librefutboltv.su/agenda/', {
                next: { revalidate: 1800 } // Revalidate every 30 minutes
            }),
            getChannels()
        ]);

        if (!response.ok) {
            throw new Error(`Failed to fetch agenda: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const matches: Match[] = [];

        const channelsMap = new Map(allChannels.map(c => [normalizeChannelName(c.name), c]));
        
        const now = new Date();

        $('.event-info').each((_, element) => {
            const timeStr = $(element).find('.event-time').text().trim();
            const title = $(element).find('.event-title').text().trim();
            const league = $(element).find('.event-league').text().trim();

            const scrapedChannels = $(element).find('.event-channels a')
                .map((_, el) => $(el).text().trim()).get();

            if (!timeStr || !title) return;

            const [hours, minutes] = timeStr.split(':').map(Number);
            const matchTimestamp = new Date();
            matchTimestamp.setHours(hours, minutes, 0, 0);

            const teams = title.split(' vs ');
            if (teams.length < 2) return;

            const [team1, team2] = teams;

            const channelOptions: ChannelOption[] = scrapedChannels.map(scrapedName => {
                const normalizedName = normalizeChannelName(scrapedName);
                const matchedChannel = channelsMap.get(normalizedName);
                
                if (matchedChannel) {
                    return { id: matchedChannel.id, name: matchedChannel.name, logoUrl: matchedChannel.logoUrl };
                }
                return null;
            }).filter((c): c is ChannelOption => c !== null);
            
            // Only include matches that have at least one channel we can stream
            if (channelOptions.length === 0) return;

            const isLive = now >= matchTimestamp && (now.getTime() - matchTimestamp.getTime()) < (2 * 60 + 15) * 60 * 1000;

            matches.push({
                id: `${team1}-${team2}-${timeStr}`.replace(/\s+/g, '-').toLowerCase(),
                team1: team1.trim(),
                team2: team2.trim(),
                team1Logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(team1.trim())}&background=random&color=fff`,
                team2Logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(team2.trim())}&background=random&color=fff`,
                time: timeStr,
                isLive: isLive,
                channels: channelOptions,
                tournamentName: league,
                matchTimestamp: matchTimestamp,
            });
        });
        
        return matches;
    } catch (error) {
        console.error("Error scraping agenda:", error);
        return []; // Return empty array on error
    }
};
