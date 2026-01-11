import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft, Save, Plus, Trash2, Upload, Sparkles,
  Loader2, Building2, Image, Shield, Utensils,
  Bed, DollarSign, X
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'solitude', label: 'Solitude & Retreat' },
  { value: 'professional', label: 'Professional' },
  { value: 'heritage', label: 'Heritage' },
  { value: 'nature', label: 'Nature' },
  { value: 'family', label: 'Family Gatherings' },
  { value: 'event', label: 'Events & Conferences' },
];

const ROOM_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'twin', label: 'Twin' },
  { value: 'suite', label: 'Suite' },
  { value: 'dormitory', label: 'Dormitory' },
  { value: 'hall', label: 'Conference Hall' },
];

const PRICING_TIERS = [
  { value: 'development', label: 'Development Rate', description: 'For NGO/development partners' },
  { value: 'social', label: 'Social/Individual', description: 'Standard public rate' },
  { value: 'corporate', label: 'Corporate', description: 'Business/corporate rate' },
];

export default function PropertyEditor() {
  const [property, setProperty] = useState<any>({
    name: '',
    location: { address: '', region: '', district: '', lat: null, lng: null },
    category_tags: [],
    curator_note: '',
    legacy_story: '',
    architecture_highlights: [],
    amenities: [],
    safety_features: { has_gate: false, has_cctv: false, has_guard: false, women_safety: false },
    photos: [],
    rules: [],
    canteen: { available: false, description: '', meal_options: [] },
    rooms_count: 0,
    mocat_required: false,
    mocat_reg_no: '',
    thana_name: '',
    impact_statement: '',
    status: 'draft',
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');
  const isEditMode = !!propertyId;

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    } else {
      setIsLoading(false);
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const [propertyData, roomsData, pricingData] = await Promise.all([
        base44.entities.Property.filter({ id: propertyId }),
        base44.entities.Room.filter({ property_id: propertyId }),
        base44.entities.Pricing.filter({ property_id: propertyId }),
      ]);
      if (propertyData[0]) {
        setProperty(propertyData[0]);
      }
      setRooms(roomsData);
      setPricing(pricingData);
    } catch (error) {
      console.error('Error loading property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let savedProperty: any;
      if (isEditMode) {
        savedProperty = await base44.entities.Property.update(propertyId!, property);
      } else {
        savedProperty = await base44.entities.Property.create(property);
      }

      // Save rooms
      for (const room of rooms) {
        if (room.id && (room.id as string).startsWith('new_')) {
          await base44.entities.Room.create({
            ...room,
            id: undefined,
            property_id: savedProperty.id || propertyId,
          });
        } else if (room.id) {
          await base44.entities.Room.update(room.id, room);
        }
      }

      // Save pricing
      for (const price of pricing) {
        if (price.id && (price.id as string).startsWith('new_')) {
          await base44.entities.Pricing.create({
            ...price,
            id: undefined,
            property_id: savedProperty.id || propertyId,
          });
        } else if (price.id) {
          await base44.entities.Pricing.update(price.id, price);
        }
      }

      window.location.href = createPageUrl('ManagementProperties');
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateStory = async () => {
    setIsGeneratingStory(true);
    try {
      const result: any = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a compelling, poetic legacy story for a boutique NGO guest house in Bangladesh with the following details:
          Name: ${property.name}
          Location: ${property.location?.region || property.location?.district}
          Category: ${property.category_tags?.join(', ')}
          
          The story should:
          1. Be around 150-200 words
          2. Reference the 1970s-1990s development era in Bangladesh
          3. Highlight architectural elements (terracotta, red brick, local craftsmanship)
          4. Evoke a sense of heritage and mission
          5. Be suitable for a luxury travel magazine
          
          Also generate:
          - A short curator's note (1-2 sentences, poetic)
          - 3 architecture highlights
          - An impact statement (1 sentence about what bookings fund)`,
        response_json_schema: {
          type: 'object',
          properties: {
            legacy_story: { type: 'string' },
            curator_note: { type: 'string' },
            architecture_highlights: { type: 'array', items: { type: 'string' } },
            impact_statement: { type: 'string' },
          },
        },
      });

      setProperty((prev: any) => ({
        ...prev,
        legacy_story: result.legacy_story,
        curator_note: result.curator_note,
        architecture_highlights: result.architecture_highlights,
        impact_statement: result.impact_statement,
      }));
    } catch (error) {
      console.error('Error generating story:', error);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const addRoom = () => {
    setRooms([...rooms, {
      id: `new_${Date.now()}`,
      property_id: propertyId,
      name: '',
      room_type: 'double',
      capacity: 2,
      has_ac: false,
      has_attached_bath: false,
      features: [],
      status: 'active',
    }]);
  };

  const updateRoom = (index: number, updates: any) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], ...updates };
    setRooms(updated);
  };

  const removeRoom = async (index: number) => {
    const room = rooms[index];
    if (room.id && !(room.id as string).startsWith('new_')) {
      await base44.entities.Room.delete(room.id);
    }
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const addPricing = () => {
    setPricing([...pricing, {
      id: `new_${Date.now()}`,
      property_id: propertyId,
      room_type: 'double',
      tier: 'social',
      rate_type: 'nightly',
      base_rate: 0,
      min_stay: 1,
      is_active: true,
    }]);
  };

  const updatePricing = (index: number, updates: any) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], ...updates };
    setPricing(updated);
  };

  const removePricing = async (index: number) => {
    const price = pricing[index];
    if (price.id && !(price.id as string).startsWith('new_')) {
      await base44.entities.Pricing.delete(price.id);
    }
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setProperty((prev: any) => ({
          ...prev,
          photos: [...(prev.photos || []), { url: file_url, caption: '', category: 'general' }],
        }));
      } catch (error) {
        console.error('Error uploading photo:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('ManagementProperties')}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-500 text-sm">
              {isEditMode ? property.name : 'Create a new listing'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant={property.status === 'published' ? 'default' : 'secondary'}>
            {property.status}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="basic">
            <Building2 className="w-4 h-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="story">
            <Sparkles className="w-4 h-4 mr-2" />
            Story
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <Bed className="w-4 h-4 mr-2" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="w-4 h-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Image className="w-4 h-4 mr-2" />
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Property Name *</Label>
                  <Input
                    value={property.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({ ...property, name: e.target.value })}
                    placeholder="e.g., BRAC Learning Centre Savar"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Region</Label>
                    <Input
                      value={property.location?.region || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({
                        ...property,
                        location: { ...property.location, region: e.target.value }
                      })}
                      placeholder="e.g., Dhaka Division"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input
                      value={property.location?.district || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({
                        ...property,
                        location: { ...property.location, district: e.target.value }
                      })}
                      placeholder="e.g., Savar"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Full Address</Label>
                  <Textarea
                    value={property.location?.address || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({
                      ...property,
                      location: { ...property.location, address: e.target.value }
                    })}
                    placeholder="Complete address..."
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Category Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {CATEGORY_OPTIONS.map(cat => (
                      <Badge
                        key={cat.value}
                        variant={property.category_tags?.includes(cat.value) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const tags = property.category_tags || [];
                          if (tags.includes(cat.value)) {
                            setProperty({ ...property, category_tags: tags.filter((t: string) => t !== cat.value) });
                          } else {
                            setProperty({ ...property, category_tags: [...tags, cat.value] });
                          }
                        }}
                      >
                        {cat.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Safety & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={property.safety_features?.has_gate}
                      onCheckedChange={(checked: boolean) => setProperty({
                        ...property,
                        safety_features: { ...property.safety_features, has_gate: checked }
                      })}
                    />
                    <Label>Gated premises</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={property.safety_features?.has_cctv}
                      onCheckedChange={(checked: boolean) => setProperty({
                        ...property,
                        safety_features: { ...property.safety_features, has_cctv: checked }
                      })}
                    />
                    <Label>CCTV surveillance</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={property.safety_features?.has_guard}
                      onCheckedChange={(checked: boolean) => setProperty({
                        ...property,
                        safety_features: { ...property.safety_features, has_guard: checked }
                      })}
                    />
                    <Label>Security guard</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={property.safety_features?.women_safety}
                      onCheckedChange={(checked: boolean) => setProperty({
                        ...property,
                        safety_features: { ...property.safety_features, women_safety: checked }
                      })}
                    />
                    <Label>Women-safe certified</Label>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Checkbox
                      checked={property.mocat_required}
                      onCheckedChange={(checked: boolean) => setProperty({
                        ...property,
                        mocat_required: checked
                      })}
                    />
                    <Label>MoCAT registration required (10+ rooms)</Label>
                  </div>
                  {property.mocat_required && (
                    <div>
                      <Label>MoCAT Registration Number</Label>
                      <Input
                        value={property.mocat_reg_no || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({ ...property, mocat_reg_no: e.target.value })}
                        placeholder="Enter registration number"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label>Thana Name (for police register)</Label>
                  <Input
                    value={property.thana_name || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({ ...property, thana_name: e.target.value })}
                    placeholder="e.g., Savar Thana"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Utensils className="w-4 h-4" />
                  Canteen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={property.canteen?.available}
                    onCheckedChange={(checked: boolean) => setProperty({
                      ...property,
                      canteen: { ...property.canteen, available: checked }
                    })}
                  />
                  <Label>Canteen/Food service available</Label>
                </div>

                {property.canteen?.available && (
                  <>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={property.canteen?.description || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({
                          ...property,
                          canteen: { ...property.canteen, description: e.target.value }
                        })}
                        placeholder="Describe the food service..."
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Meal Options (comma separated)</Label>
                      <Input
                        value={property.canteen?.meal_options?.join(', ') || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({
                          ...property,
                          canteen: {
                            ...property.canteen,
                            meal_options: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                          }
                        })}
                        placeholder="Breakfast, Lunch, Dinner"
                        className="mt-1"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="story">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Story & Narrative</CardTitle>
                <Button
                  variant="outline"
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory || !property.name}
                >
                  {isGeneratingStory ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  AI Generate Story
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Curator's Note</Label>
                <p className="text-xs text-gray-500 mb-2">A short, poetic description (1-2 sentences)</p>
                <Textarea
                  value={property.curator_note || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({ ...property, curator_note: e.target.value })}
                  placeholder="Where brick meets memory, and silence speaks of purpose..."
                  rows={2}
                />
              </div>

              <div>
                <Label>Legacy Story</Label>
                <p className="text-xs text-gray-500 mb-2">The full narrative of the property's history and mission</p>
                <Textarea
                  value={property.legacy_story || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({ ...property, legacy_story: e.target.value })}
                  placeholder="Write the legacy story..."
                  rows={8}
                />
              </div>

              <div>
                <Label>Architecture Highlights</Label>
                <p className="text-xs text-gray-500 mb-2">Notable architectural features</p>
                <Input
                  value={property.architecture_highlights?.join(', ') || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProperty({
                    ...property,
                    architecture_highlights: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  })}
                  placeholder="Red brick facade, Terracotta tiles, Open courtyard"
                />
              </div>

              <div>
                <Label>Impact Statement</Label>
                <p className="text-xs text-gray-500 mb-2">What do bookings fund?</p>
                <Textarea
                  value={property.impact_statement || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({ ...property, impact_statement: e.target.value })}
                  placeholder="Your stay funds 3 days of skills training for rural youth..."
                  rows={2}
                />
              </div>

              <div>
                <Label>House Rules (one per line)</Label>
                <Textarea
                  value={property.rules?.join('\n') || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProperty({
                    ...property,
                    rules: e.target.value.split('\n').filter(Boolean)
                  })}
                  placeholder="No smoking indoors&#10;Quiet hours after 10pm&#10;Guests must register at reception"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rooms">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Room Inventory</CardTitle>
                <Button onClick={addRoom}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No rooms added yet</p>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room: any, index: number) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Room {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRoom(index)}
                          className="text-red-500 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label>Room Name</Label>
                          <Input
                            value={room.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRoom(index, { name: e.target.value })}
                            placeholder="e.g., Room 101"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={room.room_type}
                            onValueChange={(v) => updateRoom(index, { room_type: v })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Capacity</Label>
                          <Input
                            type="number"
                            value={room.capacity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateRoom(index, { capacity: parseInt(e.target.value) })}
                            min={1}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex items-end gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={room.has_ac}
                              onCheckedChange={(checked: boolean) => updateRoom(index, { has_ac: checked })}
                            />
                            <Label className="text-sm">AC</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={room.has_attached_bath}
                              onCheckedChange={(checked: boolean) => updateRoom(index, { has_attached_bath: checked })}
                            />
                            <Label className="text-sm">Attached Bath</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Tiered Pricing</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Set rates for each room type and tier</p>
                </div>
                <Button onClick={addPricing}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pricing.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No pricing set yet</p>
              ) : (
                <div className="space-y-4">
                  {pricing.map((price: any, index: number) => (
                    <div key={price.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="capitalize">
                          {price.tier}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePricing(index)}
                          className="text-red-500 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <Label>Room Type</Label>
                          <Select
                            value={price.room_type}
                            onValueChange={(v) => updatePricing(index, { room_type: v })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tier</Label>
                          <Select
                            value={price.tier}
                            onValueChange={(v) => updatePricing(index, { tier: v })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PRICING_TIERS.map(tier => (
                                <SelectItem key={tier.value} value={tier.value}>
                                  {tier.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Rate (৳)</Label>
                          <Input
                            type="number"
                            value={price.base_rate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePricing(index, { base_rate: parseInt(e.target.value) })}
                            min={0}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Min Stay (nights)</Label>
                          <Input
                            type="number"
                            value={price.min_stay}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updatePricing(index, { min_stay: parseInt(e.target.value) })}
                            min={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-xl p-8 text-center mb-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload photos</p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                </label>
              </div>

              {property.photos?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {property.photos.map((photo: any, index: number) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setProperty({
                          ...property,
                          photos: property.photos.filter((_: any, i: number) => i !== index)
                        })}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t p-4 flex justify-end gap-3">
        <Link to={createPageUrl('ManagementProperties')}>
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={handleSave}
          disabled={isSaving || !property.name}
          className="bg-[#B5573E] hover:bg-[#9a4935]"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Property
        </Button>
      </div>
    </div>
  );
}
