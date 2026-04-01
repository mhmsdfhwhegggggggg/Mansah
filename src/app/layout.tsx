import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'SBN | تسوق عالمي بدفع محلي',
  description: 'منصة وساطة إلكترونية تمكنك من التسوق من أمازون وعلي إكسبريس وشي إن بطرق دفع محلية وشحن مباشر إلى بابك',
  keywords: 'تسوق, أمازون, علي إكسبريس, شي إن, وساطة, شراء دولي, يمن, سعودية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic antialiased min-h-screen">
        <Providers>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Cairo, sans-serif',
                direction: 'rtl',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
