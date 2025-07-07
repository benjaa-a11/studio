'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { z } from 'zod';

// Common state type for forms
export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};


// --- CHANNELS ---

const ChannelSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  category: z.string().min(1, { message: 'La categoría es requerida.' }),
  description: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'Cada URL de stream debe ser válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' }),
});

export async function addChannel(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
  };

  const validatedFields = ChannelSchema.safeParse(processedData);
  
  if (!validatedFields.success) {
    return {
      message: 'Error de validación. Por favor, corrija los campos.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await addDoc(collection(db, 'channels'), validatedFields.data);
    revalidatePath('/admin/channels');
    revalidatePath('/');
    return { message: 'Canal añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding channel:', error);
    return { message: 'Error del servidor al intentar añadir el canal.', success: false };
  }
}

export async function updateChannel(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  if (!id) return { message: 'ID de canal no proporcionado.', success: false };
  
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
  };

  const validatedFields = ChannelSchema.safeParse(processedData);

  if (!validatedFields.success) {
    return {
      message: 'Error de validación. Por favor, corrija los campos.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    const channelRef = doc(db, 'channels', id);
    await updateDoc(channelRef, validatedFields.data);
    revalidatePath('/admin/channels');
    revalidatePath(`/canal/${id}`);
    revalidatePath('/');
    return { message: 'Canal actualizado exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error updating channel:', error);
    return { message: 'Error del servidor al intentar actualizar el canal.', success: false };
  }
}

export async function deleteChannel(id: string) {
  if (!id) return { message: 'ID de canal no proporcionado.', success: false };
  
  try {
    await deleteDoc(doc(db, 'channels', id));
    revalidatePath('/admin/channels');
    revalidatePath('/');
    return { message: 'Canal eliminado exitosamente.', success: true };
  } catch (error) {
    console.error('Error deleting channel:', error);
    return { message: 'Error del servidor al intentar eliminar el canal.', success: false };
  }
}


// --- RADIOS ---

const RadioSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  emisora: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'Cada URL de stream debe ser válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' }),
});

export async function addRadio(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  const processedData = {
    ...rawData,
    streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
  };
  const validatedFields = RadioSchema.safeParse(processedData);
  
  if (!validatedFields.success) {
    return {
      message: 'Error de validación.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await addDoc(collection(db, 'radio'), validatedFields.data);
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    return { message: 'Radio añadida exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding radio:', error);
    return { message: 'Error del servidor al intentar añadir la radio.', success: false };
  }
}

export async function updateRadio(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
   if (!id) return { message: 'ID de radio no proporcionado.', success: false };
   
   const rawData = Object.fromEntries(formData.entries());
   const processedData = {
     ...rawData,
     streamUrl: (rawData.streamUrl as string).split(',').map(url => url.trim()).filter(Boolean),
   };
   const validatedFields = RadioSchema.safeParse(processedData);

   if (!validatedFields.success) {
     return {
       message: 'Error de validación.',
       errors: validatedFields.error.flatten().fieldErrors,
       success: false,
     };
   }

   try {
     const radioRef = doc(db, 'radio', id);
     await updateDoc(radioRef, validatedFields.data);
     revalidatePath('/admin/radios');
     revalidatePath('/radio');
     revalidatePath(`/radio/${id}`);
     return { message: 'Radio actualizada exitosamente.', success: true, errors: {} };
   } catch (error) {
     console.error('Error updating radio:', error);
     return { message: 'Error del servidor al intentar actualizar la radio.', success: false };
   }
}

export async function deleteRadio(id: string) {
  if (!id) return { message: 'ID de radio no proporcionado.', success: false };
  
  try {
    await deleteDoc(doc(db, 'radio', id));
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    return { message: 'Radio eliminada exitosamente.', success: true };
  } catch (error) {
    console.error('Error deleting radio:', error);
    return { message: 'Error del servidor al intentar eliminar la radio.', success: false };
  }
}

// --- MOVIES ---

const MovieSchema = z.object({
  tmdbID: z.string().min(1, 'El ID de TMDb es requerido.'),
  streamUrl: z.string().url('Debe ser una URL válida.'),
  format: z.enum(['mp4', 'iframe'], { required_error: 'Debe seleccionar un formato.' }),
  title: z.string().optional(),
  posterUrl: z.string().url('URL de póster no válida').optional().or(z.literal('')),
  synopsis: z.string().optional(),
});

export async function addMovie(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = MovieSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Error de validación.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    try {
        await addDoc(collection(db, 'peliculas'), validatedFields.data);
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        return { message: 'Película añadida exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error adding movie:', error);
        return { message: 'Error del servidor al intentar añadir la película.', success: false };
    }
}

export async function updateMovie(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!id) return { message: 'ID de película no proporcionado.', success: false };

    const validatedFields = MovieSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            message: 'Error de validación.',
            errors: validatedFields.error.flatten().fieldErrors,
            success: false,
        };
    }

    try {
        const movieRef = doc(db, 'peliculas', id);
        await updateDoc(movieRef, validatedFields.data);
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        revalidatePath(`/pelicula/${id}`);
        return { message: 'Película actualizada exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error updating movie:', error);
        return { message: 'Error del servidor al intentar actualizar la película.', success: false };
    }
}

