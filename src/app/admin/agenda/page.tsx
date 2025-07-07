import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminPlaceholderPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>En Construcción</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Esta sección del panel de administración está en desarrollo.</p>
      </CardContent>
    </Card>
  );
}
