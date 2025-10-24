import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function WorkOrdersPage() {
  const supabase = await createClient()
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('*')
    .order('opened_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Work Orders</h2>
        <p className="text-muted-foreground">Track maintenance and service orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Work Orders</CardTitle>
          <CardDescription>{workOrders?.length || 0} work orders total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Opened</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Cost</th>
                  <th className="pb-2 font-medium">Closed</th>
                </tr>
              </thead>
              <tbody>
                {workOrders?.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="py-3 text-sm">{formatDate(order.opened_at)}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          order.status === 'completed'
                            ? 'success'
                            : order.status === 'in_progress'
                            ? 'warning'
                            : 'outline'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm">{order.cost ? formatCurrency(order.cost) : 'N/A'}</td>
                    <td className="py-3 text-sm text-muted-foreground">
                      {order.closed_at ? formatDate(order.closed_at) : 'Open'}
                    </td>
                  </tr>
                ))}
                {(!workOrders || workOrders.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No work orders found
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
