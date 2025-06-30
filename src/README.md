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
        - **`streamUrl`**: This is an array of strings. The user can manually switch between sources if the primary one fails.

    - Each document in the `peliculas` collection should have the following structure:
        ```json
        {
            "tmdbID": "157336",
            "streamUrl": "https://... (enlace mp4 o iframe)",
            "format": "mp4" or "iframe",
            "title": "(Opcional) Título para sobreescribir",
            "posterUrl": "(Opcional) URL del póster para sobreescribir",
            "synopsis": "(Opcional) Sinopsis para sobreescribir",
            "category": ["(Opcional) Array", "de", "categorías"],
            "year": "(Opcional) Año (número) para sobreescribir",
            "duration": "(Opcional) Duración para sobreescribir"
        }
        ```
        - **`tmdbID`**: **(Requerido)** El ID de TheMovieDB de la película (ej: `157336` para Interestelar). La aplicación obtendrá automáticamente todos los demás detalles (título, póster, director, etc.) en español desde la API de TMDb.
        - **`streamUrl`**: **(Requerido)** El enlace directo (`.mp4`) o de inserción (`iframe`) para el streaming de la película.
        
        #### ¿Cómo funcionan los datos?
        
        La aplicación usa la API de TMDb para obtener los detalles de las películas, y esta API devuelve la información directamente en español.
        
        ¡Pero no hay problema! El sistema está diseñado para darte control total. Simplemente **añade los campos que quieras sobreescribir a tu documento de Firestore, y estos reemplazarán los datos de la API.**
        
        **Ejemplo de un documento en Firestore:**
        
        ```json
        {
          "tmdbID": "27205",
          "streamUrl": "https://...",
          "format": "mp4",
          "title": "El Origen (Título Personalizado)",
          "synopsis": "Dom Cobb es un ladrón, el mejor de todos, especialista en el peligroso arte de la extracción: el robo de valiosos secretos desde las profundidades del subconsciente...",
        }
        ```
        
        En este ejemplo, la aplicación mostrará el título y la sinopsis que tú definiste, mientras que el resto de los datos (año, director, actores, etc.) se seguirán obteniendo automáticamente de la API. Si no añades `title` o `synopsis`, se usarán las versiones en español de TMDb.

    - Each document in the `mdc25` and `copaargentina` collections should have the following structure:
        ```json
        {
            "team1": "Team A Name",
            "team1Logo": "https://...",
            "team2": "Team B Name",
            "team2Logo": "https://...",
            "matchTimestamp": "(Timestamp) 20 de Junio, 2025 a las 16:00:00 (Hora de Argentina)",
            "channels": ["dsports", "telefe"],
            "matchDetails": "Fase de grupos · Grupo E · Jornada 2 de 3"
        }
        ```
        - **`matchTimestamp`**: Este es el campo más importante. Debe ser de tipo **`timestamp`** en Firestore y determina cuándo se muestra el partido. **Importante:** Al seleccionar la fecha y hora en la consola de Firebase, esta usará la zona horaria de tu computadora. La aplicación se encargará de mostrarla siempre en horario de Argentina (UTC-3). Los partidos aparecerán en la página de inicio **solo si su fecha de inicio es el día actual** y desaparecerán 3 horas después de haber comenzado.
        - **`channels`**: Debe ser un **`array`** de **`strings`** (texto). Cada string debe ser el ID de un documento de tu colección `channels`. La aplicación buscará el nombre del canal automáticamente.
        - **`matchDetails`**: Este es un campo opcional de tipo **`string`** (texto) donde puedes añadir información extra sobre el partido, como la fase del torneo (ej: "Fase de grupos · Grupo E · Jornada 2 de 3").


    ### ¿Cómo agregar un partido con Timestamp?

    1.  Ve a tu **Colección `mdc25`** o **`copaargentina`** en Firestore.
    2.  Crea un nuevo documento para tu partido.
    3.  Añade los campos de los equipos y logos como de costumbre.
    4.  Haz clic en **"Añadir campo"** y escribe `matchTimestamp` como nombre.
    5.  En **Tipo**, selecciona **`timestamp`** en el menú desplegable.
    6.  Aparecerá un selector de fecha y hora. Elige el día y la hora exactos de inicio del partido.
    7.  Añade el campo `channels` como un `array` de strings.
    8.  Opcionalmente, añade el campo `matchDetails` de tipo `string`.
    9.  Haz clic en **"Guardar"**.

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
