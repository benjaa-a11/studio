
'use client';

import { useState, useEffect, useActionState, useMemo } from 'react';
import type { News } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormStatus } from 'react-dom';
import { addNews, updateNews, deleteNews } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckCircle, AlertCircle, MoreVertical, Search, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarPicker } from '../ui/calendar';
import { format } from 'date-fns';

const initialState = { message: '', errors: {}, success: false };

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Guardar Cambios' : 'Añadir Noticia'}
        </Button>
    )
}

function NewsForm({ newsItem, onFormSubmit }: { newsItem?: News | null; onFormSubmit: () => void }) {
  const formAction = newsItem?.id ? updateNews.bind(null, newsItem.id) : addNews;
  const [state, dispatch] = useActionState(formAction, initialState);
  const [date, setDate] = useState<Date | undefined>(newsItem?.date ? new Date(newsItem.date) : new Date());
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

  const handleFormAction = (formData: FormData) => {
    if (date) {
        formData.append('date', date.toISOString());
    }
    dispatch(formData);
  }

  return (
    <form action={handleFormAction}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" defaultValue={newsItem?.title} />
          {state.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="url">URL del Artículo</Label>
          <Input id="url" name="url" defaultValue={newsItem?.url} />
           {state.errors?.url && <p className="text-sm font-medium text-destructive">{state.errors.url.join(', ')}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="imageUrl">URL de la Imagen de Portada</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={newsItem?.imageUrl} />
           {state.errors?.imageUrl && <p className="text-sm font-medium text-destructive">{state.errors.imageUrl.join(', ')}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
                <Label htmlFor="source">Fuente</Label>
                <Input id="source" name="source" defaultValue={newsItem?.source} placeholder="Ej: SumaPlay"/>
                {state.errors?.source && <p className="text-sm font-medium text-destructive">{state.errors.source.join(', ')}</p>}
            </div>
            <div className="grid gap-2">
                <Label>Fecha</Label>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Elige una fecha</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <CalendarPicker
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                {state.errors?.date && <p className="text-sm font-medium text-destructive">{state.errors.date.join(', ')}</p>}
            </div>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <SubmitButton isEditing={!!newsItem} />
      </DialogFooter>
    </form>
  );
}

function AdminNewsCard({ article, onEdit, onDelete }: { article: News; onEdit: (article: News) => void; onDelete: (article: News) => void; }) {
    return (
        <Card className="opacity-0 animate-fade-in-up">
            <CardContent className="p-4 flex items-center gap-4">
                <Image unoptimized src={article.imageUrl} alt={article.title} width={64} height={64} className="object-cover rounded-md border p-1 aspect-square" />
                <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="font-semibold truncate">{article.title}</p>
                    <p className="text-sm text-muted-foreground">{article.source}</p>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(article)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(article)} className="text-destructive">
                             <Trash2 className="mr-2 h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardContent>
        </Card>
    );
}

export default function NewsDataTable({ data }: { data: News[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.source.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleEditClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setSelectedNews(null);
    setIsFormOpen(true);
  };
  
  const handleDeleteClick = (newsItem: News) => {
    setSelectedNews(newsItem);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNews) return;
    const result = await deleteNews(selectedNews.id);
    if(result.success) {
      toast({
        title: <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span>Noticia Eliminada</span></div>,
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
    setSelectedNews(null);
  };

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setSelectedNews(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2 md:gap-4">
        <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o fuente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <Button onClick={handleAddClick} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Noticia
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90dvh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedNews ? 'Editar Noticia' : 'Añadir Nueva Noticia'}</DialogTitle>
            <DialogDescription>
              {selectedNews ? 'Modifica los detalles de la noticia existente.' : 'Completa el formulario para añadir una nueva noticia.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <NewsForm key={selectedNews?.id || 'new'} newsItem={selectedNews} onFormSubmit={handleFormSubmit} />
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar esta noticia?</AlertDialogTitle>
                  <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminará el artículo "{selectedNews?.title}".
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedNews(null)}>Cancelar</AlertDialogCancel>
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
              <TableHead>Fuente</TableHead>
              <TableHead>Fecha</TableHead>
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
                <TableCell>{item.source}</TableCell>
                <TableCell>{format(new Date(item.date), "dd/MM/yyyy")}</TableCell>
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
                <TableCell colSpan={5} className="h-24 text-center">
                  No se encontraron noticias.
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
             <AdminNewsCard
                key={item.id}
                article={item}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <p>No se encontraron noticias.</p>
          </div>
        )}
      </div>
    </div>
  );
}
