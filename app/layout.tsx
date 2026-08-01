import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hanka Mobil - Oto Yıkama",
  description: "Hanka Mobil Oto Yıkama Randevu ve Yönetim Sistemi",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}