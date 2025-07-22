import { useNavigate } from 'react-router-dom';
import ClientDashboard from '../components/dashboard/ClientDashboard.jsx';

const DashboardPage = () => {
  const navigate = useNavigate();

  // Manejar navegación a crear evento
  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  // Manejar vista de evento
  const handleViewEvent = (event) => {
    // En el futuro, esto navegará a /events/:id
    console.log('Ver evento:', event);
  };

  // Manejar edición de evento
  const handleEditEvent = (event) => {
    // En el futuro, esto navegará a /events/:id/edit
    console.log('Editar evento:', event);
  };

  // Manejar generación de QR
  const handleGenerateQR = (event) => {
    navigate(`/events/${event.event_id}/qr`, { state: { event } });
  };

  return (
    <ClientDashboard
      onCreateEvent={handleCreateEvent}
      onViewEvent={handleViewEvent}
      onEditEvent={handleEditEvent}
      onGenerateQR={handleGenerateQR}
    />
  );
};

export default DashboardPage;

