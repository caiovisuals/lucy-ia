import type { Metadata } from "next"
import { AuthProvider } from "@/_contexts/AuthContext"
import Script from "next/script"
import Sidebar from "@/_components/Sidebar"
import Header from "@/_components/Header"
import "./globals.css"

export const metadata: Metadata = {
    title: "Lucy",
    description: "Sua a gente de IA mais gatinha!",
    metadataBase: new URL("https://lucyoli.com"),
    keywords: [ 
        "lucy", "artificial intelligence", "chat-box", "assistant"
    ],
    openGraph: {
        type: "website",
        locale: "pt_BR",
        images: [{
            url: "https://www.lucyoli.com/ogimage.png",
            width: 2400,
            height: 1260,
            alt: "Preview Lucy",
            type: "image/png"
        }],
        countryName: "Brasil",
    },
    twitter: {
        card: "summary_large_image",
        site: "@caioba2007",
        images: ["https://lucyoli.com/ogimage.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
        },
    },
    alternates: {
        languages: {
            'pt-BR': '/'
        }
    },
    icons: {
        icon: "/icon.png",
        apple: "/apple-icon.png",
    },
    other: {
        "google": "notranslate",
        "application-name": "LUCY-IA",
    }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-br" className="antialiased">
            <head>
                <Script />
            </head>
            <body className="flex flex-row size-full min-h-screen min-w-screen overflow-hidden">
                <AuthProvider>
                    <Sidebar />     
                    <div className="w-full">
                        <Header />
                        {children}
                    </div>
                </AuthProvider>
            </body>
        </html>
    )
}
