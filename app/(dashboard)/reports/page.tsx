import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">Generate and download portfolio reports.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-medium">Reports coming soon</p>
            <p className="text-sm text-muted-foreground">
              PDF and markdown portfolio reports will be available here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
