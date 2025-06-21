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

2.  **Firestore Database**: The application expects a Firestore database with two collections: `channels` and `mdc25`.

3.  **Data Structure**: Each document in the `channels` collection should have the following structure:
    ```json
    {
      "name": "Channel Name",
      "logoUrl": "https://...",
      "streamUrl": "https://... (embeddable link)",
      "category": "Category Name",
      "description": "A brief channel description."
    }
    ```

4.  **Mundial de Clubes 2025**: The hero section on the homepage fetches matches from the `mdc25` collection. Each document should have the following structure:
    ```json
    {
        "team1": "Team A Name",
        "team1Logo": "https://...",
        "team2": "Team B Name",
        "team2Logo": "https://...",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "channels": ["channel_id_1", "channel_id_2"]
    }
    ```
    The `channels` field must be an array of **strings**. Each string should be the document ID of a channel from your `channels` collection. The app will automatically fetch the channel name.

    ### How to Add the Channel List in Firebase?

    1.  Go to your **`mdc25` Collection** in Firestore.
    2.  Select the match you want to edit or create a new one.
    3.  Find the `channels` field. If it doesn't exist, click **"Add field"**.
    4.  **Field name:** `channels`
    5.  **Type:** Select **`array`** from the dropdown menu.
    6.  Now you can add the values to the list:
        *   For `value 0` (type `string`), enter the ID of the first channel (e.g., `dsports`).
        *   Click the `+` button to add another item to the list.
        *   For `value 1` (type `string`), enter the ID of the second channel (e.g., `telefe`).
        *   Repeat for all available channels for that match.
    7.  Click **"Update"** to save the changes.

5.  **Security Rules**: For production, ensure your Firestore security rules are properly configured to allow read access to the collections. A basic rule for public read access would be:
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /channels/{channelId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
        match /mdc25/{matchId} {
          allow read: if true;
          allow write: if false; // Or your admin logic
        }
      }
    }
    ```

For demonstration purposes, the application will use placeholder data if it cannot fetch data from Firebase.
