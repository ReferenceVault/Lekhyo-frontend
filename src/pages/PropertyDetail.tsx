import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Shield, Utensils, Users, Wifi, Car, TreePine,
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Heart, Share2, ArrowRight, Check, Info, Star, Lock
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

export default function PropertyDetail() {
  const [property, setProperty] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const [propertyData, roomsData, pricingData] = await Promise.all([
        base44.entities.Property.filter({ id: propertyId }),
        base44.entities.Room.filter({ property_id: propertyId, status: 'active' }),
        base44.entities.Pricing.filter({ property_id: propertyId, is_active: true }),
      ]);
      setProperty(propertyData[0]);
      setRooms(roomsData);
      setPricing(pricingData);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const photos = property?.photos || [];
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;

  // Get lowest social rate for display
  const lowestRate = pricing
    .filter((p: any) => p.tier === 'social')
    .reduce((min: number, p: any) => Math.min(min, p.base_rate), Infinity);

  const amenityIcons: any = {
    wifi: Wifi,
    parking: Car,
    garden: TreePine,
    default: Check,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="w-full h-[60vh] rounded-3xl mb-8" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-[#2C2C2C] mb-4">Property not found</h2>
          <Link to={createPageUrl('Home')}>
            <Button variant="outline">Back to Gallery</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 pb-20">
      {/* Hero Image Gallery */}
      <section className="relative h-[60vh] md:h-[70vh] z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={photos[currentImageIndex]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&q=80'}
            alt={property.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link to={createPageUrl('Home')}>
            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>

        {/* Image navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex((i) => (i + 1) % photos.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {photos.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Property title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-white/80" />
                  <span className="text-white/80 text-sm">
                    {property.location?.district || property.location?.region}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight">
                  {property.name}
                </h1>
              </div>
              {lowestRate < Infinity && (
                <div className="text-right hidden md:block">
                  <p className="text-white/60 text-sm">Starting from</p>
                  <p className="text-white text-2xl font-light">৳{lowestRate.toLocaleString()}<span className="text-sm">/night</span></p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 -mt-8 relative z-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Curator's Note */}
            {property.curator_note && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h2 className="text-xs uppercase tracking-wider text-[#B5573E] font-medium mb-4">
                  Curator's Note
                </h2>
                <p className="text-xl md:text-2xl font-light text-[#2C2C2C] italic leading-relaxed">
                  "{property.curator_note}"
                </p>
              </motion.section>
            )}

            {/* Legacy Story */}
            {property.legacy_story && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-lg font-medium text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-[#B5573E]" />
                  The Story
                </h2>
                <div className="prose prose-lg max-w-none text-[#2C2C2C]/80 font-light">
                  {property.legacy_story}
                </div>
              </motion.section>
            )}

            {/* Spaces / Rooms */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-6 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-[#B5573E]" />
                Spaces
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {rooms.map((room: any) => {
                  const roomPricing = pricing.find(
                    (p: any) => p.room_type === room.room_type && p.tier === 'social'
                  );
                  return (
                    <div
                      key={room.id}
                      className="border border-[#2C2C2C]/10 rounded-xl p-5 hover:border-[#B5573E]/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-[#2C2C2C]">{room.name}</h3>
                          <p className="text-sm text-[#2C2C2C]/60 capitalize">
                            {room.room_type.replace('_', ' ')} • Up to {room.capacity} guests
                          </p>
                        </div>
                        {roomPricing && (
                          <div className="text-right">
                            <p className="font-medium text-[#B5573E]">
                              ৳{roomPricing.base_rate.toLocaleString()}
                            </p>
                            <p className="text-xs text-[#2C2C2C]/50">per night</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {room.has_ac && (
                          <Badge variant="secondary" className="text-xs">AC</Badge>
                        )}
                        {room.has_attached_bath && (
                          <Badge variant="secondary" className="text-xs">Attached Bath</Badge>
                        )}
                        {room.features?.map((f: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {rooms.length === 0 && (
                  <p className="text-[#2C2C2C]/60 col-span-2">Room details coming soon</p>
                )}
              </div>
            </motion.section>

            {/* Canteen */}
            {property.canteen?.available && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-lg font-medium text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-[#B5573E]" />
                  <Utensils className="w-4 h-4 text-[#B5573E]" />
                  Canteen & Food
                </h2>
                <div className="bg-[#8B9D77]/10 rounded-xl p-6">
                  <p className="text-[#2C2C2C]/80 mb-4">
                    {property.canteen.description || 'Simple, healthy, local cuisine prepared fresh daily.'}
                  </p>
                  {property.canteen.meal_options?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {property.canteen.meal_options.map((meal: string, i: number) => (
                        <Badge key={i} className="bg-white text-[#2C2C2C]">{meal}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </motion.section>
            )}

            {/* Safety & Rules */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-[#B5573E]" />
                <Shield className="w-4 h-4 text-[#8B9D77]" />
                Safety & Rules
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">Safety Features</h4>
                  <ul className="space-y-2">
                    {property.safety_features?.has_gate && (
                      <li className="flex items-center gap-2 text-sm text-[#2C2C2C]/70">
                        <Check className="w-4 h-4 text-[#8B9D77]" /> Gated premises
                      </li>
                    )}
                    {property.safety_features?.has_cctv && (
                      <li className="flex items-center gap-2 text-sm text-[#2C2C2C]/70">
                        <Check className="w-4 h-4 text-[#8B9D77]" /> CCTV surveillance
                      </li>
                    )}
                    {property.safety_features?.has_guard && (
                      <li className="flex items-center gap-2 text-sm text-[#2C2C2C]/70">
                        <Check className="w-4 h-4 text-[#8B9D77]" /> Security guard
                      </li>
                    )}
                    {property.safety_features?.women_safety && (
                      <li className="flex items-center gap-2 text-sm text-[#2C2C2C]/70">
                        <Check className="w-4 h-4 text-[#8B9D77]" /> Women-safe certified
                      </li>
                    )}
                  </ul>
                </div>
                {property.rules?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[#2C2C2C] mb-3">House Rules</h4>
                    <ul className="space-y-2">
                      {property.rules.map((rule: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#2C2C2C]/70">
                          <Info className="w-4 h-4 text-[#B5573E] flex-shrink-0 mt-0.5" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Impact */}
            {property.impact_statement && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-[#B5573E]/5 rounded-xl p-6"
              >
                <h2 className="text-lg font-medium text-[#B5573E] mb-2">Your Impact</h2>
                <p className="text-[#2C2C2C]/80">{property.impact_statement}</p>
              </motion.section>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="sticky top-24 bg-white rounded-2xl p-6 shadow-xl border border-[#2C2C2C]/5 overflow-visible"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-[#2C2C2C]/60 mb-1">Starting from</p>
                <p className="text-3xl font-light text-[#2C2C2C]">
                  ৳{(lowestRate < Infinity ? lowestRate : 0).toLocaleString()}
                  <span className="text-base text-[#2C2C2C]/60">/night</span>
                </p>
              </div>

              {/* Date pickers */}
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-3">
                  <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start !bg-white !text-gray-900 border-gray-200 hover:border-gray-300">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#B5573E]" />
                        <span className="!text-gray-900">{checkIn ? format(checkIn, 'MMM d') : 'Check in'}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[102] !bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn || undefined}
                        onSelect={(date: Date | undefined) => {
                          setCheckIn(date || null);
                          if (!checkOut || (date && date >= checkOut)) {
                            setCheckOut(date ? addDays(date, 1) : null);
                          }
                          setCheckInOpen(false);
                        }}
                        disabled={(date: Date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start !bg-white !text-gray-900 border-gray-200 hover:border-gray-300">
                        <CalendarIcon className="w-4 h-4 mr-2 text-[#B5573E]" />
                        <span className="!text-gray-900">{checkOut ? format(checkOut, 'MMM d') : 'Check out'}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[102] !bg-white" align="end">
                      <Calendar
                        mode="single"
                        selected={checkOut || undefined}
                        onSelect={(date: Date | undefined) => {
                          setCheckOut(date || null);
                          setCheckOutOpen(false);
                        }}
                        disabled={(date: Date) => date <= (checkIn || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Guests */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B5573E]" />
                    <span className="text-sm">Guests</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{guests}</span>
                    <button
                      onClick={() => setGuests(Math.min(10, guests + 1))}
                      className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Price summary */}
              {nights > 0 && lowestRate < Infinity && (
                <div className="border-t pt-4 mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2C2C2C]/60">৳{lowestRate.toLocaleString()} × {nights} nights</span>
                    <span>৳{(lowestRate * nights).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2C2C2C]/60">VAT (15%)</span>
                    <span>৳{Math.round(lowestRate * nights * 0.15).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total</span>
                    <span>৳{Math.round(lowestRate * nights * 1.15).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Book button */}
              <Link
                to={`/checkout?property=${propertyId}&checkIn=${encodeURIComponent(checkIn?.toISOString() || '')}&checkOut=${encodeURIComponent(checkOut?.toISOString() || '')}&guests=${guests}`}
              >
                <Button
                  className="w-full bg-[#B5573E] hover:bg-[#9a4935] text-white py-6 text-lg group"
                  disabled={!checkIn || !checkOut}
                >
                  Hold the Legacy
                  <motion.span
                    className="ml-2 inline-block"
                    whileHover={{ x: 4 }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </Link>

              <p className="text-xs text-center text-[#2C2C2C]/50 mt-4">
                No payment required yet. You can review before confirming.
              </p>

              {/* Tier info */}
              <div className="mt-6 p-4 bg-[#F5F0E8] rounded-xl">
                <h4 className="text-xs uppercase tracking-wider text-[#2C2C2C]/60 mb-3">Available Rates</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70">Development</span>
                    <span className="text-[#8B9D77]">Partner rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70">Individual</span>
                    <span>Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#2C2C2C]/70">Corporate</span>
                    <span>Premium</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
