import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Layout from '../components/layout/Layout.jsx';
import AuthForm from '../components/auth/AuthForm.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import CreateEventPage from '../pages/CreateEventPage.jsx';
import QRGeneratorPage from '../pages/QRGeneratorPage.jsx';
import InvitationDisplayPage from '../pages/InvitationDisplayPage.jsx';
import GuestRegistrationPage from '../pages/GuestRegistrationPage.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Loader2 } from 'lucide-react';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              <div className="space-y-2">
                <p className="font-medium">Perfil incompleto</p>
                <p>
                  Para continuar, necesitas completar tu perfil con tu nombre completo y tipo de usuario.
                </p>
                <p className="text-sm">
                  Por favor, cierra sesión y vuelve a registrarte con la información completa.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return children;
};

// Componente para rutas públicas (cuando el usuario ya está autenticado, redirigir al dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, isProfileComplete } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isProfileComplete) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Componente para rutas completamente públicas (sin verificación de autenticación)
const OpenRoute = ({ children }) => {
  return children;
};

// Componente principal del router
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas públicas de autenticación */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            } 
          />

          {/* Rutas completamente públicas (registro e invitaciones) */}
          <Route 
            path="/register/:eventId" 
            element={
              <OpenRoute>
                <GuestRegistrationPage />
              </OpenRoute>
            } 
          />
          
          <Route 
            path="/invitation/:eventId" 
            element={
              <OpenRoute>
                <InvitationDisplayPage />
              </OpenRoute>
            } 
          />

          {/* Rutas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/events/create" 
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/events/:eventId/qr" 
            element={
              <ProtectedRoute>
                <QRGeneratorPage />
              </ProtectedRoute>
            } 
          />

          {/* Ruta por defecto */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />

          {/* Ruta 404 */}
          <Route 
            path="*" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Página no encontrada</p>
                  <a 
                    href="/dashboard" 
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Volver al inicio
                  </a>
                </div>
              </div>
            } 
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default AppRouter;

