import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft, Calendar, Users, MapPin, Shield,
  CreditCard, Smartphone, Building2, Check, Loader2
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

export default function Checkout() {
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: details, 2: payment, 3: confirmation

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    pricing_tier: 'social',
    partner_code: '',
    special_requests: '',
    selected_room_id: '',
    add_ons: [] as string[],
  });

  const [paymentMethod, setPaymentMethod] = useState('bkash');

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('property');
  // Support both camelCase and kebab-case parameter names
  const checkInStr = urlParams.get('checkIn') || urlParams.get('check-in');
  const checkOutStr = urlParams.get('checkOut') || urlParams.get('check-out');
  const guestsCount = parseInt(urlParams.get('guests') || '2');

  // Fix malformed ISO dates (replace -t with T and -z with Z)
  const fixISODate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return dateStr.replace(/-t/i, 'T').replace(/-z$/i, 'Z');
  };

  const checkIn = checkInStr ? parseISO(fixISODate(checkInStr) || checkInStr) : null;
  const checkOut = checkOutStr ? parseISO(fixISODate(checkOutStr) || checkOutStr) : null;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  useEffect(() => {
    loadData();
  }, [propertyId]);

  const loadData = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          guest_name: userData.full_name || '',
          guest_email: userData.email || '',
          guest_phone: userData.phone || '',
        }));
      }

      if (propertyId) {
        const [propertyData, roomsData, pricingData] = await Promise.all([
          base44.entities.Property.filter({ id: propertyId }),
          base44.entities.Room.filter({ property_id: propertyId, status: 'active' }),
          base44.entities.Pricing.filter({ property_id: propertyId, is_active: true }),
        ]);
        setProperty(propertyData[0]);
        setRooms(roomsData);
        setPricing(pricingData);

        // Auto-select first suitable room
        if (roomsData.length > 0) {
          const suitableRoom = roomsData.find((r: any) => r.capacity >= guestsCount) || roomsData[0];
          setFormData(prev => ({ ...prev, selected_room_id: suitableRoom.id }));
        }
      }
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate pricing
  const selectedRoom = rooms.find((r: any) => r.id === formData.selected_room_id);
  const selectedPricing = pricing.find(
    (p: any) => p.room_type === selectedRoom?.room_type && p.tier === formData.pricing_tier
  );
  const baseAmount = selectedPricing ? selectedPricing.base_rate * nights : 0;
  const vatAmount = Math.round(baseAmount * 0.15);
  const totalAmount = baseAmount + vatAmount;

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.guest_name || !formData.guest_email || !formData.guest_phone) {
      alert('Please fill in all required guest information fields.');
      return;
    }

    if (!checkIn || !checkOut) {
      alert('Please select check-in and check-out dates.');
      return;
    }

    if (!formData.selected_room_id) {
      alert('Please select a room.');
      return;
    }

    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingRef = `LKY-${Date.now().toString(36).toUpperCase()}`;

      const booking = await base44.entities.Booking.create({
        booking_ref: bookingRef,
        guest_email: formData.guest_email,
        guest_name: formData.guest_name,
        guest_phone: formData.guest_phone,
        property_id: propertyId,
        room_ids: [formData.selected_room_id],
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        guests_count: guestsCount,
        pricing_tier: formData.pricing_tier,
        partner_code: formData.partner_code,
        status: 'pending_payment',
        base_amount: baseAmount,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        payment_status: 'pending',
        special_requests: formData.special_requests,
        impact_statement: property?.impact_statement,
      });

      // Simulate payment redirect (in real app, this would redirect to bKash/Nagad)
      setStep(3);

      // Mark as confirmed after "payment" (for demo)
      await base44.entities.Booking.update(booking.id, {
        status: 'confirmed',
        payment_status: 'completed',
        payment_reference: `PAY-${Date.now()}`,
        invoice_no: `INV-${bookingRef}`,
      });

    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred while processing your booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-[#F5F0E8]">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property || !checkIn || !checkOut) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <h2 className="text-2xl font-light text-[#2C2C2C] mb-4">Invalid booking details</h2>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline">Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Confirmation step
  if (step === 3) {
    return (
      <div className="min-h-screen pt-20 px-4 bg-[#F5F0E8]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg mx-auto text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-[#8B9D77] flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-light text-[#2C2C2C] mb-4">Legacy Held!</h1>
          <p className="text-[#2C2C2C]/70 mb-8">
            Your booking at {property.name} is confirmed.
          </p>

          <div className="bg-white rounded-2xl p-6 mb-8 text-left">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/60">Property</span>
                <span className="font-medium">{property.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/60">Dates</span>
                <span>{format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2C2C2C]/60">Guests</span>
                <span>{guestsCount}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-medium">
                <span>Total Paid</span>
                <span className="text-[#B5573E]">৳{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {property.impact_statement && (
            <div className="bg-[#B5573E]/10 rounded-xl p-4 mb-8">
              <p className="text-sm text-[#B5573E]">
                ✨ {property.impact_statement}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Link to={createPageUrl('GuestDashboard')}>
              <Button className="bg-[#B5573E] hover:bg-[#9a4935]">
                View My Bookings
              </Button>
            </Link>
            <Link to={createPageUrl('Home')}>
              <Button variant="outline">Explore More</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 bg-[#F5F0E8]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl(`PropertyDetail?id=${propertyId}`)} className="inline-flex items-center text-[#2C2C2C]/60 hover:text-[#B5573E] mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to property
          </Link>
          <h1 className="text-3xl font-light text-[#2C2C2C]">Complete Your Booking</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6"
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-6">Guest Details</h2>

              {!user && (
                <div className="bg-[#F5F0E8] rounded-xl p-4 mb-6">
                  <p className="text-sm text-[#2C2C2C]/70 mb-3">
                    Already have an account?
                  </p>
                  <Button variant="outline" size="sm" onClick={() => base44.auth.redirectToLogin(window.location.href)}>
                    Sign in to continue
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    placeholder="Enter your name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                    placeholder="your@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input
                    value={formData.guest_phone}
                    onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                    placeholder="+880 1XXX-XXXXXX"
                    className="mt-1"
                  />
                </div>
              </div>
            </motion.div>

            {/* Room Selection */}
            {rooms.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6"
              >
                <h2 className="text-lg font-medium text-[#2C2C2C] mb-6">Select Room</h2>
                <RadioGroup
                  value={formData.selected_room_id}
                  onValueChange={(v) => setFormData({ ...formData, selected_room_id: v })}
                >
                  <div className="space-y-3">
                    {rooms.map((room: any) => {
                      const roomPrice = pricing.find(
                        (p: any) => p.room_type === room.room_type && p.tier === formData.pricing_tier
                      );
                      return (
                        <label
                          key={room.id}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                            formData.selected_room_id === room.id
                              ? 'border-[#B5573E] bg-[#B5573E]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <RadioGroupItem value={room.id} />
                            <div>
                              <p className="font-medium">{room.name}</p>
                              <p className="text-sm text-[#2C2C2C]/60">
                                {room.room_type} • Up to {room.capacity} guests
                                {room.has_ac && ' • AC'}
                              </p>
                            </div>
                          </div>
                          {roomPrice && (
                            <p className="font-medium text-[#B5573E]">
                              ৳{roomPrice.base_rate.toLocaleString()}/night
                            </p>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {/* Pricing Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6"
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-6">Rate Type</h2>
              <RadioGroup
                value={formData.pricing_tier}
                onValueChange={(v) => setFormData({ ...formData, pricing_tier: v })}
              >
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer ${
                    formData.pricing_tier === 'social' ? 'border-[#B5573E] bg-[#B5573E]/5' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="social" />
                      <div>
                        <p className="font-medium">Individual / Social</p>
                        <p className="text-sm text-[#2C2C2C]/60">Standard rate for personal stays</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer ${
                    formData.pricing_tier === 'corporate' ? 'border-[#B5573E] bg-[#B5573E]/5' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="corporate" />
                      <div>
                        <p className="font-medium">Corporate</p>
                        <p className="text-sm text-[#2C2C2C]/60">Business trips with formal invoicing</p>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer ${
                    formData.pricing_tier === 'development' ? 'border-[#B5573E] bg-[#B5573E]/5' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value="development" />
                      <div>
                        <p className="font-medium">Development Partner</p>
                        <p className="text-sm text-[#8B9D77]">Subsidized rate for NGO/development workers</p>
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {formData.pricing_tier === 'development' && (
                <div className="mt-4">
                  <Label>Partner Code</Label>
                  <Input
                    value={formData.partner_code}
                    onChange={(e) => setFormData({ ...formData, partner_code: e.target.value })}
                    placeholder="Enter your partner code"
                    className="mt-1"
                  />
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6"
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-6">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${
                    paymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/5' : 'border-gray-200'
                  }`}>
                    <RadioGroupItem value="bkash" />
                    <div>
                      <p className="font-medium text-[#E2136E]">bKash</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${
                    paymentMethod === 'nagad' ? 'border-[#F6821F] bg-[#F6821F]/5' : 'border-gray-200'
                  }`}>
                    <RadioGroupItem value="nagad" />
                    <div>
                      <p className="font-medium text-[#F6821F]">Nagad</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${
                    paymentMethod === 'card' ? 'border-[#B5573E] bg-[#B5573E]/5' : 'border-gray-200'
                  }`}>
                    <RadioGroupItem value="card" />
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <p className="font-medium">Card</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer ${
                    paymentMethod === 'bank_transfer' ? 'border-[#B5573E] bg-[#B5573E]/5' : 'border-gray-200'
                  }`}>
                    <RadioGroupItem value="bank_transfer" />
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      <p className="font-medium">Bank</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </motion.div>

            {/* Special Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6"
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Special Requests</h2>
              <Textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                placeholder="Any special requirements or requests..."
                rows={3}
              />
            </motion.div>
          </div>

          {/* Summary sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 bg-white rounded-2xl p-6 shadow-lg"
            >
              {/* Property info */}
              <div className="flex gap-4 mb-6 pb-6 border-b">
                <img
                  src={property.photos?.[0]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&q=80'}
                  alt={property.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-[#2C2C2C]">{property.name}</h3>
                  <p className="text-sm text-[#2C2C2C]/60 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {property.location?.district}
                  </p>
                </div>
              </div>

              {/* Booking details */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-[#B5573E]" />
                  <span>{format(checkIn, 'MMM d')} - {format(checkOut, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-[#B5573E]" />
                  <span>{guestsCount} guests • {nights} nights</span>
                </div>
                {selectedRoom && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-[#B5573E]" />
                    <span>{selectedRoom.name}</span>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#2C2C2C]/60">
                    ৳{selectedPricing?.base_rate.toLocaleString() || '—'} × {nights} nights
                  </span>
                  <span>৳{baseAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#2C2C2C]/60">VAT (15%)</span>
                  <span>৳{vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t text-lg">
                  <span>Total</span>
                  <span className="text-[#B5573E]">৳{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.guest_name || !formData.guest_email || !formData.guest_phone}
                className="w-full bg-[#B5573E] hover:bg-[#9a4935] py-6 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Confirm & Pay ৳{totalAmount.toLocaleString()}</>
                )}
              </Button>

              <p className="text-xs text-center text-[#2C2C2C]/50 mt-4">
                By booking, you agree to our terms and cancellation policy
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
