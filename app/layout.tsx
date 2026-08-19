import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cahoot! | Play & Host Live Quizzes",
  description: "Join a game of Cahoot! Enter game PIN to play engaging trivia with friends and colleagues.",
  keywords: ["Kahoot clone", "quiz game", "trivia", "realtime multiplayer", "education"],
  authors: [{ name: "Cahoot Team" }],
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
