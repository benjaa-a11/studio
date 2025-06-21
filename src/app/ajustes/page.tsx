"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, Sun, Monitor, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function SettingsPageSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-32 rounded-md" />
            <div className="space-y-2 mt-2">
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48 rounded-md" />
            <div className="space-y-2 mt-2">
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const themeOptions = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  const handleClearFavorites = () => {
    try {
      localStorage.removeItem('plan-b-favorites');
      toast({
        title: "Datos eliminados",
        description: "Tus canales favoritos han sido borrados exitosamente.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Failed to clear favorites from localStorage", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron borrar los datos. Por favor, inténtalo de nuevo.",
      });
    }
  };

  if (!isClient) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Apariencia</CardTitle>
            <CardDescription>
              Personaliza el aspecto de la aplicación. Elige entre temas claro, oscuro o el de tu sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    "h-24 flex-col gap-2 justify-center text-lg font-semibold",
                    theme === option.value && "border-primary border-2 ring-2 ring-primary/30"
                  )}
                  onClick={() => setTheme(option.value as "light" | "dark" | "system")}
                >
                  <option.icon className="h-6 w-6 mb-1" />
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Datos de la aplicación</CardTitle>
            <CardDescription>
              Administra los datos guardados en este dispositivo para mejorar el rendimiento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <h4 className="font-semibold text-destructive">Borrar datos de navegación</h4>
                <p className="text-sm text-muted-foreground">
                  Esto eliminará los datos guardados, como tus canales favoritos.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Borrar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción es irreversible. Todos tus canales favoritos serán eliminados de este dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleClearFavorites}
                    >
                      Sí, borrar todo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
