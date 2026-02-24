import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'Auth Demo',
  description: 'Authentication demo with React + Next.js'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="site-container">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
