'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
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

    