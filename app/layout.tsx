import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FinanceProvider } from "@/lib/finance-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "Sistema completo de controle financeiro pessoal",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <FinanceProvider>{children}</FinanceProvider>
      </body>
    </html>
  )
}
