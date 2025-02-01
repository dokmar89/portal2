'use client'

import './globals.css'
import { useToast } from '@/hooks/use-toast'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider> {/* Obalení AuthProviderem */}
          {children}
          <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}