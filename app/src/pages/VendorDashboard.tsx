import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  TextInput,
  Textarea,
  ToggleSwitch,
} from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useStore } from '../store/useStore'
import type { MenuItem, ServiceItem } from '../store/useStore'

interface MenuFormState {
  name: string
  description: string
  price: string
  available: boolean
}

interface ServiceFormState {
  name: string
  description: string
  price: string
  duration: string
  available: boolean
}

export default function VendorDashboard() {
  const {
    user,
    logout,
    vendorMenu,
    setVendorMenu,
    vendorServices,
    setVendorServices,
    orders,
    setOrders,
  } = useStore()

  const navigate = useNavigate()
  const [vendorId, setVendorId] = useState('')
  const [error, setError] = useState('')

  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editMenuItem, setEditMenuItem] = useState<MenuItem | null>(null)
  const [editServiceItem, setEditServiceItem] = useState<ServiceItem | null>(null)
  const [menuForm, setMenuForm] = useState<MenuFormState>({
    name: '',
    description: '',
    price: '',
    available: true,
  })
  const [serviceForm, setServiceForm] = useState<ServiceFormState>({
    name: '',
    description: '',
    price: '',
    duration: '',
    available: true,
  })
  const [activeTab, setActiveTab] = useState<'menu' | 'services' | 'orders'>('menu')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const storedVendorId = localStorage.getItem('vendorId') || ''
    setVendorId(storedVendorId)
    if (storedVendorId) {
      void refreshVendorData(storedVendorId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshVendorData = async (targetVendorId: string) => {
    try {
      await Promise.all([
        fetchMenu(targetVendorId),
        fetchServices(targetVendorId),
        fetchOrders(targetVendorId),
      ])
      setError('')
    } catch (_e) {
      setError('Failed to load vendor data. Check the vendor ID and try again.')
    }
  }

  const fetchMenu = async (vid: string) => {
    const { data } = await api.get(`/vendors/${vid}/menu`)
    setVendorMenu(data)
  }

  const fetchServices = async (vid: string) => {
    const { data } = await api.get(`/vendors/${vid}/services`)
    setVendorServices(data)
  }

  const fetchOrders = async (vid: string) => {
    const { data } = await api.get(`/orders/${vid}`)
    setOrders(data)
  }

  const handleMenuSave = async () => {
    if (!vendorId) {
      setError('Vendor ID is required before creating menu items.')
      return
    }

    const payload = {
      ...menuForm,
      price: parseFloat(menuForm.price),
      vendorId,
    }

    if (editMenuItem) {
      await api.put(`/menu-items/${editMenuItem.id}`, payload)
    } else {
      await api.post('/menu-items', payload)
    }

    setShowMenuModal(false)
    setMenuForm({ name: '', description: '', price: '', available: true })
    setEditMenuItem(null)
    await fetchMenu(vendorId)
  }

  const handleServiceSave = async () => {
    if (!vendorId) {
      setError('Vendor ID is required before creating services.')
      return
    }

    const payload = {
      ...serviceForm,
      price: parseFloat(serviceForm.price),
      duration: serviceForm.duration ? parseInt(serviceForm.duration, 10) : null,
      vendorId,
    }

    if (editServiceItem) {
      await api.put(`/services/${editServiceItem.id}`, payload)
    } else {
      await api.post('/services', payload)
    }

    setShowServiceModal(false)
    setServiceForm({ name: '', description: '', price: '', duration: '', available: true })
    setEditServiceItem(null)
    await fetchServices(vendorId)
  }

  const handleMenuDelete = async (id: string) => {
    if (window.confirm('Delete this menu item?')) {
      await api.delete(`/menu-items/${id}`)
      await fetchMenu(vendorId)
    }
  }

  const handleServiceDelete = async (id: string) => {
    if (window.confirm('Delete this service?')) {
      await api.delete(`/services/${id}`)
      await fetchServices(vendorId)
    }
  }

  const handleStatusChange = async (orderId: string, status: string) => {
    await api.put(`/orders/${orderId}/status`, { status })
    await fetchOrders(vendorId)
  }

  const openMenuEdit = (item: MenuItem) => {
    setEditMenuItem(item)
    setMenuForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      available: item.available,
    })
    setShowMenuModal(true)
  }

  const openServiceEdit = (item: ServiceItem) => {
    setEditServiceItem(item)
    setServiceForm({
      name: item.name,
      description: item.description || '',
      price: String(item.price),
      duration: item.duration ? String(item.duration) : '',
      available: item.available,
    })
    setShowServiceModal(true)
  }

  const statusColor = (s: string): 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray' => {
    const map: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'failure' | 'gray'> = {
      Pending: 'warning',
      Accepted: 'info',
      Preparing: 'purple',
      Completed: 'success',
    }
    return map[s] || 'gray'
  }

  const handleVendorIdInput = async (value: string) => {
    setVendorId(value)
    localStorage.setItem('vendorId', value)
    if (value) {
      await refreshVendorData(value)
    }
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
        <div className="mb-5 max-w-lg">
          <Label htmlFor="vendor-id">Vendor ID</Label>
          <TextInput
            id="vendor-id"
            placeholder="Enter your Vendor ID"
            value={vendorId}
            onChange={(e) => {
              void handleVendorIdInput(e.target.value)
            }}
          />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          {(['menu', 'services', 'orders'] as const).map((tab) => (
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
              <Button
                onClick={() => {
                  setEditMenuItem(null)
                  setMenuForm({ name: '', description: '', price: '', available: true })
                  setShowMenuModal(true)
                }}
              >
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
                {vendorMenu.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>₱{Number(item.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge color={item.available ? 'success' : 'failure'}>{item.available ? 'Yes' : 'No'}</Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="xs" onClick={() => openMenuEdit(item)}>Edit</Button>
                      <Button size="xs" color="failure" onClick={() => void handleMenuDelete(item.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">Services</h2>
              <Button
                onClick={() => {
                  setEditServiceItem(null)
                  setServiceForm({ name: '', description: '', price: '', duration: '', available: true })
                  setShowServiceModal(true)
                }}
              >
                Add Service
              </Button>
            </div>
            <Table>
              <TableHead>
                <TableHeadCell>Name</TableHeadCell>
                <TableHeadCell>Description</TableHeadCell>
                <TableHeadCell>Price</TableHeadCell>
                <TableHeadCell>Duration</TableHeadCell>
                <TableHeadCell>Available</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody>
                {vendorServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>₱{Number(service.price).toFixed(2)}</TableCell>
                    <TableCell>{service.duration ? `${service.duration} min` : '-'}</TableCell>
                    <TableCell>
                      <Badge color={service.available ? 'success' : 'failure'}>
                        {service.available ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="xs" onClick={() => openServiceEdit(service)}>
                        Edit
                      </Button>
                      <Button size="xs" color="failure" onClick={() => void handleServiceDelete(service.id)}>
                        Delete
                      </Button>
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
                      {o.items.map((item, index) => (
                        <div key={`${item.itemId}-${item.type}-${index}`}>
                          [{item.type}] {item.name || item.itemId} x{item.quantity}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell><Badge color={statusColor(o.status)}>{o.status}</Badge></TableCell>
                    <TableCell>
                      <Select value={o.status} onChange={(e) => void handleStatusChange(o.id, e.target.value)}>
                        {['Pending', 'Accepted', 'Preparing', 'Completed'].map((s) => (
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

      <Modal show={showMenuModal} onClose={() => setShowMenuModal(false)}>
        <ModalHeader>{editMenuItem ? 'Edit Menu Item' : 'New Menu Item'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="iname">Name</Label>
              <TextInput
                id="iname"
                value={menuForm.name}
                onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="idesc">Description</Label>
              <Textarea
                id="idesc"
                value={menuForm.description}
                onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="iprice">Price</Label>
              <TextInput
                id="iprice"
                type="number"
                step="0.01"
                value={menuForm.price}
                onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={menuForm.available}
                onChange={(value) => setMenuForm({ ...menuForm, available: value })}
              />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => void handleMenuSave()}>Save</Button>
          <Button color="gray" onClick={() => setShowMenuModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>

      <Modal show={showServiceModal} onClose={() => setShowServiceModal(false)}>
        <ModalHeader>{editServiceItem ? 'Edit Service' : 'New Service'}</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sname">Name</Label>
              <TextInput
                id="sname"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sdesc">Description</Label>
              <Textarea
                id="sdesc"
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sprice">Price</Label>
              <TextInput
                id="sprice"
                type="number"
                step="0.01"
                value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sduration">Duration (minutes, optional)</Label>
              <TextInput
                id="sduration"
                type="number"
                value={serviceForm.duration}
                onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <ToggleSwitch
                checked={serviceForm.available}
                onChange={(value) => setServiceForm({ ...serviceForm, available: value })}
              />
              <span className="ml-2 text-sm text-gray-700">Available</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => void handleServiceSave()}>Save</Button>
          <Button color="gray" onClick={() => setShowServiceModal(false)}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
