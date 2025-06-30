# Plan B Streaming

This is a Next.js application for streaming live TV channels, built with Firebase integration.

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

1.  **Firebase Configuration**: The Firebase configuration is located in `src/lib/firebase.ts`. The placeholder values from the proposal have been used.

2.  **Firestore Database**: The application expects a Firestore database with four collections: `channels`, `peliculas`, `mdc25`, and `copaargentina`.

3.  **Data Structure**: 
    - Each document in the `channels` collection should have the following structure:
        ```json
        {
          "name": "Channel Name",
          "logoUrl": "https://...",
          "streamUrl": ["https://... (primary link)", "https://... (fallback link)"],
          "category": "Category Name",
          "description": "A brief channel description."
        }
        ```
        - **`streamUrl`**: This is an array of strings. The user can manually switch to other sources in the array if the primary one fails.

    - Each document in the `peliculas` collection should have the following structure:
        ```json
        {
            "tmdbID": "157336",
            "streamUrl": "https://... (mp4 or iframe link)",
            "format": "mp4" or "iframe",
            "title": "(Optional) Title to override TMDb's",
            "posterUrl": "(Optional) Poster URL to override",
            "synopsis": "(Optional) Synopsis to override",
            "category": ["(Optional) Array", "of", "categories"],
            "year": "(Optional) Year (number) to override",
            "duration": "(Optional) Duration string to override"
        }
        ```
        - **`tmdbID`**: **(Required)** The TheMovieDB ID of the movie (e.g., `157336` for Interstellar). The app will fetch all other details like title, poster, director, rating, etc., automatically from the TMDb API in Spanish.
        - **`streamUrl`**: **(Required)** The direct link (`.mp4`) or embeddable link (`iframe`) for the movie stream.
        
        #### How to Display Data
        
        The app uses the TMDb API to fetch movie details, which provides data in Spanish by default.
        
        However, the system is designed to give you full control. Simply **add the fields you want to override to your Firestore document, and they will be used instead of the data from the API.**
        
        **Example of a Firestore document with a Spanish title override:**
        
        ```json
        {
          "tmdbID": "27205",
          "streamUrl": "https://...",
          "format": "mp4",
          "title": "El Origen (Título Personalizado)", 
          "synopsis": "Una sinopsis personalizada en español..."
        }
        ```
        
        In this example, the app will display the custom Spanish title and synopsis you provided, while still automatically fetching other data like year, director, and actors from the API. If you don't provide these override fields, the Spanish versions from the API will be used.

    - Each document in the `mdc25` and `copaargentina` collections should have the following structure:
        ```json
        {
            "team1": "Team A Name",
            "team1Logo": "https://...",
            "team2": "Team B Name",
            "team2Logo": "https://...",
            "matchTimestamp": "(Timestamp) June 20, 2025 at 4:00:00 PM (Argentinian Time)",
            "channels": ["channel_id_1", "channel_id_2"],
            "matchDetails": "Fase de grupos · Grupo E · Jornada 2 de 3"
        }
        ```
        - **`matchTimestamp`**: This is the most important field. It must be of type **`timestamp`** in Firestore. It determines when the match is shown. **Important:** When you select the date and time in the Firebase console, it will use your computer's local time zone. The application will correctly display it in Argentinian time (UTC-3). Matches will appear on the homepage **only if their start date is the current day** and will disappear 3 hours after they have started.
        - **`channels`**: This must be an array of **strings**. Each string should be the document ID of a channel from your `channels` collection. The app will automatically fetch the channel name.
        - **`matchDetails`**: This is an optional **`string`** field where you can add extra information about the match, such as the tournament stage (e.g., "Fase de grupos · Grupo E · Jornada 2 de 3").

    ### How to Add a Match with a Timestamp

    1.  Go to your **`mdc25`** or **`copaargentina`** Collection in Firestore.
    2.  Create a new document for your match.
    3.  Add the team and logo fields as usual.
    4.  Click **"Add field"** and enter `matchTimestamp` as the field name.
    5.  For **Type**, select **`timestamp`** from the dropdown menu.
    6.  A date and time picker will appear. Select the exact date and start time for the match.
    7.  Add the `channels` field as an `array` of strings.
    8.  Optionally, add the `matchDetails` field as a `string`.
    9.  Click **"Save"**.

4.  **Security Rules**: For production, ensure your Firestore security rules are properly configured to allow read access to the collections. A basic rule for public read access would be:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /channels/{channelId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
        match /peliculas/{peliculaId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
        match /mdc25/{matchId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
        match /copaargentina/{matchId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
      }
    }
    ```

For demonstration purposes, the application will use placeholder data if it cannot fetch data from Firebase.
