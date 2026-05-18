import type { Metadata } from "next"
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/lib/i18n"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const vazirmatn = Vazirmatn({ subsets: ["arabic", "latin"], variable: "--font-vazirmatn" })

export const metadata: Metadata = {
  title: "LiveKit Console — Self-hosted realtime infrastructure",
  description:
    "Production-grade admin and operator dashboard for self-hosted LiveKit. Inspect rooms, issue tokens, and monitor your fleet in realtime.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${vazirmatn.variable} bg-background dark`}>
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <I18nProvider>
            {children}
            <Toaster richColors position="top-right" />
          </I18nProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
