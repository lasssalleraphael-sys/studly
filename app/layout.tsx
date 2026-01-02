import './globals.css'
import NavBar from '@/components/NavBar'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export const metadata = {
  title: 'Studly - AI Study Assistant',
  description: 'Turn lectures into perfect study notes with AI',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar session={session} />
        {children}
      </body>
    </html>
  )
}
