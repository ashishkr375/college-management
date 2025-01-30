import { Card } from '@/components/ui/card';

export default function StatsCard({ title, value, icon, description }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </Card>
  );
} 