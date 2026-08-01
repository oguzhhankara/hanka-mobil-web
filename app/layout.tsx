import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hanka Mobil - Oto Yıkama Randevu",
  description: "Hanka Mobil Oto Yıkama Yönetim ve Randevu Sistemi",
  icons: {
    icon: "/logo.png", // public klasöründeki logon hem sekme simgesi hem logo olacak
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