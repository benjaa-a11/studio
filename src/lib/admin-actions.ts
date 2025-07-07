'use server';

import { revalidatePath } from 'next/cache';
import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { z } from 'zod';

// Schema for channel validation
const ChannelSchema = z.object({
  name: z.string().min(1, { message: 'El nombre es requerido.' }),
  logoUrl: z.string().url({ message: 'Debe ser una URL de logo válida.' }),
  category: z.string().min(1, { message: 'La categoría es requerida.' }),
  description: z.string().optional(),
  streamUrl: z.array(z.string().url({ message: 'Cada URL de stream debe ser válida.' })).min(1, { message: 'Se requiere al menos una URL de stream.' }),
});

export type FormState = {
  message: string;
  errors?: Record<string, string[] | undefined>;
  success: boolean;
};

// CREATE
export async function addChannel(prevState: FormState, formData: FormData): Promise<FormState> {
  const rawData = Object.fromEntries(formData.entries());
  // Convert streamUrl from comma-separated string to array
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

// UPDATE
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

// DELETE
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
