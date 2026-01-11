import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Bangladesh regions with approximate positions
const REGIONS = {
  dhaka: { name: 'Dhaka Region', x: 52, y: 45 },
  sylhet: { name: 'Sylhet', x: 75, y: 30 },
  chittagong: { name: 'Chittagong', x: 80, y: 60 },
  cox: { name: "Cox's Bazar", x: 85, y: 75 },
  rajshahi: { name: 'Rajshahi', x: 25, y: 35 },
  khulna: { name: 'Khulna', x: 35, y: 65 },
  rangpur: { name: 'Rangpur', x: 30, y: 15 },
  barisal: { name: 'Barisal', x: 50, y: 70 },
};

export default function StoryMap({ properties }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  // Group properties by region
  const propertiesByRegion = properties.reduce((acc, prop) => {
    const region = prop.location?.region?.toLowerCase() || 'dhaka';
    if (!acc[region]) acc[region] = [];
    acc[region].push(prop);
    return acc;
  }, {});

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Map container */}
      <div className="relative aspect-[4/3] bg-[#F5F0E8] rounded-3xl overflow-hidden border border-[#2C2C2C]/10">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2C2C2C" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Region pins */}
        {Object.entries(REGIONS).map(([key, region]) => {
          const hasProperties = propertiesByRegion[key]?.length > 0;
          if (!hasProperties) return null;

          return (
            <motion.button
              key={key}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              whileHover={{ scale: 1.2 }}
              onClick={() => setSelectedRegion(selectedRegion === key ? null : key)}
            >
              <motion.div
                className={`relative ${selectedRegion === key ? 'z-20' : ''}`}
                animate={{
                  scale: selectedRegion === key ? 1.1 : 1,
                }}
              >
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#B5573E]"
                  animate={{
                    scale: [1, 1.5, 1.5],
                    opacity: [0.5, 0, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                
                {/* Pin */}
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center 
                  ${selectedRegion === key ? 'bg-[#B5573E]' : 'bg-white border-2 border-[#B5573E]'} 
                  shadow-lg`}>
                  <MapPin className={`w-5 h-5 ${selectedRegion === key ? 'text-white' : 'text-[#B5573E]'}`} />
                </div>

                {/* Count badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#8B9D77] text-white text-xs flex items-center justify-center font-medium">
                  {propertiesByRegion[key]?.length || 0}
                </div>
              </motion.div>
            </motion.button>
          );
        })}

        {/* Selected region popup */}
        <AnimatePresence>
          {selectedRegion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                       w-80 bg-white rounded-2xl shadow-2xl p-5 z-30"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-[#2C2C2C]">
                    {REGIONS[selectedRegion]?.name}
                  </h3>
                  <p className="text-sm text-[#2C2C2C]/60">
                    {propertiesByRegion[selectedRegion]?.length || 0} spaces available
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {propertiesByRegion[selectedRegion]?.map((property) => (
                  <Link 
                    key={property.id}
                    to={createPageUrl(`PropertyDetail?id=${property.id}`)}
                    className="block"
                  >
                    <motion.div
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F0E8] transition-colors"
                      whileHover={{ x: 4 }}
                      onHoverStart={() => setHoveredProperty(property.id)}
                      onHoverEnd={() => setHoveredProperty(null)}
                    >
                      <img 
                        src={property.photos?.[0]?.url || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200&q=80'}
                        alt={property.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#2C2C2C] truncate">
                          {property.name}
                        </h4>
                        <p className="text-xs text-[#2C2C2C]/60 line-clamp-2">
                          {property.curator_note || 'A space waiting to tell its story'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#B5573E] flex-shrink-0" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map label */}
        <div className="absolute bottom-4 left-4 text-xs text-[#2C2C2C]/40 font-light">
          Interactive Story Map of Bangladesh
        </div>
      </div>
    </div>
  );
}
