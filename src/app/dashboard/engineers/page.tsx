import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function EngineersPage() {
  const supabase = await createClient()
  const { data: engineers } = await supabase
    .from('engineers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Engineers</h2>
        <p className="text-muted-foreground">Manage your engineering team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Engineers</CardTitle>
          <CardDescription>{engineers?.length || 0} engineers total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Email</th>
                  <th className="pb-2 font-medium">Role</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {engineers?.map((engineer) => (
                  <tr key={engineer.id} className="border-b">
                    <td className="py-3 text-sm font-medium">{engineer.full_name}</td>
                    <td className="py-3 text-sm">{engineer.email}</td>
                    <td className="py-3 text-sm">{engineer.role}</td>
                    <td className="py-3 text-sm text-muted-foreground">{formatDate(engineer.created_at)}</td>
                  </tr>
                ))}
                {(!engineers || engineers.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No engineers found
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
