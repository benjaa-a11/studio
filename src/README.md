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
        "channels": ["dsports", "telefe"]
    }
    ```
    **Importante:** El campo `channels` debe ser de tipo **array** y contener una lista de IDs (en formato texto). Cada ID debe coincidir con el ID de un documento en tu colección `channels`. La aplicación se encargará de buscar el nombre del canal automáticamente.

    ### ¿Cómo agregar la lista de canales en Firebase?

    1.  Ve a tu **Colección `mdc25`** en Firestore.
    2.  Selecciona el partido que quieres editar o crea uno nuevo.
    3.  Busca el campo `channels`. Si no existe, haz clic en **"Añadir campo"**.
    4.  **Nombre del campo:** `channels`
    5.  **Tipo:** Selecciona **`array`** en el menú desplegable.
    6.  Ahora podrás agregar los valores a la lista:
        *   En `valor 0` (tipo `string`), escribe el ID del primer canal (ej: `dsports`).
        *   Haz clic en el botón `+` para añadir otro campo a la lista.
        *   En `valor 1` (tipo `string`), escribe el ID del segundo canal (ej: `telefe`).
        *   Repite para todos los canales disponibles para ese partido.
    7.  Haz clic en **"Actualizar"** para guardar los cambios.

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
