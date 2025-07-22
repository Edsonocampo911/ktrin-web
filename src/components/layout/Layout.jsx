import { useLocation } from 'react-router-dom';
import Navigation from './Navigation.jsx';
import { useAuth } from '../../hooks/useAuth.js';

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isProfileComplete } = useAuth();

  // Rutas que no necesitan navegación
  const routesWithoutNavigation = [
    '/auth',
    '/register',
    '/invitation'
  ];

  // Verificar si la ruta actual necesita navegación
  const shouldShowNavigation = () => {
    // No mostrar navegación si no está autenticado o perfil incompleto
    if (!isAuthenticated || !isProfileComplete) {
      return false;
    }

    // No mostrar navegación en rutas específicas
    return !routesWithoutNavigation.some(route => 
      location.pathname.startsWith(route)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavigation() && <Navigation />}
      <main className={shouldShowNavigation() ? '' : 'min-h-screen'}>
        {children}
      </main>
    </div>
  );
};

export default Layout;

