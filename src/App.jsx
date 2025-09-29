import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import AdminPanel from './pages/AdminPanel'
import FormResponse from './pages/FormResponse'
import FormGeneral from './pages/FormGeneral'
import Top from './pages/Top'
import Header from './pages/header'
import { getUser } from './utils/auth'

function HeaderRenderer() {
  const location = useLocation()
  if (location.pathname.startsWith('/admin')) return null
  return <Header />
}

export default function App() {
  const [user, setUser] = useState(getUser())

  useEffect(() => {
    // sync user state when token changes (storage events from other tabs)
    const onStorage = (e) => {
      if (e.key === 'gfc_token') {
        setUser(getUser())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <HeaderRenderer />
      {(() => {
        const authed = !!localStorage.getItem('gfc_token')
        if (!authed) {
          return (
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setUser(getUser())} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )
        }
        return (
          <Routes>
            {/* Public landing page (requires auth) */}
            <Route path="/top" element={<Top />} />

            {/* Form routes */}
            <Route path="/forms/:formId" element={<FormResponse />} />
            <Route path="/general/forms/:formId" element={<FormGeneral />} />

            {/* Admin routes */}
            <Route
              path="/admin/*"
              element={(() => {
                const u = getUser()
                console.log(u);
                
                return u && u.role === 'admin' ? (
                  <AdminPanel
                    user={u}
                    onLogout={() => { localStorage.clear(); setUser(null) }}
                  />
                ) : (
                  <Navigate to="/top" replace />
                )
              })()}
            />

            {/* Login should redirect away when authed */}
            <Route
              path="/login"
              element={(() => {
                const u = getUser()
                return u && u.role === 'admin'
                  ? <Navigate to="/admin" replace />
                  : <Navigate to="/top" replace />
              })()}
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/top" replace />} />
            <Route path="*" element={<Navigate to="/top" replace />} />
          </Routes>
        )
      })()}
    </BrowserRouter>
  )
}

// Removed RequireAuth; we render separate route sets based on auth state
