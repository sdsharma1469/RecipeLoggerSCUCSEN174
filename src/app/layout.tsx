import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles/globals.css'; // Ensure global styles are imported

// Load custom fonts
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Metadata for the app
export const metadata: Metadata = {
  title: 'GreenKitchen',
  description: 'Discover healthy and sustainable recipes curated just for you.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} // Apply the font variables
      >
        {children}
      </body>
    </html>
  );
}
