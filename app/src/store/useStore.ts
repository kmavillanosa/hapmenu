import { create } from 'zustand'

export interface User {
  id: string
  name: string
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER'
  token: string
}

export interface MenuItem {
  id: string
  name: string
  price: number
  available: boolean
  description?: string
  vendorId?: string
}

export interface ServiceItem {
  id: string
  name: string
  price: number
  duration?: number
  available: boolean
  description?: string
  vendorId?: string
}

export interface OrderItem {
  itemId: string
  type: 'menu' | 'service'
  quantity: number
  name?: string
  price?: number
}

export interface OrderData {
  id: string
  customerId: string
  vendorId: string
  items: OrderItem[]
  status: string
  createdAt: string
}

interface Store {
  user: User | null
  setUser: (user: User | null) => void
  cart: OrderItem[]
  addToCart: (item: OrderItem) => void
  removeFromCart: (itemId: string, type: 'menu' | 'service') => void
  clearCart: () => void
  vendorMenu: MenuItem[]
  setVendorMenu: (menu: MenuItem[]) => void
  vendorServices: ServiceItem[]
  setVendorServices: (services: ServiceItem[]) => void
  orders: OrderData[]
  setOrders: (orders: OrderData[]) => void
  logout: () => void
}

const getStoredUser = (): User | null => {
  const rawUser = localStorage.getItem('user')
  const token = localStorage.getItem('token')
  if (!rawUser || !token) {
    return null
  }

  try {
    const parsed = JSON.parse(rawUser) as Omit<User, 'token'>
    return { ...parsed, token }
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

export const useStore = create<Store>((set) => ({
  user: getStoredUser(),
  cart: [],
  vendorMenu: [],
  vendorServices: [],
  orders: [],
  setUser: (user) => {
    if (user) {
      localStorage.setItem('token', user.token)
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
        }),
      )
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    set({ user })
  },
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.itemId === item.itemId && c.type === item.type)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.itemId === item.itemId && c.type === item.type
              ? { ...c, quantity: c.quantity + item.quantity }
              : c,
          ),
        }
      }
      return { cart: [...state.cart, item] }
    }),
  removeFromCart: (itemId, type) =>
    set((state) => ({ cart: state.cart.filter((c) => !(c.itemId === itemId && c.type === type)) })),
  clearCart: () => set({ cart: [] }),
  setVendorMenu: (vendorMenu) => set({ vendorMenu }),
  setVendorServices: (vendorServices) => set({ vendorServices }),
  setOrders: (orders) => set({ orders }),
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, cart: [], vendorMenu: [], vendorServices: [], orders: [] })
  },
}))
