import { create } from 'zustand'

export interface CartItem {
  menuItemId: string
  quantity: number
  name: string
  price: number
}

export interface MenuItemData {
  id: string
  name: string
  description: string
  price: number
  available: boolean
  vendorId: string
}

export interface OrderData {
  id: string
  customerId: string
  vendorId: string
  items: CartItem[]
  status: string
  createdAt: string
}

export interface UserInfo {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'VENDOR' | 'CUSTOMER'
}

interface AppState {
  user: UserInfo | null
  token: string | null
  cart: CartItem[]
  vendorMenu: MenuItemData[]
  orders: OrderData[]
  setUser: (user: UserInfo | null) => void
  setToken: (token: string | null) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (menuItemId: string) => void
  clearCart: () => void
  setVendorMenu: (menu: MenuItemData[]) => void
  setOrders: (orders: OrderData[]) => void
  logout: () => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  cart: [],
  vendorMenu: [],
  orders: [],
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
    set({ token })
  },
  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.menuItemId === item.menuItemId)
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.menuItemId === item.menuItemId
              ? { ...c, quantity: c.quantity + item.quantity }
              : c,
          ),
        }
      }
      return { cart: [...state.cart, item] }
    }),
  removeFromCart: (menuItemId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.menuItemId !== menuItemId) })),
  clearCart: () => set({ cart: [] }),
  setVendorMenu: (vendorMenu) => set({ vendorMenu }),
  setOrders: (orders) => set({ orders }),
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, cart: [], orders: [] })
  },
}))
