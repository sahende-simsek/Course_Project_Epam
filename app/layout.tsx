import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

export const metadata = {
  title: 'InnovatEPAM Portal',
  description: 'Internal innovation & intrapreneurship portal at EPAM'
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
