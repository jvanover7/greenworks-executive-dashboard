import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Greenworks Executive Dashboard',
  description: 'Real-time executive dashboard with live data from Aircall, WhatConverts, ISN',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
