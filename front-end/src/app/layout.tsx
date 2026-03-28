import type { Metadata } from "next"
import { Geologica } from "next/font/google"
import Sidebar from "@/_components/Sidebar"
import Header from "@/_components/Header"
import "./globals.css"

const geologica = Geologica({
    variable: "--font-geologica",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Lucy",
    description: "Sua a gente de IA mais gatinha!",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-br" className={`${geologica.variable} antialiased`}>
            <head>
            </head>
            <body className="flex flex-row">
                <Sidebar />
                <div>
                    <Header />
                    {children}
                </div>
            </body>
        </html>
    )
}
