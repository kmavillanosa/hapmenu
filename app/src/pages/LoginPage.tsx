import { useState } from 'react'
import { Button, Card, Label, TextInput } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import api from '../api/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const { setUser, setToken } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const body = isRegister ? { name, email, password } : { email, password }
      const { data } = await api.post(endpoint, body)
      setToken(data.access_token)
      setUser(data.user)
      if (data.user.role === 'ADMIN') navigate('/admin')
      else if (data.user.role === 'VENDOR') navigate('/vendor')
      else navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setError(axiosErr?.response?.data?.message || 'Authentication failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {isRegister ? 'Create Account' : 'Sign In'} — HapMenu
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <TextInput id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <TextInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full">
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-600 underline">
            {isRegister ? 'Sign in' : 'Register'}
          </button>
        </p>
      </Card>
    </div>
  )
}
