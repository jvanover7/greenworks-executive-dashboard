import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .order('uploaded_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <p className="text-muted-foreground">Manage and search company documents with AI</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>{documents?.length || 0} documents available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents?.map((doc) => (
              <div key={doc.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <FileText className="w-5 h-5 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <h4 className="font-medium">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">Source: {doc.source}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(doc.uploaded_at)}</p>
                </div>
              </div>
            ))}
            {(!documents || documents.length === 0) && (
              <div className="py-8 text-center text-muted-foreground">
                No documents found. Upload documents or connect to Google Drive / Notion to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
