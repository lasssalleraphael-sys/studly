import './globals.css'
import NavBar from '@/components/NavBar'

export const metadata = {
  title: 'Studly - AI Study Assistant',
  description: 'Turn lectures into perfect study notes with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  )
}
