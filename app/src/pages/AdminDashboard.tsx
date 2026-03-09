import { useEffect, useState } from 'react'
import { Button, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput, Textarea, Badge } from 'flowbite-react'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

interface Vendor {
  id: string
  name: string
  subdomain: string
  description: string
  contactInfo: string
}

interface PopularItem {
  itemId: string
  type: 'menu' | 'service'
  name: string
  count: number
}

export default function AdminDashboard() {
  const { user, logout, orders, setOrders } = useStore()
  const navigate = useNavigate()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)
  const [form, setForm] = useState({ name: '', description: '', contactInfo: '' })
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders' | 'analytics'>('vendors')
  const [revenue, setRevenue] = useState<{ total: number; orderCount: number } | null>(null)
  const [popularItems, setPopularItems] = useState<PopularItem[]>([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchVendors()
    fetchOrders()
    fetchRevenue()
    fetchPopularItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchVendors = async () => {
    const { data } = await api.get('/vendors')
    setVendors(data)
  }
  const fetchOrders = async () => {
    const { data } = await api.get('/orders')
    setOrders(data)
  }
  const fetchRevenue = async () => {
    const { data } = await api.get('/analytics/revenue')
    setRevenue(data)
  }

  const fetchPopularItems = async () => {
    const { data } = await api.get('/analytics/popular-items')
    setPopularItems(data)
  }

  const handleSave = async () => {
    if (editVendor) {
      await api.put(`/vendors/${editVendor.id}`, form)
    } else {
      await api.post('/vendors', form)
    }
    setShowModal(false)
    setForm({ name: '', description: '', contactInfo: '' })
    setEditVendor(null)
    fetchVendors()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this vendor?')) {
      await api.delete(`/vendors/${id}`)
      fetchVendors()
    }
  }

  const openEdit = (vendor: Vendor) => {
    setEditVendor(vendor)
    setForm({ name: vendor.name, description: vendor.description, contactInfo: vendor.contactInfo })
    setShowModal(true)
  }

  const statusColor = (s: string): 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray' => {
    const map: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray'> = { Pending: 'warning', Accepted: 'info', Preparing: 'purple', Completed: 'success' }
    return map[s] || 'gray'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">HapMenu Admin</h1>
        <div className="flex gap-4 items-center">
          <span className="text-gray-600">{user?.name}</span>
          <Button size="sm" color="gray" onClick={() => { logout(); navigate('/login') }}>Logout</Button>
        </div>
      </nav>

      <div className="p-6">
        <div className="flex gap-4 mb-6">
          {(['vendors', 'orders', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize font-medium ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'vendors' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Vendors</h2>
              <Button onClick={() => { setEditVendor(null); setForm({ name: '', description: '', contactInfo: '' }); setShowModal(true) }}>
                Add Vendor
              </Button>
            </div>
            <Table>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Subdomain</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Contact</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell><code>{v.subdomain}.hapmenu.com</code></TableCell>
                    <TableCell>{v.description}</TableCell>
                    <TableCell>{v.contactInfo}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="xs" onClick={() => openEdit(v)}>Edit</Button>
                      <Button size="xs" color="failure" onClick={() => handleDelete(v.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">All Orders</h2>
            <Table>
              <TableHead>
                <TableHeadCell>Order ID</TableHeadCell>
                <TableHeadCell>Vendor</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Items</TableHeadCell>
                <TableHeadCell>Date</TableHeadCell>
              </TableHead>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                    <TableCell>{o.vendorId.slice(0, 8)}...</TableCell>
                    <TableCell><Badge color={statusColor(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell>{o.items.length} items</TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {revenue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow">
                  <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">₱{revenue.total.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow">
                  <h3 className="text-gray-500 text-sm">Total Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">{revenue.orderCount}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="text-gray-700 font-semibold mb-4">Popular Items</h3>
              <Table>
                <TableHead>
                  <TableHeadCell>Name</TableHeadCell>
                  <TableHeadCell>Type</TableHeadCell>
                  <TableHeadCell>Count</TableHeadCell>
                </TableHead>
                <TableBody>
                  {popularItems.map((item) => (
                    <TableRow key={`${item.type}-${item.itemId}`}>
                      <TableCell>{item.name || item.itemId}</TableCell>
                      <TableCell className="uppercase">{item.type}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                  {popularItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500">
                        No analytics data yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader>{editVendor ? 'Edit Vendor' : 'New Vendor'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vname">Name</Label>
              <TextInput id="vname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="vdesc">Description</Label>
              <Textarea id="vdesc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="vcontact">Contact Info</Label>
              <TextInput id="vcontact" value={form.contactInfo} onChange={(e) => setForm({ ...form, contactInfo: e.target.value })} />
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
