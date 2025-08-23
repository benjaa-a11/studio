
export type StreamSource = string;

export type Channel = {
  id: string;
  name: string;
  logoUrl: string[];
  streamUrl: StreamSource[];
  category: string;
  description?: string;
  isHidden?: boolean;
};

export type ChannelOption = {
  id: string;
  name: string;
  logoUrl?: string[];
};

export type Match = {
  id: string;
  team1: string;
  team1Logo?: string;
  team2: string;
  team2Logo?: string;
  time: string;
  isLive: boolean;
  isWatchable: boolean;
  channels: ChannelOption[];
  dates?: string;
  matchTimestamp: Date;
  tournamentName?: string;
  tournamentLogo?: string | { light: string; dark: string };
  statusText?: string; // e.g., "Finalizado", "Entretiempo"
  imageUrl?: string; // For league tables, results, etc.
};

export type AdminAgendaMatch = {
  id: string;
  team1: string;
  team2: string;
  tournamentId: string;
  channels: string[];
  dates?: string;
  time: Date;
  statusText?: string;
  imageUrl?: string;
  // Enriched data for display
  team1Name?: string;
  team2Name?: string;
  tournamentName?: string;
}

export type Radio = {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string[];
  emisora?: string;
};

export type Tournament = {
  id: string; // The firestore document ID
  tournamentId: string; // The user-facing ID, stored in the `id` field of the doc
  name: string;
  logoUrl: string[]; // [dark_theme_logo, light_theme_logo]
};

export type Team = {
  id: string; // The firestore document ID
  path: string; // The full path to the document for collectionGroup operations
  name: string;
  logoUrl: string;
  country: string;
};

export type News = {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  source: string;
  date: string; // ISO 8601 string
};

export type FeaturedImage = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string; // ISO 8601 string
};


export type AppStatus = {
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  disabledSections: string[];
}
