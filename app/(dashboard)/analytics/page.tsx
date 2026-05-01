import { BarChart2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Portfolio performance and insights.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <BarChart2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">Analytics coming soon</p>
            <p className="text-sm text-muted-foreground">
              Portfolio performance charts and insights will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
