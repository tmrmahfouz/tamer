import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { HomeSectionsProvider } from '@/contexts/HomeSectionsContext'
import ContentProtection from '@/components/ContentProtection'

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'مستر تامر محفوظ - البرمجة والذكاء الاصطناعي',
  description: 'منصة تعليمية متخصصة في تعليم البرمجة والذكاء الاصطناعي مع مستر تامر محفوظ',
  keywords: 'برمجة, ذكاء اصطناعي, تعليم برمجة, Python, AI, Machine Learning, تامر محفوظ',
  authors: [{ name: 'تامر محفوظ' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script src="/protection.js" async={false} defer={false} />
      </head>
      <body className={`${cairo.variable} font-arabic antialiased`}>
        <ContentProtection />
        <SettingsProvider>
          <HomeSectionsProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </HomeSectionsProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
