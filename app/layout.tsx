import './globals.css'

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
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-slate-950">
        {children}
      </body>
    </html>
  )
}
