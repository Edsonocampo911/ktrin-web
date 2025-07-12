import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Importar componentes de páginas
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ClientDashboard from './components/ClientDashboard'
import ClientDashboardV2 from './components/ClientDashboardV2'
import ProviderDashboard from './components/ProviderDashboard'
import CreateEvent from './components/CreateEvent'
import CreateEventV2 from './components/CreateEventV2'
import ServiceManagement from './components/ServiceManagement'
import PromotionalPackages from './components/PromotionalPackages'
import IndividualServices from './components/IndividualServices'
import LocationSelector from './components/LocationSelector'
import GuestRegistration from './components/GuestRegistration'
import GuestRegistrationV2 from './components/GuestRegistrationV2'
import OrganizerNotifications from './components/OrganizerNotifications'
import EventCalendar from './components/EventCalendar'
import OptimizedCreateEvent from './components/OptimizedCreateEvent'
import { supabase } from './supabaseClient'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Get user details from our users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (userData && !error) {
          setUser(userData)
        }
      }
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
        
        if (userData && !error) {
          setUser(userData)
        }
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={!user ? <LoginPage setUser={setUser} onLogout={handleLogout} /> : <Navigate to={user.user_type === 'provider' ? '/dashboard/provider' : '/dashboard/client'} />} 
          />
          <Route 
            path="/register" 
            element={!user ? <RegisterPage setUser={setUser} /> : <Navigate to={user.user_type === 'provider' ? '/dashboard/provider' : '/dashboard/client'} />} 
          />
          <Route 
            path="/dashboard/client" 
            element={user && user.user_type === 'client' ? <ClientDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard/client-v2" 
            element={user && user.user_type === 'client' ? <ClientDashboardV2 user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/dashboard/provider" 
            element={user && user.user_type === 'provider' ? <ProviderDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-event" 
            element={user && user.user_type === 'client' ? <CreateEvent user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-event-v2" 
            element={user && user.user_type === 'client' ? <CreateEventV2 user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/manage-services" 
            element={user && user.user_type === 'provider' ? <ServiceManagement user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/create-event-optimized" 
            element={user ? <OptimizedCreateEvent user={user} /> : <Navigate to="/login" />} 
          />
          <Route path="/promotional-packages" element={<PromotionalPackages userType="provider" />} />
          <Route path="/individual-services" element={<IndividualServices userType="client" />} />
          <Route path="/location-selector" element={<LocationSelector />} />
          <Route path="/guest-registration/:eventId?" element={<GuestRegistration />} />
          <Route path="/guest-registration-v2/:eventId?" element={<GuestRegistrationV2 />} />
          <Route path="/organizer-notifications/:eventId?" element={<OrganizerNotifications />} />
          <Route path="/event-calendar" element={<EventCalendar userType="provider" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App


