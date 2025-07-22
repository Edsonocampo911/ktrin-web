import { AuthProvider } from './hooks/useAuth.js';
import AppRouter from './router/AppRouter.jsx';
import './App.css';

// Componente raíz de la aplicación
const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;

