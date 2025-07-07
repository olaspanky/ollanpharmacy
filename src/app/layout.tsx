// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { AuthProvider } from "@/context/AuthContext";
// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   metadataBase: new URL("https://www.ollanpharmacy.ng"),
//   title: {
//     default: "Ollan Pharmacy | Buy Genuine Drugs & Groceries Online in Ibadan",
//     template: "%s | Ollan Pharmacy - Trusted Healthcare Since 1985"
//   },
//   description: "Shop trusted medications, wellness products, and groceries at Ollan Pharmacy - Ibadan's most reliable online pharmacy and supermarket. Fast delivery, affordable prices, expert pharmacist support since 1985. Licensed by PCN.",
//   keywords: [
//    "Pharmacy in ibadan", "Buy drugs online in ibadan", "Online pharmacy Nigeria", " Ibadan pharmacy delivery"
//   ],
//   authors: [{ name: "Ollan Pharmacy Team" }],
//   creator: "Ollan Pharmacy Nigeria Limited",
//   publisher: "Ollan Pharmacy Nigeria Limited",
//   category: "Healthcare & Pharmacy",
//   classification: "Healthcare Services",
  
//   verification: {
//     google: "r5-hh0PGASGqnNbQHVfxvJvac_4zvgH0TXOl7IlB2i0",
//   },
//   openGraph: {
//   title: "Ollan Pharmacy | Buy Genuine Drugs & Groceries Online in Ibadan, Nigeria",
//   description: "Shop trusted medications, wellness products, and groceries at Ollan Pharmacy - Ibadan's reliable online pharmacy and supermarket, fast delivery, affordable prices and expert support since 1985",
//     url: "https://www.ollanpharmacy.ng",
//     siteName: "Ollan Pharmacy",
//     locale: "en_NG",
//     type: "website",
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <head>
//         <meta name="google-site-verification" content="r5-hh0PGASGqnNbQHVfxvJvac_4zvgH0TXOl7IlB2i0" />
//       </head>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         <AuthProvider>
//         {children}

//         </AuthProvider>
//       </body>
//     </html>
//   );
// }

// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Script from "next/script";
import ClientLayout from "./ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ollanpharmacy.ng"),
  title: {
    default: "Ollan Pharmacy | Buy Genuine Drugs & Groceries Online in Ibadan",
    template: "%s | Ollan Pharmacy - Trusted Healthcare Since 1985"
  },
  description: "Shop trusted medications, wellness products, and groceries at Ollan Pharmacy - Ibadan's most reliable online pharmacy and supermarket. Fast delivery, affordable prices, expert pharmacist support since 1985. Licensed by PCN.",
  keywords: [
    "Pharmacy in ibadan", 
    "Buy drugs online in ibadan", 
    "Online pharmacy Nigeria", 
    "Ibadan pharmacy delivery"
  ],
  authors: [{ name: "Ollan Pharmacy Team" }],
  creator: "Ollan Pharmacy Nigeria Limited",
  publisher: "Ollan Pharmacy Nigeria Limited",
  category: "Healthcare & Pharmacy",
  classification: "Healthcare Services",
  
  verification: {
    google: "r5-hh0PGASGqnNbQHVfxvJvac_4zvgH0TXOl7IlB2i0",
  },
  openGraph: {
    title: "Ollan Pharmacy | Buy Genuine Drugs & Groceries Online in Ibadan, Nigeria",
    description: "Shop trusted medications, wellness products, and groceries at Ollan Pharmacy - Ibadan's reliable online pharmacy and supermarket, fast delivery, affordable prices and expert support since 1985",
    url: "https://www.ollanpharmacy.ng",
    siteName: "Ollan Pharmacy",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ollan Pharmacy - Trusted Healthcare Since 1985",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ollan Pharmacy | Buy Genuine Drugs & Groceries Online in Ibadan",
    description: "Your trusted online pharmacy and supermarket in Ibadan, Nigeria",
    images: ["/twitter-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="r5-hh0PGASGqnNbQHVfxvJvac_4zvgH0TXOl7IlB2i0" />
        <Script 
          id="remove-extension-attributes"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.removeAttribute('data-bybit-channel-name');
              document.documentElement.removeAttribute('data-bybit-is-default-wallet');
            `
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}