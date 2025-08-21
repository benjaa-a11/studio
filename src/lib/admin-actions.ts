
'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase'; // Use the client-side db instance
import { collection, doc, addDoc, updateDoc, deleteDoc, setDoc, getDoc, query, getDocs, Timestamp, deleteField, orderBy, writeBatch } from 'firebase/firestore';
import { z } from 'zod';
import type { AdminAgendaMatch, AppStatus, News, StreamSource } from '@/types';

// Common state type for forms
export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};

// Helper to create URL-friendly slugs, now handles accents and special characters
const slugify = (text: string) => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

// --- CHANNELS ---

const StreamSourceSchema = z.union([
  z.string().url({ message: 'URL no válida.' }),
  z.object({
    url: z.string().url({ message: 'URL de DRM no válida.' }),
    k1: z.string().optional(),
    k2: z.string().optional(),
  })
]);


const ChannelSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrlDark: z.string().url({ message: 'Debe ser una URL de logo válida para tema oscuro.' }).optional().or(z.literal('')),
  logoUrlLight: z.string().url({ message: 'Debe ser una URL de logo válida para tema claro.' }).optional().or(z.literal('')),
  category: z.string().min(1, { message: 'La categoría es requerida.' }),
  description: z.string().optional(),
  streamUrl: z.string().transform((val, ctx) => {
    try {
      const parsed = JSON.parse(val);
      const result = z.array(StreamSourceSchema).safeParse(parsed);
      if (!result.success) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las fuentes de stream no son válidas." });
        return z.NEVER;
      }
      return result.data;
    } catch (e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Formato de streamUrl inválido." });
      return z.NEVER;
    }
  }).refine(urls => urls.length > 0, { message: "Se requiere al menos una fuente de stream." }),
  isHidden: z.boolean().optional(),
}).refine(data => data.logoUrlDark || data.logoUrlLight, {
  message: 'Se debe proporcionar al menos una URL de logo.',
  path: ['logoUrlDark'], // Attach error to one of the logo fields
});


export async function addChannel(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const rawData = {
        name: formData.get('name'),
        logoUrlDark: formData.get('logoUrlDark'),
        logoUrlLight: formData.get('logoUrlLight'),
        category: formData.get('category'),
        description: formData.get('description'),
        streamUrl: formData.get('streamUrl'), // This is now a JSON string
        isHidden: formData.get('isHidden') === 'on',
    };

    const validatedFields = ChannelSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
      return {
        message: 'Error de validación. Por favor, corrija los campos.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    const { name, logoUrlDark, logoUrlLight, ...rest } = validatedFields.data;
    const dataToSave = {
        ...rest,
        name,
        logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean),
    };
    const id = slugify(name);
    const channelRef = doc(db, 'channels', id);

    const docSnap = await getDoc(channelRef);
    if (docSnap.exists()) {
      return { message: `Un canal con el ID '${id}' ya existe.`, success: false };
    }

    await setDoc(channelRef, dataToSave);
    revalidatePath('/admin/channels');
    revalidatePath('/');
    return { message: 'Canal añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding channel:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor al intentar añadir el canal.';
    return { message, success: false };
  }
}

export async function updateChannel(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  if (!id) return { message: 'ID de canal no proporcionado.', success: false };
  
  try {
     const rawData = {
        name: formData.get('name'),
        logoUrlDark: formData.get('logoUrlDark'),
        logoUrlLight: formData.get('logoUrlLight'),
        category: formData.get('category'),
        description: formData.get('description'),
        streamUrl: formData.get('streamUrl'), // This is a JSON string
        isHidden: formData.get('isHidden') === 'on',
    };

    const validatedFields = ChannelSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: 'Error de validación. Por favor, corrija los campos.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const { logoUrlDark, logoUrlLight, ...rest } = validatedFields.data;
    const dataToSave = {
        ...rest,
        logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean),
    };

    const channelRef = doc(db, 'channels', id);
    await updateDoc(channelRef, dataToSave);
    revalidatePath('/admin/channels');
    revalidatePath(`/canal/${id}`);
    revalidatePath('/');
    return { message: 'Canal actualizado exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error updating channel:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor al intentar actualizar el canal.';
    return { message, success: false };
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
    const message = error instanceof Error ? error.message : 'Error del servidor al intentar eliminar el canal.';
    return { message, success: false };
  }
}


