import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, Search, MoreVertical, Edit, Eye, Trash2,
  MapPin, Bed, Calendar, AlertTriangle, CheckCircle
} from 'lucide-react';

const STATUS_BADGES: any = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  published: { label: 'Published', className: 'bg-green-100 text-green-700' },
  archived: { label: 'Archived', className: 'bg-red-100 text-red-700' },
};

export default function ManagementProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const propertiesData = await base44.entities.Property.list('-created_date');
      setProperties(propertiesData);

      // Load room counts
      const roomsData = await base44.entities.Room.list();
      const roomsByProperty: any = roomsData.reduce((acc: any, room: any) => {
        if (!acc[room.property_id]) acc[room.property_id] = [];
        acc[room.property_id].push(room);
        return acc;
      }, {});
      setRooms(roomsByProperty);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    try {
      await base44.entities.Property.update(propertyId, { status: newStatus });
      setProperties(properties.map((p: any) => 
        p.id === propertyId ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await base44.entities.Property.delete(propertyId);
      setProperties(properties.filter((p: any) => p.id !== propertyId));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const filteredProperties = properties.filter((p: any) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">{properties.length} total properties</p>
        </div>
        <Link to={createPageUrl('PropertyEditor')}>
          <Button className="bg-[#B5573E] hover:bg-[#9a4935] mt-4 md:mt-0">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Properties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property: any, idx: number) => {
          const propertyRooms = rooms[property.id] || [];
          const statusBadge = STATUS_BADGES[property.status] || STATUS_BADGES.draft;

          return (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-40">
                  <img
                    src={property.photos?.[0]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80'}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={statusBadge.className}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`PropertyEditor?id=${property.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)} target="_blank">
                            <Eye className="w-4 h-4 mr-2" />
                            View Public Page
                          </Link>
                        </DropdownMenuItem>
                        {property.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'published')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {property.status === 'published' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(property.id, 'archived')}>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(property.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4 bg-white">
                  <h3 className="font-semibold text-gray-900 mb-1">{property.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3" />
                    {property.location?.district || property.location?.region || 'Location not set'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {propertyRooms.length} rooms
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {property.rooms_count || 0} capacity
                    </span>
                  </div>

                  {/* Warnings */}
                  {property.mocat_required && !property.mocat_reg_no && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                      <AlertTriangle className="w-3 h-3" />
                      MoCAT registration required
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Link to={createPageUrl(`PropertyEditor?id=${property.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`PropertyCalendar?id=${property.id}`)} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Calendar className="w-3 h-3 mr-1" />
                        Calendar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">
            {searchQuery ? 'No properties match your search' : 'No properties yet'}
          </p>
          <Link to={createPageUrl('PropertyEditor')}>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Property
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
