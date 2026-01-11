import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

const STATUS_COLORS: any = {
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  checked_in: 'bg-green-100 text-green-700 border-green-200',
  checked_out: 'bg-gray-100 text-gray-700 border-gray-200',
  pending_payment: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function PropertyCalendar() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');
  const [property, setProperty] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (propertyId) {
      loadData();
    }
  }, [propertyId]);

  const loadData = async () => {
    try {
      const [propertyData, bookingsData] = await Promise.all([
        base44.entities.Property.filter({ id: propertyId }),
        base44.entities.Booking.list('-created_date', 200),
      ]);
      setProperty(propertyData[0]);
      
      // Filter bookings for this property
      const propertyBookings = bookingsData.filter((b: any) => b.property_id === propertyId);
      setBookings(propertyBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking: any) => {
      const checkIn = parseISO(booking.check_in_date);
      const checkOut = parseISO(booking.check_out_date);
      return (
        (isSameDay(checkIn, date) || isSameDay(checkOut, date)) ||
        (date >= checkIn && date <= checkOut)
      );
    });
  };

  // Get date modifiers for calendar
  const dateModifiers = {
    hasArrival: (date: Date) => {
      return bookings.some((b: any) => isSameDay(parseISO(b.check_in_date), date));
    },
    hasDeparture: (date: Date) => {
      return bookings.some((b: any) => isSameDay(parseISO(b.check_out_date), date));
    },
    hasBooking: (date: Date) => {
      return getBookingsForDate(date).length > 0;
    },
  };

  const selectedDateBookings = getBookingsForDate(selectedDate);

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-[500px] rounded-xl" />
          <Skeleton className="h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Property not found</h2>
          <Link to={createPageUrl('ManagementProperties')}>
            <Button variant="outline">Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('ManagementProperties')}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Property Calendar</h1>
            <p className="text-gray-500 text-sm">{property.name}</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card className="flex flex-col !bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="!bg-gray-100 border-b border-gray-200">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Availability Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col !bg-white">
            <div className="flex-1 flex items-center justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={dateModifiers}
                modifiersClassNames={{
                  hasArrival: 'bg-green-100 border-green-300',
                  hasDeparture: 'bg-orange-100 border-orange-300',
                  hasBooking: 'bg-blue-50',
                }}
                className="rounded-md border w-full scale-125 md:scale-150 lg:scale-100"
                classNames={{
                  months: "flex flex-col space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-base md:text-lg font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 p-0",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-10 md:w-12 font-normal text-sm md:text-base",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  day: "h-10 md:h-12 w-10 md:w-12 p-0 font-normal aria-selected:opacity-100 text-sm md:text-base",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "day-outside text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                <span>Arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
                <span>Departure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200" />
                <span>Occupied</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings for Selected Date */}
        <Card className="!bg-white shadow-lg border-2 border-gray-200">
          <CardHeader className="!bg-gray-100 border-b border-gray-200">
            <CardTitle>
              Bookings for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent className="!bg-white">
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No bookings for this date</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateBookings.map((booking: any) => {
                  const checkIn = parseISO(booking.check_in_date);
                  const checkOut = parseISO(booking.check_out_date);
                  const isArrival = isSameDay(checkIn, selectedDate);
                  const isDeparture = isSameDay(checkOut, selectedDate);
                  const isActive = selectedDate >= checkIn && selectedDate <= checkOut;

                  return (
                    <div
                      key={booking.id}
                      className="p-4 border-2 border-gray-200 rounded-lg !bg-gray-50 hover:!bg-gray-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{booking.guest_name}</p>
                          <p className="text-sm text-gray-500">{booking.booking_ref}</p>
                        </div>
                        <Badge className={STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}>
                          {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span>
                            {format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{booking.guests_count} guests</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">৳{booking.total_amount?.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Status indicators */}
                      <div className="mt-3 flex gap-2">
                        {isArrival && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Arriving
                          </Badge>
                        )}
                        {isDeparture && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Departing
                          </Badge>
                        )}
                        {isActive && !isArrival && !isDeparture && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            <Clock className="w-3 h-3 mr-1" />
                            Staying
                          </Badge>
                        )}
                        {booking.status === 'pending_payment' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Payment Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid md:grid-cols-4 gap-4">
        <Card className="!bg-white shadow-md border-2 border-gray-200">
          <CardContent className="pt-4 !bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-semibold">{bookings.length}</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-white shadow-md border-2 border-gray-200">
          <CardContent className="pt-4 !bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Stays</p>
                <p className="text-2xl font-semibold text-green-600">
                  {bookings.filter((b: any) => b.status === 'checked_in').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-white shadow-md border-2 border-gray-200">
          <CardContent className="pt-4 !bg-white">
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

        <Card className="!bg-white shadow-md border-2 border-gray-200">
          <CardContent className="pt-4 !bg-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Month Revenue</p>
                <p className="text-2xl font-semibold text-[#B5573E]">
                  ৳{bookings
                    .filter((b: any) => {
                      const checkIn = parseISO(b.check_in_date);
                      const now = new Date();
                      return checkIn.getMonth() === now.getMonth() && 
                             checkIn.getFullYear() === now.getFullYear() &&
                             ['confirmed', 'checked_in', 'checked_out'].includes(b.status);
                    })
                    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <Users className="w-8 h-8 text-[#B5573E]/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
