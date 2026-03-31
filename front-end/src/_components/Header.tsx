export default function Header() {
    return (
        <header className="flex flex-row items-center justify-between w-full border-b-2 border-[var(--border)]">
            <div className="w-[33%] flex items-center justify-start p-2"></div>
            <div className="w-[33%] flex items-center justify-center p-2">
                <h1 className="text-md font-bold leading-none">Visão Geral</h1>
            </div>
            <div className="w-[33%] flex items-center justify-end p-2">
                <button className="p-2 rounded-full hover:bg-[var(--foreground)] transition-normal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                    </svg>
                </button>
            </div>
        </header>
    )
}