import { useEffect, useState } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, Textarea, Badge, Select, ToggleSwitch } from 'flowbite-react'
import { useStore } from '../store/useStore'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  available: boolean
  vendorId: string
}

interface Order {
  id: string
  customerId: string
  vendorId: string
  status: string
  createdAt: string
  items: { menuItemId: string; name: string; quantity: number; price: number }[]
}

export default function VendorDashboard() {
  const { user, logout } = useStore()
  const navigate = useNavigate()
  const [vendorId, setVendorId] = useState('')
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true })
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    const storedVendorId = localStorage.getItem('vendorId') || ''
    setVendorId(storedVendorId)
    if (storedVendorId) {
      fetchMenu(storedVendorId)
      fetchOrders(storedVendorId)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMenu = async (vid: string) => {
    const { data } = await api.get(`/vendors/${vid}/menu`)
    setMenuItems(data)
  }
  const fetchOrders = async (vid: string) => {
    const { data } = await api.get(`/orders/${vid}`)
    setOrders(data)
  }

  const handleSave = async () => {
    const payload = { ...form, price: parseFloat(form.price), vendorId }
    if (editItem) {
      await api.put(`/menu-items/${editItem.id}`, payload)
    } else {
      await api.post('/menu-items', payload)
    }
    setShowModal(false)
    setForm({ name: '', description: '', price: '', available: true })
    setEditItem(null)
    fetchMenu(vendorId)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this item?')) {
      await api.delete(`/menu-items/${id}`)
      fetchMenu(vendorId)
    }
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    await api.put(`/orders/${orderId}/status`, { status })
    fetchOrders(vendorId)
  }

  const openEdit = (item: MenuItem) => {
    setEditItem(item)
    setForm({ name: item.name, description: item.description, price: String(item.price), available: item.available })
    setShowModal(true)
  }

  const statusColor = (s: string): 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray' => {
    const map: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray'> = { Pending: 'warning', Accepted: 'info', Preparing: 'purple', Completed: 'success' }
    return map[s] || 'gray'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">HapMenu Vendor</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">{user?.name}</span>
          <Button size="sm" color="gray" onClick={() => { logout(); navigate('/login') }}>Logout</Button>
        </div>
      </nav>

      <div className="p-6">
        {!vendorId && (
          <div className="mb-4 flex gap-2">
            <TextInput placeholder="Enter your Vendor ID" onChange={(e) => {
              const v = e.target.value
              setVendorId(v)
              localStorage.setItem('vendorId', v)
              if (v) { fetchMenu(v); fetchOrders(v) }
            }} />
          </div>
        )}

        <div className="flex gap-4 mb-6">
          {(['menu', 'orders'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'menu' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Menu Items</h2>
              <Button onClick={() => { setEditItem(null); setForm({ name: '', description: '', price: '', available: true }); setShowModal(true) }}>
                Add Item
              </Button>
            </div>
            <Table>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Price</TableHeadCell>
                <TableHeadCell>Available</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody>
                {menuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>₱{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge color={item.available ? 'success' : 'failure'}>{item.available ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="xs" onClick={() => openEdit(item)}>Edit</Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(item.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Orders</h2>
            <Table>
              <TableHead>
                <TableHeadCell>Order ID</TableHeadCell>
                <TableHeadCell>Items</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Update Status</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      {o.items.map((i, idx) => (
                        <div key={idx}>{i.name} x{i.quantity}</div>
                      ))}
                    </TableCell>
                    <TableCell><Badge color={statusColor(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell>
                      <Select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                        {['Pending', 'Accepted', 'Preparing', 'Completed'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>{editItem ? 'Edit Menu Item' : 'New Menu Item'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="iname">Name</Label>
              <TextInput id="iname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="idesc">Description</Label>
              <Textarea id="idesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="iprice">Price</Label>
              <TextInput id="iprice" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <ToggleSwitch checked={form.available} onChange={(v) => setForm({ ...form, available: v })} />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleSave}>Save</Button>
          <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