// --- RADIOS ---

const RadioSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  emisora: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'URL no válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' })
    .refine(urls => urls.every(url => url.trim().length > 0), { message: 'Ninguna URL puede estar vacía.' }),
});

export async function addRadio(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const rawData = {
        name: formData.get('name'),
        logoUrl: formData.get('logoUrl'),
        emisora: formData.get('emisora'),
        streamUrl: formData.getAll('streamUrl[]').filter(Boolean),
    };
    const validatedFields = RadioSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
      return {
        message: 'Error de validación.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }
    
    const { name } = validatedFields.data;
    const id = slugify(name);
    const radioRef = doc(db, 'radio', id);

    const docSnap = await getDoc(radioRef);
    if (docSnap.exists()) {
      return { message: `Una radio con el ID '${id}' ya existe.`, success: false };
    }

    await setDoc(radioRef, validatedFields.data);
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    return { message: 'Radio añadida exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding radio:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor al intentar añadir la radio.';
    return { message, success: false };
  }
}

export async function updateRadio(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
   if (!id) return { message: 'ID de radio no proporcionado.', success: false };
   
   try {
    const rawData = {
        name: formData.get('name'),
        logoUrl: formData.get('logoUrl'),
        emisora: formData.get('emisora'),
        streamUrl: formData.getAll('streamUrl[]').filter(Boolean),
    };
    const validatedFields = RadioSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        message: 'Error de validación.',
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      };
    }

    const radioRef = doc(db, 'radio', id);
    await updateDoc(radioRef, validatedFields.data);
    revalidatePath('/admin/radios');
    revalidatePath('/radio');
    revalidatePath(`/radio/${id}`);
    return { message: 'Radio actualizada exitosamente.', success: true, errors: {} };
  } catch (error) {
     console.error('Error updating radio:', error);
     const message = error instanceof Error ? error.message : 'Error del servidor al intentar actualizar la radio.';
     return { message, success: false };
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
    const message = error instanceof Error ? error.message : 'Error del servidor al intentar eliminar la radio.';
    return { message, success: false };
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
  try {
    const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
    
    if (!validatedFields.success) {
      return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }

    const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
    const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };
    
    const docId = slugify(name);
    const tournamentRef = doc(db, 'tournaments', docId);

    const docSnap = await getDoc(tournamentRef);
      if (docSnap.exists()) {
        return { message: `Un torneo con el ID '${docId}' ya existe.`, success: false };
      }

      await setDoc(tournamentRef, dataToSave);
      revalidatePath('/admin/tournaments');
      revalidatePath('/');
      return { message: 'Torneo añadido exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding tournament:', error);
    const message = error instanceof Error ? error.message : 'Error del servidor al añadir el torneo.';
    return { message, success: false };
  }
}

export async function updateTournament(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!id) return { message: 'ID de torneo no proporcionado.', success: false };
    
    try {
        const validatedFields = TournamentSchema.safeParse(Object.fromEntries(formData.entries()));
        if (!validatedFields.success) {
            return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
        }
        
        const { tournamentId, name, logoUrlDark, logoUrlLight } = validatedFields.data;
        const dataToSave = { id: tournamentId, name, logoUrl: [logoUrlDark, logoUrlLight].filter(Boolean) };

        await updateDoc(doc(db, 'tournaments', id), dataToSave);
        revalidatePath('/admin/tournaments');
        revalidatePath('/');
        return { message: 'Torneo actualizado exitosamente.', success: true, errors: {} };
    } catch (error) {
        console.error('Error updating tournament:', error);
        const message = error instanceof Error ? error.message : 'Error del servidor al actualizar el torneo.';
        return { message, success: false };
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
        const message = error instanceof Error ? error.message : 'Error del servidor al eliminar el torneo.';
        return { message, success: false };
    }
}

// --- TEAMS ---

const TeamSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'URL de logo no válida.' }),
  country: z.string().min(1, { message: 'El país es requerido.' }),
});

export async function addTeam(prevState: FormState, formData: FormData): Promise<FormState> {
    try {
        const validatedFields = TeamSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
            return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
        }
        
        const { name, country, logoUrl } = validatedFields.data;
        const countrySlug = slugify(country);
        const teamSlug = slugify(name);
        
        const teamPath = `teams/${countrySlug}/clubs/${teamSlug}`;
        const teamRef = doc(db, teamPath);

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
        const message = error instanceof Error ? error.message : 'Error del servidor al añadir el equipo.';
        return { message, success: false };
    }
}

export async function updateTeam(path: string, prevState: FormState, formData: FormData): Promise<FormState> {
    if (!path) return { message: 'Ruta del equipo no proporcionada.', success: false };

    try {
        // When updating, we only care about logoUrl, as name and country define the path.
        const UpdateSchema = TeamSchema.pick({ logoUrl: true });
        const validatedFields = UpdateSchema.safeParse(Object.fromEntries(formData.entries()));

        if (!validatedFields.success) {
            return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
        }
        
        await updateDoc(doc(db, path), validatedFields.data);
        revalidatePath('/admin/teams');
        revalidatePath('/');
        return { message: 'Equipo actualizado exitosamente.', success: true };
    } catch (error) {
        console.error('Error updating team:', error);
        const message = error instanceof Error ? error.message : 'Error del servidor al actualizar el equipo.';
        return { message, success: false };
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
        const message = error instanceof Error ? error.message : 'Error del servidor al eliminar el equipo.';
        return { message, success: false };
    }
}

// --- AGENDA ---

const AgendaSchema = z.object({
    tournamentId: z.string().min(1),
    team1: z.string().min(1),
    team2: z.string().min(1),
    time: z.date(),
    channels: z.array(z.string()),
    dates: z.string().optional(),
    statusText: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
});

const handleMatchAction = async (data: any, existingId?: string) => {
    const validatedFields = AgendaSchema.safeParse({
        ...data,
        time: new Date(data.time),
    });

    if (!validatedFields.success) {
        console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
        throw new Error('Faltan datos requeridos o son inválidos para guardar el partido.');
    }
    
    if (validatedFields.data.team1 === validatedFields.data.team2) {
        throw new Error('Los equipos no pueden ser iguales.');
    }

    const { time, ...restOfData } = validatedFields.data;
    const matchTimestamp = Timestamp.fromDate(time);
    const dataToSave: Record<string, any> = { ...restOfData, time: matchTimestamp };

    // Ensure optional fields are removed if empty to keep Firestore clean
    if (!dataToSave.dates) dataToSave.dates = deleteField();
    if (!dataToSave.statusText) dataToSave.statusText = deleteField();
    if (!dataToSave.imageUrl) dataToSave.imageUrl = deleteField();


    if (existingId) {
        // Update existing match
        const matchRef = doc(db, 'agenda', existingId);
        await updateDoc(matchRef, dataToSave);
    } else {
        // Create new match
        const dateString = time.toISOString().split('T')[0];
        const id = `${slugify(validatedFields.data.team1)}-vs-${slugify(validatedFields.data.team2)}-${dateString}`;
        const matchRef = doc(db, 'agenda', id);

        const docSnap = await getDoc(matchRef);
        if (docSnap.exists()) {
            throw new Error(`Un partido con ID '${id}' ya existe.`);
        }
        await setDoc(matchRef, dataToSave);
    }
    
    revalidatePath('/admin/agenda');
    revalidatePath('/');
}

