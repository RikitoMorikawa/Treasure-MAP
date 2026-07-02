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
      <body className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        <header className="border-b border-stone-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              🗺️ Treasure MAP
            </Link>
            <div className="flex gap-4 text-sm font-medium text-stone-600">
              <Link href="/travels" className="hover:text-stone-900">
                ✈️ 旅行記録
              </Link>
              <Link href="/climbs" className="hover:text-stone-900">
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