export async function deleteMovie(id: string) {
    if (!id) return { message: 'ID de película no proporcionado.', success: false };

    try {
        await deleteDoc(doc(db, 'peliculas', id));
        revalidatePath('/admin/movies');
        revalidatePath('/peliculas');
        return { message: 'Película eliminada exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting movie:', error);
        return { message: 'Error del servidor al intentar eliminar la película.', success: false };
    }
}

// --- TOURNAMENTS ---

const TournamentSchema = z.object({
  tournamentId: z.string().min(3, 'El ID debe tener al menos 3 caracteres.').regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones.'),
  name: z.string().min(1, 'El nombre es requerido.'),
  logoUrlDark: z.string().url('URL de logo (tema oscuro) no válida.').optional().or(z.literal('')),
  logoUrlLight: z.string().url('URL de logo (tema claro) no válida.').optional().or(z.literal('')),
});

export async function addTournament(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
  }

  const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
  const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };

  try {
    await addDoc(collection(db, 'tournaments'), dataToSave);
    revalidatePath('/admin/tournaments');
    revalidatePath('/');
    return { message: 'Torneo añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding tournament:', error);
    return { message: 'Error del servidor al añadir el torneo.', success: false };
  }
}

export async function updateTournament(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!id) return { message: 'ID de torneo no proporcionado.', success: false };
    
    const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
    const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };

    try {
        await updateDoc(doc(db, 'tournaments', id), dataToSave);
        revalidatePath('/admin/tournaments');
        revalidatePath('/');
        return { message: 'Torneo actualizado exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error updating tournament:', error);
        return { message: 'Error del servidor al actualizar el torneo.', success: false };
    }
}

export async function deleteTournament(id: string) {
    if (!id) return { message: 'ID de torneo no proporcionado.', success: false };
    try {
        await deleteDoc(doc(db, 'tournaments', id));
        revalidatePath('/admin/tournaments');
        revalidatePath('/');
        return { message: 'Torneo eliminado exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting tournament:', error);
        return { message: 'Error del servidor al eliminar el torneo.', success: false };
    }
}

// --- TEAMS ---

const TeamSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'URL de logo no válida.' }),
  country: z.string().min(1, { message: 'El país es requerido.' }),
});

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export async function addTeam(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = TeamSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { name, country, logoUrl } = validatedFields.data;
    const countrySlug = slugify(country);
    const teamSlug = slugify(name);
    
    const teamPath = `teams/${countrySlug}/clubs/${teamSlug}`;
    const teamRef = doc(db, teamPath);

    try {
        const docSnap = await getDoc(teamRef);
        if (docSnap.exists()) {
            return { message: `El equipo con ID '${teamSlug}' ya existe en ese país.`, success: false };
        }

        await setDoc(teamRef, { name, logoUrl, country });
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo añadido exitosamente.', success: true };
    } catch (error) {
        console.error('Error adding team:', error);
        return { message: 'Error del servidor al añadir el equipo.', success: false };
    }
}

export async function updateTeam(path: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!path) return { message: 'Ruta del equipo no proporcionada.', success: false };

    const validatedFields = TeamSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    // NOTE: Updating a team does not change its path/ID, as that could break relationships.
    // The country and name are part of the data, but changing them doesn't move the document.
    try {
        await updateDoc(doc(db, path), validatedFields.data);
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo actualizado exitosamente.', success: true };
    } catch (error) {
        console.error('Error updating team:', error);
        return { message: 'Error del servidor al actualizar el equipo.', success: false };
    }
}

export async function deleteTeam(path: string) {
    if (!path) return { message: 'Ruta del equipo no proporcionada.', success: false };
    
    try {
        await deleteDoc(doc(db, path));
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo eliminado exitosamente.', success: true };
    } catch (error) {
        console.error('Error deleting team:', error);
        return { message: 'Error del servidor al eliminar el equipo.', success: false };
    }
}
