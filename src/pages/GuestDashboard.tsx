import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar, MapPin, Download, Phone,
  Clock, CheckCircle, XCircle, ArrowRight, Heart,
  FileText, AlertCircle
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

const STATUS_CONFIG: any = {
  inquiry: { label: 'Inquiry', color: 'bg-gray-100 text-gray-700', icon: Clock },
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  checked_in: { label: 'Checked In', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  checked_out: { label: 'Completed', color: 'bg-gray-100 text-gray-700', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-700', icon: XCircle },
};

export default function GuestDashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin();
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      // Load user's bookings
      const bookingsData = await base44.entities.Booking.filter(
        { guest_email: userData.email },
        '-created_date'
      );
      setBookings(bookingsData);

      // Load property details for each booking
      const propertyIds = [...new Set(bookingsData.map((b: any) => b.property_id))];
      const propertiesData = await Promise.all(
        propertyIds.map((id: string) => base44.entities.Property.filter({ id }))
      );
      const propsMap: any = {};
      propertiesData.forEach((p: any) => {
        if (p[0]) propsMap[p[0].id] = p[0];
      });
      setProperties(propsMap);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date();

  const upcomingBookings = bookings.filter((b: any) => {
    const checkIn = parseISO(b.check_in_date);
    return isAfter(checkIn, today) && !['cancelled', 'refunded', 'checked_out'].includes(b.status);
  });

  const pastBookings = bookings.filter((b: any) => {
    const checkOut = parseISO(b.check_out_date);
    return isBefore(checkOut, today) || ['checked_out', 'cancelled', 'refunded'].includes(b.status);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="space-y-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: any }) => {
    const property = properties[booking.property_id];
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.inquiry;
    const StatusIcon = statusConfig.icon;
    const checkIn = parseISO(booking.check_in_date);
    const checkOut = parseISO(booking.check_out_date);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
      >
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-48 h-48 md:h-auto">
            <img
              src={property?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80'}
              alt={property?.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-[#2C2C2C]">
                  {property?.name || 'Property'}
                </h3>
                <p className="text-sm text-[#2C2C2C]/60 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property?.location?.district || property?.location?.region}
                </p>
              </div>
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="text-[#2C2C2C]/50 text-xs mb-1">Check-in</p>
                <p className="font-medium">{format(checkIn, 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-[#2C2C2C]/50 text-xs mb-1">Check-out</p>
                <p className="font-medium">{format(checkOut, 'MMM d, yyyy')}</p>
              </div>
              <div>
                <p className="text-[#2C2C2C]/50 text-xs mb-1">Guests</p>
                <p className="font-medium">{booking.guests_count}</p>
              </div>
              <div>
                <p className="text-[#2C2C2C]/50 text-xs mb-1">Total</p>
                <p className="font-medium text-[#B5573E]">৳{booking.total_amount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[#2C2C2C]/50">Ref: {booking.booking_ref}</span>
              {booking.invoice_no && (
                <Button variant="ghost" size="sm" className="h-6 text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Invoice
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Actions bar */}
        {booking.status === 'confirmed' && (
          <div className="border-t bg-[#F5F0E8]/50 px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm">
                {property?.location && (
                  <a 
                    href={`https://maps.google.com/?q=${property.location.lat},${property.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B5573E] hover:underline"
                  >
                    Get Directions →
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Phone className="w-3 h-3 mr-1" />
                  Contact
                </Button>
                <Link to={createPageUrl(`PropertyDetail?id=${booking.property_id}`)}>
                  <Button variant="outline" size="sm">
                    View Property
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Impact section for completed bookings */}
        {booking.status === 'checked_out' && booking.impact_statement && (
          <div className="border-t bg-[#8B9D77]/10 px-6 py-4">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-[#8B9D77] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#2C2C2C] mb-1">Your Impact</p>
                <p className="text-sm text-[#2C2C2C]/70">{booking.impact_statement}</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-[#2C2C2C] mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-[#2C2C2C]/60">
            Manage your bookings and explore your journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-light text-[#B5573E]">{upcomingBookings.length}</p>
            <p className="text-xs text-[#2C2C2C]/60">Upcoming</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-light text-[#2C2C2C]">{pastBookings.length}</p>
            <p className="text-xs text-[#2C2C2C]/60">Completed</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-2xl font-light text-[#8B9D77]">{bookings.length}</p>
            <p className="text-xs text-[#2C2C2C]/60">Total Stays</p>
          </div>
        </div>

        {/* Bookings tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <Calendar className="w-12 h-12 text-[#2C2C2C]/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">No upcoming bookings</h3>
                <p className="text-[#2C2C2C]/60 mb-6">Discover unique spaces and plan your next stay</p>
                <Link to={createPageUrl('Home')}>
                  <Button className="bg-[#B5573E] hover:bg-[#9a4935]">
                    Explore Spaces
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingBookings.map((booking: any) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <FileText className="w-12 h-12 text-[#2C2C2C]/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">No past bookings yet</h3>
                <p className="text-[#2C2C2C]/60">Your booking history will appear here</p>
              </div>
            ) : (
              pastBookings.map((booking: any) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
