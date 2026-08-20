import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://playcahoot.vercel.app"),
  title: {
    default: "PlayCahoot! | Play & Host Live Quizzes",
    template: "%s | PlayCahoot!",
  },
  description:
    "Play Cahoot! Enter 4-digit Game PIN at playcahoot.vercel.app to join live real-time multiplayer trivia, classroom quizzes, and team-building competitions.",
  keywords: [
    "playcahoot",
    "play cahoot",
    "cahoot",
    "cahoot live",
    "cahoot quiz",
    "playcahoot vercel app",
    "kahoot clone",
    "quiz game",
    "live trivia",
    "realtime multiplayer",
    "education game",
  ],
  authors: [{ name: "PlayCahoot Team" }],
  creator: "PlayCahoot",
  publisher: "PlayCahoot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "PlayCahoot! | Play & Host Live Quizzes",
    description:
      "Join a live game of Cahoot! Enter Game PIN to play engaging trivia with friends and colleagues.",
    url: "https://playcahoot.vercel.app",
    siteName: "PlayCahoot!",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlayCahoot! | Play & Host Live Quizzes",
    description: "Join live trivia games with Game PIN at playcahoot.vercel.app",
  },
  verification: {
    google: "google9a5f5b378f85bc28",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  alternates: {
    canonical: "https://playcahoot.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-kahoot-dark text-white selection:bg-kahoot-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}
