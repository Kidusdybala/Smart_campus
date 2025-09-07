import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

export function Recommendations() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Recommended for You</CardTitle>
        <CardDescription>Based on your previous orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
            <span className="text-2xl">🍛</span>
            <div>
              <div className="font-medium text-sm">Tibs</div>
              <div className="text-xs text-muted-foreground">200 ETB</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
            <span className="text-2xl">🥘</span>
            <div>
              <div className="font-medium text-sm">Misir Wat</div>
              <div className="text-xs text-muted-foreground">120 ETB</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}