
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Plus, Key, Link2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

export type UrlItem = {
  id: string;
  value: string;
  k1?: string;
  k2?: string;
  type: 'simple' | 'drm';
};

// --- Single Sortable Item ---
function SortableItem({
  item,
  onRemove,
  onUpdate,
}: {
  item: UrlItem;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof UrlItem, value: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-md bg-muted/50 border transition-shadow',
        isDragging && 'shadow-lg bg-background border-primary'
      )}
    >
      <div className="flex items-center gap-2">
        <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab p-1.5 text-muted-foreground hover:text-foreground touch-none self-start"
            aria-label="Reordenar opción"
        >
            <GripVertical size={18} />
        </button>
        <RadioGroup 
            defaultValue={item.type} 
            onValueChange={(value) => onUpdate(item.id, 'type', value)}
            className="flex gap-4"
        >
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="simple" id={`simple-${item.id}`} />
                <Label htmlFor={`simple-${item.id}`}>Simple</Label>
            </div>
            <div className="flex items-center space-x-2">
                <RadioGroupItem value="drm" id={`drm-${item.id}`} />
                <Label htmlFor={`drm-${item.id}`}>DRM</Label>
            </div>
        </RadioGroup>

         <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive shrink-0 ml-auto"
            onClick={() => onRemove(item.id)}
            aria-label="Eliminar opción"
        >
            <Trash2 size={16} />
        </Button>
      </div>

       <div className="pl-8 space-y-2">
          <div className="relative">
             <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
                type="url"
                value={item.value}
                onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
                placeholder="https://ejemplo.com/stream.m3u8"
                className="flex-grow bg-background pl-9"
            />
          </div>
          {item.type === 'drm' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={item.k1 || ''}
                        onChange={(e) => onUpdate(item.id, 'k1', e.target.value)}
                        placeholder="Key ID (k1)"
                        className="flex-grow bg-background pl-9"
                    />
                </div>
                 <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        value={item.k2 || ''}
                        onChange={(e) => onUpdate(item.id, 'k2', e.target.value)}
                        placeholder="Key (k2)"
                        className="flex-grow bg-background pl-9"
                    />
                </div>
            </div>
          )}
       </div>
    </div>
  );
}

// --- Main List Component ---
export function SortableUrlList({
  items,
  setItems,
  placeholder = 'https://ejemplo.com/stream.m3u8',
}: {
  items: UrlItem[];
  setItems: (items: UrlItem[]) => void;
  placeholder?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleAddItem = () => {
    const newItem: UrlItem = { id: `${Date.now()}`, value: '', type: 'simple' };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    } else {
      // If it's the last one, just clear it instead of removing
      setItems([{ id: items[0].id, value: '', type: 'simple' }]);
    }
  };

  const handleUpdateItem = (id: string, field: keyof UrlItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                item={item}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
        <Plus className="mr-2" size={16} />
        Añadir Opción
      </Button>
    </div>
  );
}
