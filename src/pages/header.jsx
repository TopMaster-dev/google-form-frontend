import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between h-[80px]">
                <Link to="/top" className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-[#215261]">ムービー提出システム</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm text-gray-600">
                    <Link to="/top" className="hover:text-[#215261]">トップ</Link>
                    <Link to="/login" className="hover:text-[#215261]">ログイン</Link>
                </nav>
            </div>
        </header>
    )
}