import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treasure MAP",
  description: "旅行・登山などの思い出を記録するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-amber-100 text-slate-800 antialiased">
        <header className="border-b border-white/60 bg-white/70 shadow-sm backdrop-blur">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link
              href="/"
              className="bg-gradient-to-r from-sky-500 to-emerald-500 bg-clip-text text-lg font-extrabold tracking-tight text-transparent"
            >
              🗺️ Treasure MAP
            </Link>
            <div className="flex gap-2 text-sm font-semibold">
              <Link
                href="/travels"
                className="rounded-full px-3 py-1.5 text-sky-600 transition hover:bg-sky-100"
              >
                ✈️ 旅行記録
              </Link>
              <Link
                href="/climbs"
                className="rounded-full px-3 py-1.5 text-emerald-600 transition hover:bg-emerald-100"
              >
                ⛰️ 登山記録
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
