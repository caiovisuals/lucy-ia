import type { Metadata } from "next"
import { Geologica } from "next/font/google";
import "./globals.css"

const geologica = Geologica({
    variable: "--font-geologica",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "Lucy",
    description: "Sua a gente de ia mais gatinha!",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="pt-br" className={`${geologica.variable} antialiased`}>
            <head>

            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
