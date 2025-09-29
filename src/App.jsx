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
    setUser(getUser())
  }, [])

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <HeaderRenderer />
      <Routes>
        {/* Public landing page */}
        <Route path="/top" element={<Top />} />

        {/* Public form routes */}
        <Route path="/forms/:formId" element={<FormResponse />} />
        <Route path="/general/forms/:formId" element={<FormGeneral />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            user ? (
              <AdminPanel
                user={user}
                onLogout={() => { localStorage.clear(); setUser(null) }}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/admin" />
            ) : (
              <Login onLogin={() => setUser(getUser())} />
            )
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to="/top" />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
