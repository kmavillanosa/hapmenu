import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './pages/AdminDashboard'
import VendorDashboard from './pages/VendorDashboard'
import CustomerPage from './pages/CustomerPage'
import LoginPage from './pages/LoginPage'

function App() {
  const hostname = window.location.hostname
  const parts = hostname.split('.')
  const subdomain = parts[0]
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  const isSubdomain =
    !isIpAddress &&
    hostname !== 'localhost' &&
    parts.length >= 2 &&
    subdomain !== 'www' &&
    subdomain !== 'hapmenu'

  if (isSubdomain) {
    return (
      <Routes>
        <Route path="*" element={<CustomerPage subdomain={subdomain} />} />
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
