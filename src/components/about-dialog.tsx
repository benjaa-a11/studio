"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

type AboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Acerca de Plan B</DialogTitle>
          <DialogDescription className="font-body">
            Tu alternativa moderna y optimizada para ver televisión en vivo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 font-body">
          <p>
            Plan B es una aplicación web diseñada para ofrecer una experiencia fluida y visualmente atractiva para el streaming de canales de televisión.
          </p>
          <p>
            Construida con tecnologías modernas, priorizando el rendimiento y la escalabilidad.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
