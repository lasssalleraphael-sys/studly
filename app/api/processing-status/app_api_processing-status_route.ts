import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore - called from Server Component
            }
          },
        },
      }
    )

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 })
    }

    // Get job status
    const { data: job, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', session.user.id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // If completed, get the study notes
    let result = null
    if (job.status === 'completed' && job.result_id) {
      const { data: notes } = await supabase
        .from('study_notes')
        .select('*')
        .eq('id', job.result_id)
        .single()

      result = notes
    }

    return NextResponse.json({
      status: job.status,
      result,
      error: job.error,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
