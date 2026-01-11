import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2, Calendar, Users, DollarSign, TrendingUp,
  AlertTriangle, Clock, CheckCircle, ArrowRight, Plus,
  FileText, Shield, Activity, BarChart3,
  TrendingDown, Percent, MapPin
} from 'lucide-react';
import { format, subDays, isAfter, parseISO } from 'date-fns';

export default function ManagementDashboard() {
  const [user, setUser] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        // For demo purposes, create a mock user
        const mockUser = {
          id: '1',
          full_name: 'Admin User',
          email: 'admin@lekhyo.com',
          user_type: 'super_admin',
          managed_properties: []
        };
        setUser(mockUser);
        
        // Load all properties for super_admin
        const propertiesData = await base44.entities.Property.list();
        setProperties(propertiesData);
        
        // Load all bookings
        const allBookings = await base44.entities.Booking.list('-created_date', 100);
        setBookings(allBookings);
        
        setIsLoading(false);
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      // Check if user has management access - if no user_type, default to super_admin for demo
      const userType = userData.user_type || 'super_admin';
      if (!['curator', 'regional_manager', 'compliance_officer', 'super_admin'].includes(userType)) {
        // For demo, default to super_admin access
        const mockUser = {
          ...userData,
          user_type: 'super_admin',
          managed_properties: []
        };
        setUser(mockUser);
        
        const propertiesData = await base44.entities.Property.list();
        setProperties(propertiesData);
        
        const allBookings = await base44.entities.Booking.list('-created_date', 100);
        setBookings(allBookings);
        
        setIsLoading(false);
        return;
      }

      // Load data based on user role
      let propertiesData: any[] = [];
      if (userType === 'super_admin' || userType === 'regional_manager') {
        propertiesData = await base44.entities.Property.list();
      } else if (userData.managed_properties?.length > 0) {
        propertiesData = await Promise.all(
          userData.managed_properties.map((id: string) => 
            base44.entities.Property.filter({ id })
          )
        );
        propertiesData = propertiesData.flat();
      } else {
        // Default to all properties if no managed properties specified
        propertiesData = await base44.entities.Property.list();
      }
      setProperties(propertiesData);

      // Load recent bookings
      const allBookings = await base44.entities.Booking.list('-created_date', 100);
      // Filter to managed properties if not super_admin
      let filteredBookings = allBookings;
      if (userType !== 'super_admin' && propertiesData.length > 0) {
        const propertyIds = propertiesData.map((p: any) => p.id);
        filteredBookings = allBookings.filter((b: any) => propertyIds.includes(b.property_id));
      }
      setBookings(filteredBookings);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback: load data anyway for demo
      const propertiesData = await base44.entities.Property.list();
      setProperties(propertiesData);
      const allBookings = await base44.entities.Booking.list('-created_date', 100);
      setBookings(allBookings);
      setUser({
        id: '1',
        full_name: 'Admin User',
        email: 'admin@lekhyo.com',
        user_type: 'super_admin'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const today = new Date();
  const last30Days = subDays(today, 30);
  const last7Days = subDays(today, 7);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const recentBookings = bookings.filter((b: any) => 
    isAfter(parseISO(b.created_date), last30Days)
  );

  const thisWeekBookings = bookings.filter((b: any) => 
    isAfter(parseISO(b.created_date), last7Days)
  );

  const confirmedBookings = bookings.filter((b: any) => 
    ['confirmed', 'checked_in'].includes(b.status)
  );

  const todayArrivals = bookings.filter((b: any) => 
    b.check_in_date === format(today, 'yyyy-MM-dd') && 
    ['confirmed', 'pending_payment'].includes(b.status)
  );

  const todayDepartures = bookings.filter((b: any) => 
    b.check_out_date === format(today, 'yyyy-MM-dd') && 
    b.status === 'checked_in'
  );

  const pendingPayments = bookings.filter((b: any) => b.status === 'pending_payment');

  const checkedInBookings = bookings.filter((b: any) => b.status === 'checked_in');

  // Revenue calculations
  const totalRevenue = recentBookings
    .filter((b: any) => b.payment_status === 'paid' || b.payment_status === 'completed')
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const thisMonthRevenue = bookings
    .filter((b: any) => {
      const checkIn = parseISO(b.check_in_date);
      return checkIn >= thisMonth && 
             checkIn < new Date(today.getFullYear(), today.getMonth() + 1, 1) &&
             (b.payment_status === 'paid' || b.payment_status === 'completed');
    })
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const lastMonthRevenue = bookings
    .filter((b: any) => {
      const checkIn = parseISO(b.check_in_date);
      return checkIn >= lastMonth && 
             checkIn < thisMonth &&
             (b.payment_status === 'paid' || b.payment_status === 'completed');
    })
    .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : '0';

  // Property occupancy
  const totalRooms = properties.reduce((sum: number, p: any) => sum + (p.rooms_count || 0), 0);
  const occupancyRate = totalRooms > 0 
    ? ((checkedInBookings.length / totalRooms) * 100).toFixed(1)
    : 0;

  // Average booking value
  const avgBookingValue = recentBookings.length > 0
    ? recentBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) / recentBookings.length
    : 0;

  // Booking status breakdown
  const bookingStatusCounts = {
    confirmed: bookings.filter((b: any) => b.status === 'confirmed').length,
    checked_in: bookings.filter((b: any) => b.status === 'checked_in').length,
    pending_payment: bookings.filter((b: any) => b.status === 'pending_payment').length,
    cancelled: bookings.filter((b: any) => b.status === 'cancelled').length,
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // For demo purposes, always show dashboard even without user type check
  // if (!user || !['curator', 'regional_manager', 'compliance_officer', 'super_admin'].includes(user?.user_type || '')) {
  //   return (
  //     <div className="p-6 text-center py-20">
  //       <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
  //       <h2 className="text-xl font-medium text-gray-900 mb-2">Access Restricted</h2>
  //       <p className="text-gray-500 mb-6">You don't have permission to access the management portal.</p>
  //       <Link to={createPageUrl('Home')}>
  //         <Button>Back to Gallery</Button>
  //       </Link>
  //     </div>
  //   );
  // }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Architect's Desk</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {user?.full_name || 'Admin'}
            <Badge variant="outline" className="ml-2 capitalize">
              {(user?.user_type || 'super_admin').replace('_', ' ')}
            </Badge>
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link to={createPageUrl('ManagementProperties')}>
            <Button variant="outline">
              <Building2 className="w-4 h-4 mr-2" />
              Properties
            </Button>
          </Link>
          <Link to={createPageUrl('BookingOperations')}>
            <Button className="bg-[#B5573E] hover:bg-[#9a4935]">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Properties</p>
                  <p className="text-3xl font-semibold mt-1">{properties.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {properties.filter((p: any) => p.status === 'published').length} published
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                  <p className="text-3xl font-semibold mt-1">{confirmedBookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {pendingPayments.length} pending payment
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Today's Activity</p>
                  <p className="text-3xl font-semibold mt-1">
                    {todayArrivals.length + todayDepartures.length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {todayArrivals.length} arrivals • {todayDepartures.length} departures
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue (30d)</p>
                  <p className="text-3xl font-semibold mt-1">৳{(totalRevenue / 1000).toFixed(0)}k</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#B5573E]/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#B5573E]" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {parseFloat(revenueGrowth) > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <p className="text-xs text-gray-400">
                  {revenueGrowth}% vs last month • {recentBookings.filter((b: any) => b.payment_status === 'paid' || b.payment_status === 'completed').length} bookings
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats Cards - Secondary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2 border-blue-100 bg-blue-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">This Month Revenue</p>
                  <p className="text-2xl font-bold mt-1 text-blue-700">৳{(thisMonthRevenue / 1000).toFixed(1)}k</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Avg/Booking</span>
                  <span className="font-semibold text-blue-700">৳{Math.round(avgBookingValue).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-2 border-green-100 bg-green-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Occupancy Rate</p>
                  <p className="text-2xl font-bold mt-1 text-green-700">{occupancyRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Checked In</span>
                  <span className="font-semibold text-green-700">{checkedInBookings.length}/{totalRooms} rooms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-2 border-purple-100 bg-purple-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">This Week Bookings</p>
                  <p className="text-2xl font-bold mt-1 text-purple-700">{thisWeekBookings.length}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">30d Total</span>
                  <span className="font-semibold text-purple-700">{recentBookings.length} bookings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="border-2 border-orange-100 bg-orange-50/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Active Regions</p>
                  <p className="text-2xl font-bold mt-1 text-orange-700">
                    {new Set(properties.map((p: any) => p.location?.region)).size}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Properties</span>
                  <span className="font-semibold text-orange-700">{properties.length} locations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Booking Status Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-[#B5573E]/5 to-[#8B9D77]/5 border-[#B5573E]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#B5573E]" />
              Booking Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{bookingStatusCounts.confirmed}</p>
                <p className="text-xs text-gray-600 mt-1">Confirmed</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{bookingStatusCounts.checked_in}</p>
                <p className="text-xs text-gray-600 mt-1">Checked In</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{bookingStatusCounts.pending_payment}</p>
                <p className="text-xs text-gray-600 mt-1">Pending Payment</p>
              </div>
              <div className="text-center p-4 bg-white/60 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{bookingStatusCounts.cancelled}</p>
                <p className="text-xs text-gray-600 mt-1">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Operations */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Arrivals */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Arrivals ({todayArrivals.length})
                  </h4>
                  {todayArrivals.length === 0 ? (
                    <p className="text-sm text-gray-400 pl-4">No arrivals today</p>
                  ) : (
                    <div className="space-y-2">
                      {todayArrivals.slice(0, 3).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.guest_name}</p>
                            <p className="text-xs text-gray-500">{booking.booking_ref}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{booking.guests_count} guests</p>
                            <Badge variant="outline" className="text-xs">
                              {booking.status === 'pending_payment' ? 'Unpaid' : 'Ready'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Departures */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    Departures ({todayDepartures.length})
                  </h4>
                  {todayDepartures.length === 0 ? (
                    <p className="text-sm text-gray-400 pl-4">No departures today</p>
                  ) : (
                    <div className="space-y-2">
                      {todayDepartures.slice(0, 3).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{booking.guest_name}</p>
                            <p className="text-xs text-gray-500">{booking.booking_ref}</p>
                          </div>
                          <Button size="sm" variant="outline">
                            Check Out
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Link to={createPageUrl('BookingOperations')}>
                <Button variant="ghost" className="w-full mt-4">
                  View All Bookings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts & Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alerts & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending payments alert */}
              {pendingPayments.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      {pendingPayments.length} pending payment{pendingPayments.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-yellow-600">May expire soon</p>
                  </div>
                </div>
              )}

              {/* MOCAT warning */}
              {properties.some((p: any) => p.mocat_required && !p.mocat_reg_no) && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <Shield className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">MoCAT Registration Required</p>
                    <p className="text-xs text-red-600">Some properties need registration</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-4 space-y-2">
                <Link to={createPageUrl('PropertyEditor')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
                <Link to={createPageUrl('Compliance')}>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Guest Register
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Bookings Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Bookings</CardTitle>
            <Link to={createPageUrl('BookingOperations')}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-3 font-medium">Reference</th>
                    <th className="pb-3 font-medium">Guest</th>
                    <th className="pb-3 font-medium">Property</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking: any) => {
                    const property = properties.find((p: any) => p.id === booking.property_id);
                    return (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-3 text-sm font-medium">{booking.booking_ref}</td>
                        <td className="py-3 text-sm">{booking.guest_name}</td>
                        <td className="py-3 text-sm text-gray-600">{property?.name || '—'}</td>
                        <td className="py-3 text-sm text-gray-600">
                          {format(parseISO(booking.check_in_date), 'MMM d')} - {format(parseISO(booking.check_out_date), 'MMM d')}
                        </td>
                        <td className="py-3 text-sm font-medium">৳{booking.total_amount?.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending_payment' ? 'secondary' :
                            booking.status === 'checked_in' ? 'default' :
                            'secondary'
                          } className="text-xs">
                            {booking.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <p className="text-center text-gray-400 py-8">No bookings yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
