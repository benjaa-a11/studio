"use server";

import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
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
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  try {
    const [allChannels, matchSnapshot] = await Promise.all([
      getChannels(),
      getDocs(query(collection(db, "mdc25"), where("date", "==", today)))
    ]);
    
    if (matchSnapshot.empty) {
      console.log("No hay partidos para hoy en Firebase. Usando datos de demostración.");
      return placeholderMatches.filter(match => match.date === today)
        .sort((a, b) => a.time.localeCompare(b.time));
    }

    const channelsMap = new Map(allChannels.map(c => [c.id, c.name]));
    
    const matches = matchSnapshot.docs.map(doc => {
      const data = doc.data();
      const channelIds = (data.channels || []) as string[];
      
      const channels: ChannelOption[] = channelIds
        .map(id => ({
          id: id,
          name: channelsMap.get(id) || ''
        }))
        .filter(channel => channel.name);

      return {
        id: doc.id,
        team1: data.team1,
        team1Logo: data.team1Logo,
        team2: data.team2,
        team2Logo: data.team2Logo,
        time: data.time,
        date: data.date,
        channels: channels,
      } as Match;
    }).sort((a, b) => a.time.localeCompare(b.time));
    
    return matches;
  } catch (error) {
    console.error("Error al obtener partidos de Firebase:", error);
    console.warn("Usando datos de demostración para los partidos.");
    return placeholderMatches.filter(match => match.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }
}
