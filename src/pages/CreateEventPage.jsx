import { useNavigate } from 'react-router-dom';
import CreateEventForm from '../components/events/CreateEventForm.jsx';

const CreateEventPage = () => {
  const navigate = useNavigate();

  // Manejar éxito en creación de evento
  const handleEventCreated = (event) => {
    // Redirigir al dashboard con mensaje de éxito
    navigate('/dashboard', { 
      state: { 
        message: `Evento "${event.title}" creado exitosamente`,
        type: 'success'
      }
    });
  };

  // Manejar cancelación
  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="py-8">
      <CreateEventForm
        onSuccess={handleEventCreated}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateEventPage;

