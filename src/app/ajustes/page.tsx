"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
      </div>
      
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
      </div>
    </div>
  );
}
