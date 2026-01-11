import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { MapPin, Shield, Utensils, Star } from 'lucide-react';

export default function PropertyCard({ property, index = 0 }) {
  const mainPhoto = property.photos?.[0]?.url || 
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={createPageUrl(`PropertyDetail?id=${property.id}`)}>
        <motion.div 
          className="group cursor-pointer"
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3 }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
            <img
              src={mainPhoto}
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Floating badge */}
            {property.category_tags?.[0] && (
              <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-[#2C2C2C]">
                {property.category_tags[0].replace('_', ' ')}
              </div>
            )}

            {/* Location overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{property.location?.district || property.location?.region || 'Bangladesh'}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-1">
            <h3 className="text-lg font-medium text-[#2C2C2C] mb-2 group-hover:text-[#B5573E] transition-colors">
              {property.name}
            </h3>
            
            {property.curator_note && (
              <p className="text-sm text-[#2C2C2C]/60 line-clamp-2 mb-3 font-light italic">
                "{property.curator_note}"
              </p>
            )}

            {/* Features */}
            <div className="flex items-center gap-4 text-xs text-[#2C2C2C]/50">
              {property.safety_features?.women_safety && (
                <div className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#8B9D77]" />
                  <span>Women Safe</span>
                </div>
              )}
              {property.canteen?.available && (
                <div className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-[#B5573E]" />
                  <span>Canteen</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>{property.rooms_count || '?'} Rooms</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