export async function addMatch(prevState: FormState, data: AdminAgendaMatch) {
    try {
        await handleMatchAction(data);
        return { success: true, message: 'Partido añadido exitosamente.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error del servidor al añadir el partido.';
        console.error("Error adding match:", error);
        return { success: false, message: errorMessage };
    }
}

export async function updateMatch(id: string, prevState: FormState, data: AdminAgendaMatch) {
    if (!id) return { success: false, message: 'ID de partido no proporcionado.' };
    try {
        await handleMatchAction(data, id);
        return { success: true, message: 'Partido actualizado exitosamente.' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error del servidor al actualizar el partido.';
        console.error("Error updating match:", error);
        return { success: false, message: errorMessage };
    }
}

export async function deleteMatch(id: string) {
    if (!id) return { message: 'ID de partido no proporcionado.', success: false };
    
    try {
        await deleteDoc(doc(db, 'agenda', id));
        revalidatePath('/admin/agenda');
        revalidatePath('/');
        return { message: 'Partido eliminado exitosamente.', success: true };
    } catch (error) {
        console.error("Error deleting match:", error);
        const message = error instanceof Error ? error.message : 'Error del servidor al eliminar el partido.';
        return { message, success: false };
    }
}

// Action to fetch all agenda items for the admin panel, sorted chronologically.
export async function getAdminAgenda(): Promise<AdminAgendaMatch[]> {
    try {
        const agendaSnapshot = await getDocs(query(collection(db, "agenda"), orderBy("time", "asc")));
        const matches = agendaSnapshot.docs.map(doc => {
            const data = doc.data();
            const time = (data.time as Timestamp).toDate();
            return {
                id: doc.id,
                team1: data.team1,
                team2: data.team2,
                tournamentId: data.tournamentId,
                channels: data.channels || [],
                dates: data.dates || '',
                statusText: data.statusText || '',
                imageUrl: data.imageUrl || '',
                time: time
            } as AdminAgendaMatch
        });
        
        return matches;

    } catch (error) {
        console.error("Error fetching admin agenda:", error);
        return [];
    }
}

// --- NEWS ---

const NewsSchema = z.object({
  title: z.string().min(1, { message: 'El título es requerido.' }),
  url: z.string().url({ message: 'La URL del artículo no es válida.' }),
  imageUrl: z.string().url({ message: 'La URL de la imagen no es válida.' }),
  source: z.string().min(1, { message: 'La fuente es requerida.' }),
  date: z.string().datetime({ message: 'La fecha no es válida.' }),
});

export async function addNews(prevState: FormState, formData: FormData): Promise<FormState> {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = NewsSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }
    
    const { title, date, ...rest } = validatedFields.data;
    const dataToSave = {
      ...rest,
      title,
      date: Timestamp.fromDate(new Date(date)),
    };
    
    const id = slugify(title);
    const newsRef = doc(db, 'news', id);
    const docSnap = await getDoc(newsRef);

    if (docSnap.exists()) {
      return { message: `Una noticia con el ID '${id}' ya existe.`, success: false };
    }

    await setDoc(newsRef, dataToSave);
    revalidatePath('/admin/news');
    revalidatePath('/noticias');
    return { message: 'Noticia añadida exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error adding news:', error);
    return { message: 'Error del servidor al añadir la noticia.', success: false };
  }
}

export async function updateNews(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  if (!id) return { message: 'ID de noticia no proporcionado.', success: false };
  
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = NewsSchema.safeParse(rawData);
    
    if (!validatedFields.success) {
      return { message: 'Error de validación.', errors: validatedFields.error.flatten().fieldErrors, success: false };
    }

    const { date, ...rest } = validatedFields.data;
    const dataToSave = {
      ...rest,
      date: Timestamp.fromDate(new Date(date)),
    };

    await updateDoc(doc(db, 'news', id), dataToSave);
    revalidatePath('/admin/news');
    revalidatePath('/noticias');
    revalidatePath(`/noticias/${id}`);
    return { message: 'Noticia actualizada exitosamente.', success: true, errors: {} };
  } catch (error) {
    console.error('Error updating news:', error);
    return { message: 'Error del servidor al actualizar la noticia.', success: false };
  }
}

export async function deleteNews(id: string) {
  if (!id) return { message: 'ID de noticia no proporcionado.', success: false };
  
  try {
    await deleteDoc(doc(db, 'news', id));
    revalidatePath('/admin/news');
    revalidatePath('/noticias');
    return { message: 'Noticia eliminada exitosamente.', success: true };
  } catch (error) {
    console.error('Error deleting news:', error);
    return { message: 'Error del servidor al eliminar la noticia.', success: false };
  }
}
