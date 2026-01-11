import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search, Calendar, Users, Phone, Mail, Clock,
  CheckCircle, XCircle, LogIn, LogOut, AlertTriangle,
  FileText, MoreVertical, Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

const STATUS_CONFIG: any = {
  inquiry: { label: 'Inquiry', color: 'bg-gray-100 text-gray-700', icon: Clock },
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  checked_in: { label: 'Checked In', color: 'bg-green-100 text-green-700', icon: LogIn },
  checked_out: { label: 'Checked Out', color: 'bg-gray-100 text-gray-700', icon: LogOut },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-700', icon: XCircle },
};

export default function BookingOperations() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, propertiesData] = await Promise.all([
        base44.entities.Booking.list('-created_date', 200),
        base44.entities.Property.list(),
      ]);
      setBookings(bookingsData);

      const propsMap: any = {};
      propertiesData.forEach((p: any) => { propsMap[p.id] = p; });
      setProperties(propsMap);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'checked_in') {
        updates.checked_in_at = new Date().toISOString();
      } else if (newStatus === 'checked_out') {
        updates.checked_out_at = new Date().toISOString();
      }

      await base44.entities.Booking.update(bookingId, updates);
      setBookings(bookings.map((b: any) => 
        b.id === bookingId ? { ...b, ...updates } : b
      ));
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  // Filter bookings
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');

  const filteredBookings = bookings.filter((b: any) => {
    const matchesSearch = !searchQuery || 
      b.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.booking_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || b.property_id === propertyFilter;

    // Tab filtering
    if (activeTab === 'arrivals') {
      return matchesSearch && matchesProperty && 
        b.check_in_date === todayStr && 
        ['confirmed', 'pending_payment'].includes(b.status);
    }
    if (activeTab === 'departures') {
      return matchesSearch && matchesProperty && 
        b.check_out_date === todayStr && 
        b.status === 'checked_in';
    }
    if (activeTab === 'active') {
      return matchesSearch && matchesProperty && 
        ['confirmed', 'checked_in'].includes(b.status);
    }

    return matchesSearch && matchesStatus && matchesProperty;
  });

  const arrivalsCount = bookings.filter((b: any) => 
    b.check_in_date === todayStr && ['confirmed', 'pending_payment'].includes(b.status)
  ).length;

  const departuresCount = bookings.filter((b: any) => 
    b.check_out_date === todayStr && b.status === 'checked_in'
  ).length;

  const BookingRow = ({ booking }: { booking: any }) => {
    const property = properties[booking.property_id];
    const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.inquiry;
    const StatusIcon = statusConfig.icon;
    const checkIn = parseISO(booking.check_in_date);
    const checkOut = parseISO(booking.check_out_date);

    const isArrivalToday = isToday(checkIn) && ['confirmed', 'pending_payment'].includes(booking.status);
    const isDepartureToday = isToday(checkOut) && booking.status === 'checked_in';

    return (
      <tr className="border-b hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            {isArrivalToday && <span className="w-2 h-2 rounded-full bg-green-500" title="Arriving today" />}
            {isDepartureToday && <span className="w-2 h-2 rounded-full bg-orange-500" title="Departing today" />}
            <div>
              <p className="font-medium text-gray-900">{booking.booking_ref}</p>
              <p className="text-xs text-gray-500">{format(parseISO(booking.created_date), 'MMM d, HH:mm')}</p>
            </div>
          </div>
        </td>
        <td className="py-4 px-4">
          <div>
            <p className="font-medium">{booking.guest_name}</p>
            <p className="text-xs text-gray-500">{booking.guest_email}</p>
          </div>
        </td>
        <td className="py-4 px-4">
          <p className="text-sm">{property?.name || '—'}</p>
        </td>
        <td className="py-4 px-4">
          <div className="text-sm">
            <p>{format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d')}</p>
            <p className="text-xs text-gray-500">{booking.guests_count} guests</p>
          </div>
        </td>
        <td className="py-4 px-4">
          <p className="font-medium">৳{booking.total_amount?.toLocaleString()}</p>
          <p className="text-xs text-gray-500 capitalize">{booking.pricing_tier}</p>
        </td>
        <td className="py-4 px-4">
          <Badge className={statusConfig.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </td>
        <td className="py-4 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 !text-gray-700 hover:!bg-gray-100 hover:!text-gray-900">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[102] !bg-white">
              <DropdownMenuItem onClick={() => setSelectedBooking(booking)} className="!text-gray-900">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {booking.status === 'confirmed' && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'checked_in')} className="!text-gray-900">
                  <LogIn className="w-4 h-4 mr-2" />
                  Check In
                </DropdownMenuItem>
              )}
              {booking.status === 'checked_in' && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'checked_out')} className="!text-gray-900">
                  <LogOut className="w-4 h-4 mr-2" />
                  Check Out
                </DropdownMenuItem>
              )}
              {booking.status === 'pending_payment' && (
                <DropdownMenuItem onClick={() => updateBookingStatus(booking.id, 'confirmed')} className="!text-gray-900">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Paid
                </DropdownMenuItem>
              )}
              {['inquiry', 'pending_payment', 'confirmed'].includes(booking.status) && (
                <DropdownMenuItem 
                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                  className="!text-red-600"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Booking Operations</h1>
          <p className="text-gray-500 mt-1">{bookings.length} total bookings</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('arrivals')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Arrivals</p>
                <p className="text-2xl font-semibold text-green-600">{arrivalsCount}</p>
              </div>
              <LogIn className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('departures')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Departures</p>
                <p className="text-2xl font-semibold text-orange-600">{departuresCount}</p>
              </div>
              <LogOut className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Payment</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {bookings.filter((b: any) => b.status === 'pending_payment').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Currently Checked In</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {bookings.filter((b: any) => b.status === 'checked_in').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="!bg-white border-2 shadow-sm">
        <CardContent className="pt-6 !bg-white">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 !bg-white !text-gray-900 border-gray-200 placeholder:text-gray-400"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 !bg-white !text-gray-900 border-gray-200">
                <SelectValue placeholder="Status" className="!text-gray-900">
                  {statusFilter === 'all' 
                    ? 'All Status' 
                    : STATUS_CONFIG[statusFilter]?.label || 'All Status'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[102] !bg-white">
                <SelectItem value="all" className="!text-gray-900">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([key, config]: [string, any]) => (
                  <SelectItem key={key} value={key} className="!text-gray-900">{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-48 !bg-white !text-gray-900 border-gray-200">
                <SelectValue placeholder="Property" className="!text-gray-900">
                  {propertyFilter === 'all' 
                    ? 'All Properties' 
                    : Object.values(properties).find((p: any) => p.id === propertyFilter)?.name || 'All Properties'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="z-[102] !bg-white">
                <SelectItem value="all" className="!text-gray-900">All Properties</SelectItem>
                {Object.values(properties).map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="!text-gray-900">{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="arrivals">
                Arrivals Today ({arrivalsCount})
              </TabsTrigger>
              <TabsTrigger value="departures">
                Departures Today ({departuresCount})
              </TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
            </TabsList>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-3 px-4 font-medium">Reference</th>
                    <th className="pb-3 px-4 font-medium">Guest</th>
                    <th className="pb-3 px-4 font-medium">Property</th>
                    <th className="pb-3 px-4 font-medium">Dates</th>
                    <th className="pb-3 px-4 font-medium">Amount</th>
                    <th className="pb-3 px-4 font-medium">Status</th>
                    <th className="pb-3 px-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking: any) => (
                    <BookingRow key={booking.id} booking={booking} />
                  ))}
                </tbody>
              </table>

              {filteredBookings.length === 0 && (
                <p className="text-center text-gray-400 py-12">No bookings found</p>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl !bg-white">
          <DialogHeader>
            <DialogTitle className="!text-gray-900">Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 !text-gray-900">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold !text-gray-900">{selectedBooking.booking_ref}</p>
                  <Badge className={STATUS_CONFIG[selectedBooking.status]?.color || ''}>
                    {STATUS_CONFIG[selectedBooking.status]?.label || selectedBooking.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#B5573E]">
                    ৳{selectedBooking.total_amount?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{selectedBooking.pricing_tier} rate</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium !text-gray-900 mb-3">Guest Information</h4>
                  <div className="space-y-2 text-sm !text-gray-900">
                    <p className="!text-gray-900"><strong className="!text-gray-900">Name:</strong> {selectedBooking.guest_name}</p>
                    <p className="flex items-center gap-2 !text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedBooking.guest_email}
                    </p>
                    <p className="flex items-center gap-2 !text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedBooking.guest_phone || '—'}
                    </p>
                    <p className="!text-gray-900"><strong className="!text-gray-900">Guests:</strong> {selectedBooking.guests_count}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium !text-gray-900 mb-3">Stay Details</h4>
                  <div className="space-y-2 text-sm !text-gray-900">
                    <p className="!text-gray-900"><strong className="!text-gray-900">Property:</strong> {properties[selectedBooking.property_id]?.name}</p>
                    <p className="!text-gray-900"><strong className="!text-gray-900">Check-in:</strong> {format(parseISO(selectedBooking.check_in_date), 'MMMM d, yyyy')}</p>
                    <p className="!text-gray-900"><strong className="!text-gray-900">Check-out:</strong> {format(parseISO(selectedBooking.check_out_date), 'MMMM d, yyyy')}</p>
                    {selectedBooking.special_requests && (
                      <p className="!text-gray-900"><strong className="!text-gray-900">Special Requests:</strong> {selectedBooking.special_requests}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium !text-gray-900 mb-3">Payment</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Base Amount</p>
                    <p className="font-medium !text-gray-900">৳{selectedBooking.base_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">VAT</p>
                    <p className="font-medium !text-gray-900">৳{selectedBooking.vat_amount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Method</p>
                    <p className="font-medium !text-gray-900 capitalize">{selectedBooking.payment_method || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                {selectedBooking.status === 'pending_payment' && (
                  <Button onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Paid
                  </Button>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button 
                    onClick={() => updateBookingStatus(selectedBooking.id, 'checked_in')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Check In Guest
                  </Button>
                )}
                {selectedBooking.status === 'checked_in' && (
                  <Button 
                    onClick={() => updateBookingStatus(selectedBooking.id, 'checked_out')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Check Out Guest
                  </Button>
                )}
                {['inquiry', 'pending_payment', 'confirmed'].includes(selectedBooking.status) && (
                  <Button 
                    onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
