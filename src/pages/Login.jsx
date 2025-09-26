import React, { useState } from 'react'
import { login, register } from '../api'
import { setAuth } from '../utils/auth'

export default function Login({ onLogin }) {
    const [isRegister, setIsRegister] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [err, setErr] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (isRegister) {
                const res = await register({ name, email, password })
                setAuth(res.token, res.user)
            } else {
                const res = await login({ email, password })
                setAuth(res.token, res.user)
            }
            onLogin()
        } catch (e) {
            console.error(e)
            const errorMessage = e?.response?.data?.message || e?.response?.data?.error || 'Login failed'
            setErr(errorMessage)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9F6EF]">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow p-6">
                <h1 className="text-2xl font-semibold mb-4 text-[#191919]">{isRegister ? '新規登録' : 'ログイン'}</h1>
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="名前" className="w-full p-2 border rounded mb-3" />
                    )}
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="メールアドレス"
                        className="w-full p-2 border rounded mb-3"
                    />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" className="w-full p-2 border rounded mb-3" />
                    <div className="flex gap-2">
                        <button className="bg-[#215261] text-white px-4 py-2 rounded">{isRegister ? '登録' : 'ログイン'}</button>
                        <button type="button" onClick={() => setIsRegister(!isRegister)} className="px-4 py-2 border rounded text-[#191919]">{isRegister ? 'アカウントをお持ちですか？' : '新規登録'}</button>
                    </div>
                    {err && <div className="text-red-500 mt-3">{err}</div>}
                </form>
            </div>
        </div>
    )
}
