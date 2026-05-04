import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Cestooy – Tvoje cesty. Tvoje příběhy.",
    template: "%s | Cestooy",
  },
  description:
    "Moderní platforma pro zaznamenávání tvých cest, zážitků a příběhů. Uchovej si své vzpomínky navždy.",
  keywords: ["cestování", "deník", "trips", "travel", "příběhy", "vzpomínky"],
  authors: [{ name: "Cestooy" }],
  openGraph: {
    title: "Cestooy",
    description: "Tvoje cesty. Tvoje příběhy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%230f172a%22/><circle cx=%2250%22 cy=%2250%22 r=%2215%22 fill=%22white%22/></svg>" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cestooy" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
