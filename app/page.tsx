import { redirect } from 'next/navigation'

// Root page redirects to the app dashboard
// Middleware handles unauthenticated users → /login
export default function Home() {
  redirect('/stage/1')
}
