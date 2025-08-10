import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
    fetchMyBookings();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/slots/next-week');
      setSlots(response.data.data.slotsByDay);
    } catch {
      toast.error('Failed to fetch available slots');
    }
  };

  const fetchMyBookings = async () => {
    try {
      const response = await api.get('/my-bookings');
      setMyBookings(response.data.data.bookings);
    } catch {
      toast.error('Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId) => {
    setBookingLoading(true);
    try {
      await api.post('/book', { slotId });
      toast.success('Slot booked successfully!');
      fetchSlots(); // Refresh slots
      fetchMyBookings(); // Refresh bookings
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to book slot';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Booking cancelled successfully!');
      fetchMyBookings();
      fetchSlots();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Slots */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Slots (Next 7 Days)</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(slots).map(([date, daySlots]) => (
                <div key={date} className="border-b pb-4">
                  <h3 className="font-medium text-gray-700 mb-2">{date}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {daySlots
                      .filter(slot => !slot.isBooked)
                      .map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => bookSlot(slot.id)}
                          disabled={bookingLoading}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm disabled:opacity-50"
                        >
                          {slot.formattedTime.start} - {slot.formattedTime.end}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Bookings</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {myBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No bookings yet</p>
              ) : (
                myBookings.map(booking => (
                  <div key={booking.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(booking.slot.startAt)}
                        </p>
                        <p className="text-gray-600">
                          {formatTime(booking.slot.startAt)} - {formatTime(booking.slot.endAt)}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
