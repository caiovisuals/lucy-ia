"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuContainerRef.current && !menuContainerRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <header className="relative flex flex-row items-center justify-between w-full border-b-2 border-[var(--border)]">
            <div className="w-[33%] flex items-center justify-start p-2"></div>
            <div className="w-[33%] flex items-center justify-center p-2">
                <h1 className="text-md font-bold leading-none">Visão Geral</h1>
            </div>
            <div aria-haspopup="true" aria-expanded={isMenuOpen} aria-label="Abrir menu de opções" className="w-[33%] flex items-center justify-end p-2">
                <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-full hover:bg-[var(--foreground)]/50 transition-normal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                    </svg>
                </button>
            </div>
            <div ref={menuContainerRef} role="menu" aria-label="Menu de opções" className={`flex flex-col items-start justify-center gap-1.5 top-16 right-2 absolute min-w-100 p-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl transition-normal ${isMenuOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none scale-95"}`}>
                <h2 className="text-lg">Faça login e <span className="font-semibold">venha ser feliz!</span></h2>
                <div className="flex flex-row gap-2">
                    <Link href="/login" className="flex items-center justify-center px-6 py-1 bg-[var(--background)] hover:bg-[var(--foreground)]/50 border-2 border-[var(--border)] rounded-2xl transition-normal">Entrar</Link>
                    <Link href="/register" className="flex items-center justify-center px-6 py-1 bg-[var(--orange)] hover:bg-[var(--orange-hover)] text-[var(--white-text)] rounded-2xl transition-normal">Criar Conta</Link>
                </div>
            </div>
        </header>
    )
}