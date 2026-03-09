import { useEffect, useMemo, useState } from 'react'
import { Button, Card, Label, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from 'flowbite-react'
import api from '../api/client'
import { useStore } from '../store/useStore'
import type { MenuItem, ServiceItem } from '../store/useStore'

interface Vendor {
  id: string
  name: string
  description?: string
  subdomain: string
  menuItems: MenuItem[]
  services: ServiceItem[]
}

interface Props {
  subdomain: string
}

export default function CustomerPage({ subdomain }: Props) {
  const {
    vendorMenu,
    setVendorMenu,
    vendorServices,
    setVendorServices,
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  } = useStore()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchVendor = async () => {
      try {
        const { data } = await api.get(`/vendors/${subdomain}`)
        if (!mounted) {
          return
        }
        setVendor(data)
        setVendorMenu(data.menuItems || [])
        setVendorServices(data.services || [])
        setError('')
      } catch (_e) {
        if (!mounted) {
          return
        }
        setError('Vendor not found')
      }
    }

    fetchVendor()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain])

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [cart],
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  const handleOrder = async () => {
    if (!vendor) return
    if (cart.length === 0) {
      return
    }

    try {
      await api.post('/orders', {
        customerId: customerName.trim() || 'guest',
        vendorId: vendor.id,
        items: cart.map((item) => ({
          itemId: item.itemId,
          type: item.type,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
        })),
      })
      clearCart()
      setCustomerName('')
      setOrdered(true)
      setShowCart(false)
      setError('')
    } catch (_e) {
      setError('Failed to place order')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
          {vendor.description && <p className="text-gray-500 text-sm">{vendor.description}</p>}
        </div>
        <Button onClick={() => setShowCart(true)} className="relative">
          Cart
          {cartCount > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cartCount}
            </span>
          )}
        </Button>
      </header>

      {ordered && (
        <div className="m-4 p-4 bg-green-100 rounded-lg text-green-800 text-center">
          Order placed successfully. Thank you for your order.
        </div>
      )}

      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorMenu.filter((item) => item.available).map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
              {item.description && <p className="text-gray-500 text-sm">{item.description}</p>}
              <div className="flex justify-between items-center mt-2">
                <span className="text-green-600 font-semibold">₱{Number(item.price).toFixed(2)}</span>
                <Button
                  size="sm"
                  onClick={() =>
                    addToCart({
                      itemId: item.id,
                      type: 'menu',
                      name: item.name,
                      price: Number(item.price),
                      quantity: 1,
                    })
                  }
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {vendorMenu.filter((i) => i.available).length === 0 && (
          <p className="text-center text-gray-400 mt-8">No items available at this time.</p>
        )}

        <h2 className="text-xl font-semibold mt-10 mb-4">Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendorServices.filter((service) => service.available).map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition">
              <h3 className="text-lg font-bold text-gray-800">{service.name}</h3>
              {service.description && <p className="text-gray-500 text-sm">{service.description}</p>}
              {service.duration ? (
                <p className="text-xs text-gray-500 mt-2">Duration: {service.duration} minutes</p>
              ) : null}
              <div className="flex justify-between items-center mt-3">
                <span className="text-green-600 font-semibold">₱{Number(service.price).toFixed(2)}</span>
                <Button
                  size="sm"
                  onClick={() =>
                    addToCart({
                      itemId: service.id,
                      type: 'service',
                      name: service.name,
                      price: Number(service.price),
                      quantity: 1,
                    })
                  }
                >
                  Add to Cart
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {vendorServices.filter((service) => service.available).length === 0 && (
          <p className="text-center text-gray-400 mt-8">No services available at this time.</p>
        )}
      </main>

      <Modal show={showCart} onClose={() => setShowCart(false)}>
        <ModalHeader>Your Cart</ModalHeader>
        <ModalBody>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.type}-${item.itemId}`} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name || item.itemId}</p>
                    <p className="text-sm text-gray-500">
                      {item.type === 'service' ? 'Service' : 'Menu'} | ₱{item.price || 0} x {item.quantity}
                    </p>
                  </div>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => removeFromCart(item.itemId, item.type)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="border-t pt-2 font-semibold">
                Total: ₱{cartTotal.toFixed(2)}
              </div>
              <div>
                <Label htmlFor="cname">Your Name (optional)</Label>
                <TextInput id="cname" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Guest" />
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          {cart.length > 0 && <Button onClick={handleOrder}>Place Order</Button>}
          <Button color="gray" onClick={() => setShowCart(false)}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
