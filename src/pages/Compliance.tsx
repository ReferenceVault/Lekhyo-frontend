import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText, Download, Calendar as CalendarIcon, Shield,
  AlertTriangle, Users, Building2, Loader2
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

export default function Compliance() {
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [guestRegisters, setGuestRegisters] = useState<any[]>([]);
  const [exports, setExports] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('register');
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propertiesData, bookingsData, registersData, exportsData] = await Promise.all([
        base44.entities.Property.list(),
        base44.entities.Booking.list('-created_date', 500),
        base44.entities.GuestRegister.list('-created_date', 500),
        base44.entities.ComplianceExport.list('-created_date', 50),
      ]);

      setProperties(propertiesData);
      setBookings(bookingsData);
      setGuestRegisters(registersData);
      setExports(exportsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data
  const filteredBookings = bookings.filter((b: any) => {
    const matchesProperty = selectedProperty === 'all' || b.property_id === selectedProperty;
    const checkIn = parseISO(b.check_in_date);
    const matchesDate = checkIn >= dateRange.from && checkIn <= dateRange.to;
    const matchesStatus = ['checked_in', 'checked_out'].includes(b.status);
    return matchesProperty && matchesDate && matchesStatus;
  });

  const filteredRegisters = guestRegisters.filter((r: any) => {
    const matchesProperty = selectedProperty === 'all' || r.property_id === selectedProperty;
    const checkIn = r.check_in_time ? parseISO(r.check_in_time) : new Date();
    const matchesDate = checkIn >= dateRange.from && checkIn <= dateRange.to;
    return matchesProperty && matchesDate;
  });

  // Calculate VAT
  const totalRevenue = filteredBookings.reduce((sum: number, b: any) => sum + (b.base_amount || 0), 0);
  const totalVAT = filteredBookings.reduce((sum: number, b: any) => sum + (b.vat_amount || 0), 0);
  const totalWithVAT = filteredBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

  const generateGuestRegisterExport = async () => {
    setIsExporting(true);
    try {
      // Generate CSV content
      const headers = [
        'Booking Ref', 'Guest Name', 'Father Name', 'Phone', 'ID Type', 
        'ID Number', 'Nationality', 'Permanent Address', 'Present Address',
        'Purpose', 'Coming From', 'Going To', 'Room', 'Check In', 'Check Out'
      ];

      const rows = filteredRegisters.map((r: any) => [
        bookings.find((b: any) => b.id === r.booking_id)?.booking_ref || '',
        r.guest_name,
        r.father_name || '',
        r.phone || '',
        r.id_type,
        r.id_number,
        r.nationality,
        r.permanent_address || '',
        r.present_address || '',
        r.purpose_of_visit || '',
        r.coming_from || '',
        r.going_to || '',
        r.room_number || '',
        r.check_in_time ? format(parseISO(r.check_in_time), 'yyyy-MM-dd HH:mm') : '',
        r.check_out_time ? format(parseISO(r.check_out_time), 'yyyy-MM-dd HH:mm') : '',
      ]);

      const csvContent = [headers, ...rows].map((row: any[]) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guest-register-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      // Log export
      await base44.entities.ComplianceExport.create({
        property_id: selectedProperty === 'all' ? 'all' : selectedProperty,
        export_type: 'guest_register',
        date_from: format(dateRange.from, 'yyyy-MM-dd'),
        date_to: format(dateRange.to, 'yyyy-MM-dd'),
        record_count: filteredRegisters.length,
      });

      loadData();
    } catch (error) {
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateVATReport = async () => {
    setIsExporting(true);
    try {
      const headers = [
        'Invoice No', 'Booking Ref', 'Guest Name', 'Property', 'Check In',
        'Check Out', 'Base Amount', 'VAT Amount', 'Total', 'Payment Status'
      ];

      const rows = filteredBookings.map((b: any) => {
        const property = properties.find((p: any) => p.id === b.property_id);
        return [
          b.invoice_no || '',
          b.booking_ref,
          b.guest_name,
          property?.name || '',
          b.check_in_date,
          b.check_out_date,
          b.base_amount || 0,
          b.vat_amount || 0,
          b.total_amount || 0,
          b.payment_status,
        ];
      });

      // Add summary row
      rows.push([]);
      rows.push(['', '', '', '', '', 'TOTALS:', totalRevenue, totalVAT, totalWithVAT, '']);

      const csvContent = [headers, ...rows].map((row: any[]) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vat-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();

      // Log export
      await base44.entities.ComplianceExport.create({
        property_id: selectedProperty === 'all' ? 'all' : selectedProperty,
        export_type: 'vat_report',
        date_from: format(dateRange.from, 'yyyy-MM-dd'),
        date_to: format(dateRange.to, 'yyyy-MM-dd'),
        record_count: filteredBookings.length,
      });

      loadData();
    } catch (error) {
      console.error('Error exporting VAT report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  // Check for compliance issues
  const propertiesNeedingMOCAT = properties.filter((p: any) => p.mocat_required && !p.mocat_reg_no);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Compliance & Reports</h1>
          <p className="text-gray-500 mt-1">Guest register, VAT reporting, and audit logs</p>
        </div>
      </div>

      {/* Alerts */}
      {propertiesNeedingMOCAT.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800">MoCAT Registration Required</p>
                <p className="text-sm text-orange-700 mt-1">
                  {propertiesNeedingMOCAT.length} propert{propertiesNeedingMOCAT.length > 1 ? 'ies need' : 'y needs'} MoCAT registration:
                  {propertiesNeedingMOCAT.map((p: any) => p.name).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Guests</p>
                <p className="text-2xl font-semibold">{filteredRegisters.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue (excl. VAT)</p>
                <p className="text-2xl font-semibold">৳{(totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <Building2 className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">VAT Collected</p>
                <p className="text-2xl font-semibold">৳{(totalVAT / 1000).toFixed(1)}k</p>
              </div>
              <Shield className="w-8 h-8 text-[#B5573E]/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Exports Generated</p>
                <p className="text-2xl font-semibold">{exports.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-2 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="w-full h-10 !bg-white border-gray-200 hover:border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select property" className="text-gray-900">
                    {selectedProperty === 'all' 
                      ? 'All Properties' 
                      : properties.find((p: any) => p.id === selectedProperty)?.name || 'All Properties'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-[102] max-h-[300px] !bg-white">
                  <SelectItem value="all" className="text-gray-900">All Properties</SelectItem>
                  {properties.map((p: any) => (
                    <SelectItem key={p.id} value={p.id} className="text-gray-900">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Date Range</Label>
              <div className="flex items-center gap-3">
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 flex-1 justify-start !bg-white border-gray-200 hover:border-gray-300 !text-gray-900"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm !text-gray-900 font-medium">{format(dateRange.from, 'MMM d, yyyy')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[102] !bg-white">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setDateRange({ ...dateRange, from: date });
                          setFromDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-gray-500 font-medium">to</span>
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-10 flex-1 justify-start !bg-white border-gray-200 hover:border-gray-300 !text-gray-900"
                    >
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-sm !text-gray-900 font-medium">{format(dateRange.to, 'MMM d, yyyy')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[102] !bg-white">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setDateRange({ ...dateRange, to: date });
                          setToDateOpen(false);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="register">Guest Register</TabsTrigger>
          <TabsTrigger value="vat">VAT Report</TabsTrigger>
          <TabsTrigger value="exports">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="register">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Guest Register</CardTitle>
              <Button onClick={generateGuestRegisterExport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>ID Type</TableHead>
                      <TableHead>ID Number</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Purpose</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegisters.slice(0, 20).map((register: any) => (
                      <TableRow key={register.id}>
                        <TableCell className="font-medium">{register.guest_name}</TableCell>
                        <TableCell className="uppercase text-xs">{register.id_type}</TableCell>
                        <TableCell>{register.id_number}</TableCell>
                        <TableCell>{register.phone || '—'}</TableCell>
                        <TableCell>{register.room_number || '—'}</TableCell>
                        <TableCell>
                          {register.check_in_time 
                            ? format(parseISO(register.check_in_time), 'MMM d, HH:mm') 
                            : '—'}
                        </TableCell>
                        <TableCell>{register.purpose_of_visit || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredRegisters.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No guest records found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">VAT Report</CardTitle>
              <Button onClick={generateVATReport} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export VAT Report
              </Button>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Base Revenue</p>
                  <p className="text-xl font-semibold">৳{totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">VAT (15%)</p>
                  <p className="text-xl font-semibold">৳{totalVAT.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-xl font-semibold text-[#B5573E]">৳{totalWithVAT.toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Base</TableHead>
                      <TableHead className="text-right">VAT</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.slice(0, 20).map((booking: any) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono text-xs">
                          {booking.invoice_no || '—'}
                        </TableCell>
                        <TableCell>{booking.booking_ref}</TableCell>
                        <TableCell>{booking.guest_name}</TableCell>
                        <TableCell className="text-sm">
                          {format(parseISO(booking.check_in_date), 'MMM d')} - {format(parseISO(booking.check_out_date), 'MMM d')}
                        </TableCell>
                        <TableCell className="text-right">৳{booking.base_amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-right">৳{booking.vat_amount?.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-medium">৳{booking.total_amount?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredBookings.length === 0 && (
                  <p className="text-center text-gray-400 py-8">No bookings found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Export History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Exported</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.map((exp: any) => {
                    const property = properties.find((p: any) => p.id === exp.property_id);
                    return (
                      <TableRow key={exp.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {exp.export_type?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{property?.name || 'All Properties'}</TableCell>
                        <TableCell className="text-sm">
                          {exp.date_from} — {exp.date_to}
                        </TableCell>
                        <TableCell>{exp.record_count}</TableCell>
                        <TableCell className="text-sm">
                          {exp.created_date ? format(parseISO(exp.created_date), 'MMM d, HH:mm') : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {exp.exported_by || exp.created_by || '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {exports.length === 0 && (
                <p className="text-center text-gray-400 py-8">No exports yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
