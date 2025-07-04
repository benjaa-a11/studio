# Plan B Streaming

This is a Next.js application for streaming live TV channels and movies, built with Firebase integration.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Firebase Setup

This application is configured to connect to a Firebase project.

1.  **Firebase Configuration**: The Firebase configuration is now securely managed via environment variables in your `.env.local` file.

2.  **Firestore Database**: The application expects a Firestore database with four main collections: `channels`, `peliculas`, `agenda`, `tournaments`, and `teams`.

3.  **Data Structure**:
    -   **`channels` Collection**: Each document represents a TV channel.
        ```json
        {
          "name": "Channel Name",
          "logoUrl": "https://...",
          "streamUrl": ["https://... (primary link)", "https://... (fallback link)"],
          "category": "Category Name",
          "description": "A brief channel description."
        }
        ```

    -   **`peliculas` Collection**: Each document represents a movie.
        ```json
        {
            "tmdbID": "157336",
            "streamUrl": "https://... (mp4 or iframe link)",
            "format": "mp4" or "iframe",
            "title": "(Optional) Title to override TMDb's",
            "posterUrl": "(Optional) Poster URL to override",
            "synopsis": "(Optional) Synopsis to override"
        }
        ```
        -   **`(Required)` `tmdbID`**: The TheMovieDB ID of the movie. The app will fetch all other details automatically from the TMDb API.
        
    -   **`agenda` Collection**: This collection holds all scheduled matches.
        ```json
        {
            "team1": "team_id_1",
            "team2": "team_id_2",
            "time": "(Timestamp) June 20, 2025 at 4:00:00 PM (Your Local Time)",
            "tournamentId": "tournament_id_1",
            "channels": ["channel_id_1", "channel_id_2"],
            "date": "Fase de grupos · Grupo E · Jornada 2 de 3"
        }
        ```
        -   **`team1`, `team2`**: The **document ID** of the respective team from the `teams` collection group.
        -   **`time`**: **(Required)** This must be of type **`timestamp`** in Firestore. It determines when the match is shown. The application will correctly display it in Argentinian time (UTC-3). Matches appear on the homepage only if their start date is the current day and disappear 3 hours after they have started.
        -   **`tournamentId`**: The **document ID** of the tournament from the `tournaments` collection.
        -   **`channels`**: An array of **strings**, where each string is the document ID of a channel from your `channels` collection.
        -   **`date`**: An optional **`string`** field for extra details (e.g., "Round 1 of 3").

    -   **`tournaments` Collection**: Holds details for each competition.
        ```json
        {
            "name": "Tournament Name",
            "logoUrl": ["https://... (dark theme logo)", "https://... (light theme logo)"]
        }
        ```
        - The **document ID** of each tournament is used in the `agenda`.
        - **`logoUrl`**: An **array** of strings. The first URL is for dark mode, the second for light mode. If only one URL is provided, it will be used for both themes.

    -   **`teams` Collection**: This is structured as a collection group for better organization.
        -   **Structure:** `teams` -> `{country_document}` -> `clubs` -> `{team_document}`
        -   Each **team document** has the following structure:
        ```json
        {
            "name": "Team Name",
            "logoUrl": "https://...",
            "country": "Country Name"
        }
        ```
        -   The **document ID** of each team is used in the `agenda`.

4.  **Security Rules**: For production, ensure your Firestore security rules are properly configured to allow public read access.
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow reads on all collections for this example
        match /{document=**} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
      }
    }
    ```

For demonstration purposes, the application will use placeholder data if it cannot fetch data from Firebase.
