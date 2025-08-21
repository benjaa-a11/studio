
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import type { FeaturedImage } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { addImage, updateImage, deleteImage } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical, Search, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Imagen'}
        </Button>
    )
}

function ImageForm({ imageItem, onFormSubmit }: { imageItem?: FeaturedImage | null; onFormSubmit: () => void }) {
  const formAction = imageItem?.id ? updateImage.bind(null, imageItem.id) : addImage;
  const [state, dispatch] = useActionState(formAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (!state.message) return;

    if (state.success) {
        toast({
            title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Éxito</span></div>,
            description: state.message,
        });
        onFormSubmit();
    } else {
        toast({
            variant: 'destructive',
            title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
            description: state.message,
        });
    }
    state.message = '';
    state.success = false;
    state.errors = {};
  }, [state, onFormSubmit, toast]);

  return (
    <form action={dispatch}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={imageItem?.title} />
          {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Categoría</Label>
          <Input id="category" name="category" defaultValue={imageItem?.category} placeholder="Ej: Tabla de Posiciones"/>
           {state.errors?.category && <p className="text-sm font-medium text-destructive">{state.errors.category.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">URL de la Imagen</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={imageItem?.imageUrl} />
           {state.errors?.imageUrl && <p className="text-sm font-medium text-destructive">{state.errors.imageUrl.join(', ')}</p>}
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!imageItem} />
      </DialogFooter>
    </form>
  );
}

function AdminImageCard({ item, onEdit, onDelete }: { item: FeaturedImage; onEdit: (item: FeaturedImage) => void; onDelete: (item: FeaturedImage) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={item.imageUrl} alt={item.title} width={64} height={64} className="object-cover rounded-md border p-1 aspect-square" />
                <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="font-semibold truncate">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(item)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function ImageDataTable({ data }: { data: FeaturedImage[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FeaturedImage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleEditClick = (imageItem: FeaturedImage) => {
    setSelectedImage(imageItem);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedImage(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (imageItem: FeaturedImage) => {
    setSelectedImage(imageItem);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedImage) return;
    const result = await deleteImage(selectedImage.id);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Imagen Eliminada</span></div>,
        description: result.message
      });
    } else {
      toast({
        variant: 'destructive',
        title: <div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Error</span></div>,
        description: result.message
      });
    }
    setIsAlertOpen(false);
    setSelectedImage(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedImage(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-4">
        <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <Button onClick={handleAddClick} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Imagen
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedImage ? 'Editar Imagen' : 'Añadir Nueva Imagen'}</DialogTitle>
            <DialogDescription>
              {selectedImage ? 'Modifica los detalles de la imagen existente.' : 'Completa el formulario para añadir una nueva imagen.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <ImageForm key={selectedImage?.id || 'new'} imageItem={selectedImage} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el item "{selectedImage?.title}".
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedImage(null)}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                      Eliminar
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? filteredData.map((item) => (
              <TableRow key={item.id} className="opacity-0 animate-fade-in-up">
                <TableCell>
                  <Image unoptimized src={item.imageUrl} alt={item.title} width={80} height={80} className="object-cover rounded-md border p-1 aspect-video" />
                </TableCell>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell className="text-right">
                  <div className='inline-flex'>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(item)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No se encontraron imágenes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

       {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
             <AdminImageCard
                key={item.id}
                item={item}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron imágenes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
