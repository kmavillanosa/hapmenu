import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import VendorDashboard from './pages/VendorDashboard'
import CustomerPage from './pages/CustomerPage'
import LoginPage from './pages/LoginPage'

function App() {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const isSubdomain = parts.length >= 3 && parts[0] !== 'www'
  
  if (isSubdomain) {
    return (
      <Routes>
        <Route path="*" element={<CustomerPage subdomain={parts[0]} />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/vendor" element={<VendorDashboard />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
