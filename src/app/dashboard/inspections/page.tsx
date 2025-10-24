import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function InspectionsPage() {
  const supabase = await createClient()
  const { data: inspections } = await supabase
    .from('inspections')
    .select('*')
    .order('date', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inspections</h2>
        <p className="text-muted-foreground">Manage and track all inspections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Inspections</CardTitle>
          <CardDescription>Latest {inspections?.length || 0} inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Score</th>
                  <th className="pb-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {inspections?.map((inspection) => (
                  <tr key={inspection.id} className="border-b">
                    <td className="py-3 text-sm">{formatDate(inspection.date)}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          inspection.status === 'completed'
                            ? 'success'
                            : inspection.status === 'in_progress'
                            ? 'warning'
                            : 'outline'
                        }
                      >
                        {inspection.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">{inspection.score || 'N/A'}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {inspection.notes?.slice(0, 50)}
                      {inspection.notes && inspection.notes.length > 50 ? '...' : ''}
                    </td>
                  </tr>
                ))}
                {(!inspections || inspections.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No inspections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
