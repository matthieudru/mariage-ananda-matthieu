import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ananda & Matthieu — 10 · 10 · 26",
  description: "Tonnara di Scopello · 10 octobre 2026",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <div style={{ position:"fixed", left:0, top:0, bottom:0, width:"11px", background:"#243b71", zIndex:9999, pointerEvents:"none" }} />
        <div style={{ position:"fixed", right:0, top:0, bottom:0, width:"11px", background:"#243b71", zIndex:9999, pointerEvents:"none" }} />
        <div style={{ position:"fixed", top:0, left:0, right:0, height:"11px", background:"#243b71", zIndex:9999, pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:0, left:0, right:0, height:"11px", background:"#243b71", zIndex:9999, pointerEvents:"none" }} />
        {children}
      </body>
    </html>
  );
}
