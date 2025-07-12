import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { supabase } from '../supabaseClient';

const LoginPage = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Fetch user details from your 'users' table to get userType
        const { data: userDetails, error: userError } = await supabase
          .from('users')
          .select('user_id, email, first_name, last_name, user_type, company_name')
          .eq('user_id', data.user.id)
          .single();

        if (userError) {
          throw userError;
        }

        const fullName = userDetails.company_name || `${userDetails.first_name} ${userDetails.last_name}`;

        setUser({ 
          id: userDetails.user_id, 
          email: userDetails.email, 
          name: fullName,
          first_name: userDetails.first_name,
          last_name: userDetails.last_name,
          company_name: userDetails.company_name,
          user_type: userDetails.user_type 
        });

        if (userDetails.user_type === 'provider') {
          navigate('/dashboard/provider');
        } else {
          navigate('/dashboard/client');
        }
      } else {
        throw new Error('No se pudo obtener la información del usuario.');
      }

    } catch (err) {
      console.error('Error durante el login:', err);
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <a className="underline cursor-pointer" onClick={() => navigate('/register')}>
              Regístrate
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;


