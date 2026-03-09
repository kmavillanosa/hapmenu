import { useEffect, useState } from 'react'
import { Button, Card, Modal, ModalHeader, ModalBody, ModalFooter, Label, TextInput } from 'flowbite-react'
import { useStore } from '../store/useStore'
import api from '../api/client'

interface Vendor {
  id: string
  name: string
  description: string
  subdomain: string
}

interface Props {
  subdomain: string
}

export default function CustomerPage({ subdomain }: Props) {
  const { vendorMenu, setVendorMenu, cart, addToCart, removeFromCart, clearCart } = useStore()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [showCart, setShowCart] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const { data } = await api.get(`/vendors/${subdomain}`)
        setVendor(data)
        setVendorMenu(data.menuItems || [])
      } catch (_e) {
        setError('Vendor not found')
      }
    }
    fetchVendor()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdomain])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleOrder = async () => {
    if (!vendor) return
    try {
      await api.post('/orders', {
        customerId: customerName || 'guest',
        vendorId: vendor.id,
        items: cart.map((c) => ({ menuItemId: c.menuItemId, name: c.name, price: c.price, quantity: c.quantity })),
      })
      clearCart()
      setOrdered(true)
      setShowCart(false)
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
          🛒 Cart
          {cart.length > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cart.reduce((s, c) => s + c.quantity, 0)}
            </span>
          )}
        </Button>
      </header>

      {ordered && (
        <div className="m-4 p-4 bg-green-100 rounded-lg text-green-800 text-center">
          ✅ Order placed successfully! Thank you for your order.
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
                  onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 })}
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
      </main>

      <Modal show={showCart} onClose={() => setShowCart(false)}>
        <ModalHeader>Your Cart</ModalHeader>
        <ModalBody>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">₱{item.price} x {item.quantity}</p>
                  </div>
                  <Button size="xs" color="failure" onClick={() => removeFromCart(item.menuItemId)}>Remove</Button>
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
