"use server";

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, Timestamp } from "firebase/firestore";
import type { Channel, Match, ChannelOption } from "@/types";
import { placeholderChannels, placeholderMatches } from "./placeholder-data";

// Helper function to use placeholder data as a fallback
const useFallbackData = () => {
  console.warn("Firebase no disponible o colección vacía. Usando datos de demostración.");
  return placeholderChannels;
};

export async function getChannels(): Promise<Channel[]> {
  try {
    const channelsCollection = collection(db, "channels");
    const channelSnapshot = await getDocs(channelsCollection);
    
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
}

export async function getChannelById(id: string): Promise<Channel | null> {
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
}

export async function getCategories(): Promise<string[]> {
  const channels = await getChannels();
  const categories = new Set(channels.map(channel => channel.category));
  return Array.from(categories).sort();
}

export async function getChannelsByCategory(category: string, excludeId?: string): Promise<Channel[]> {
  const allChannels = await getChannels();
  return allChannels.filter(channel => {
    const isSameCategory = channel.category === category;
    const isNotExcluded = excludeId ? channel.id !== excludeId : true;
    return isSameCategory && isNotExcluded;
  }).slice(0, 5); // Return a max of 5 related channels
}

export async function getTodaysMatches(): Promise<Match[]> {
  const now = new Date();
  // Matches that started up to 3 hours ago are still relevant.
  const lowerBound = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  
  // We only want matches that start today.
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const processMatches = (matchDocs: any[], channelsMap: Map<string, Channel>): Match[] => {
      return matchDocs
          .map(matchData => {
              const matchTimestamp = matchData.matchTimestamp?.toDate ? matchData.matchTimestamp.toDate() : new Date(matchData.matchTimestamp);
              
              if (matchTimestamp < lowerBound || matchTimestamp > endOfDay) return null;

              const channelIds: string[] = Array.isArray(matchData.channels) ? matchData.channels : [];
              const channelOptions: ChannelOption[] = channelIds
                  .map(id => {
                      const channel = channelsMap.get(id);
                      if (!channel) return null;
                      return { id: channel.id, name: channel.name, logoUrl: channel.logoUrl };
                  })
                  .filter((c): c is ChannelOption => c !== null);

              return {
                  id: matchData.id,
                  team1: matchData.team1,
                  team1Logo: matchData.team1Logo,
                  team2: matchData.team2,
                  team2Logo: matchData.team2Logo,
                  time: matchTimestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires', hour12: false }),
                  channels: channelOptions,
                  matchDetails: matchData.matchDetails,
              } as Match;
          })
          .filter((match): match is Match => match !== null)
          .sort((a, b) => a.time.localeCompare(b.time));
  };

  try {
    const allChannels = await getChannels();
    const channelsMap = new Map(allChannels.map(c => [c.id, c]));

    const q = query(
      collection(db, "mdc25"), 
      where("matchTimestamp", ">=", lowerBound),
      where("matchTimestamp", "<=", endOfDay)
    );
    const matchSnapshot = await getDocs(q);
    
    if (matchSnapshot.empty) {
      console.log("No hay partidos para el rango de tiempo actual en Firebase. Usando datos de demostración.");
      return processMatches(placeholderMatches, channelsMap);
    }

    const matchesData = matchSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return processMatches(matchesData, channelsMap);
    
  } catch (error) {
    console.error("Error al obtener partidos de Firebase:", error);
    console.warn("Usando datos de demostración para los partidos.");
    const allChannels = await getChannels();
    const channelsMap = new Map(allChannels.map(c => [c.id, c]));
    return processMatches(placeholderMatches, channelsMap);
  }
}
