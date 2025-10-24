import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function SitesPage() {
  const supabase = await createClient()
  const { data: sites } = await supabase.from('sites').select('*').order('created_at', { ascending: false }).limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sites</h2>
        <p className="text-muted-foreground">Manage customer sites and locations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sites</CardTitle>
          <CardDescription>{sites?.length || 0} sites total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {sites?.map((site) => (
                  <tr key={site.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{site.name}</td>
                    <td className="py-3 text-sm">{site.location}</td>
                    <td className="py-3 text-sm">{site.customer}</td>
                    <td className="py-3 text-sm text-muted-foreground">{formatDate(site.created_at)}</td>
                  </tr>
                ))}
                {(!sites || sites.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No sites found
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
