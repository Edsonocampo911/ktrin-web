import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Mail, Copy, Download, Share2, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../supabaseClient';

const EventInvitationDisplay = ({ eventId, onClose }) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const { data, error } = await supabase
          .from('event_invitations')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setInvitations(data || []);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError('Error al cargar las invitaciones');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchInvitations();
    }
  }, [eventId]);

  const copyToClipboard = async (text, code) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const downloadQR = (qrCodeUrl, guestEmail) => {
    const canvas = document.getElementById(`qr-${guestEmail.replace('@', '-').replace('.', '-')}`);
    if (canvas) {
      const link = document.createElement('a');
      link.download = `invitation-qr-${guestEmail}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando invitaciones...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Invitaciones Generadas
          </CardTitle>
          <CardDescription>
            Se han generado {invitations.length} invitaciones con códigos QR únicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Evento creado exitosamente! Las invitaciones están listas para compartir.
              Cada invitado recibirá un código QR único que los llevará a una página personalizada
              donde podrán confirmar su asistencia y proporcionar sus condiciones alimenticias.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {invitations.map((invitation) => (
              <Card key={invitation.invitation_id} className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{invitation.guest_email}</span>
                        <Badge variant="outline" className="text-xs">
                          {invitation.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <strong>URL de invitación:</strong>
                        <div className="bg-gray-50 p-2 rounded mt-1 break-all">
                          {invitation.qr_code_url}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(invitation.qr_code_url, invitation.invitation_code)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copiedCode === invitation.invitation_code ? 'Copiado!' : 'Copiar URL'}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadQR(invitation.qr_code_url, invitation.guest_email)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Descargar QR
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'Invitación a evento',
                                text: `Estás invitado a nuestro evento. Confirma tu asistencia:`,
                                url: invitation.qr_code_url
                              });
                            } else {
                              copyToClipboard(invitation.qr_code_url, invitation.invitation_code);
                            }
                          }}
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Compartir
                        </Button>
                      </div>
                    </div>

                    <div className="ml-4 text-center">
                      <div className="bg-white p-2 rounded border">
                        <QRCode
                          id={`qr-${invitation.guest_email.replace('@', '-').replace('.', '-')}`}
                          value={invitation.qr_code_url}
                          size={100}
                          level="M"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Código QR</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button onClick={onClose} className="flex-1">
              Ir al Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Imprimir Invitaciones
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventInvitationDisplay;

