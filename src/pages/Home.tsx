import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import AICursor from '../components/gallery/AICursor';
import PropertyCard from '../components/gallery/PropertyCard';
import StoryMap from '../components/gallery/StoryMap';
import NeedModeSelector from '../components/gallery/NeedModeSelector';
import { Button } from '@/components/ui/button';
import { Map, Grid3X3, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Home() {
  const [showAI, setShowAI] = useState(true);
  const [vibeAnswers, setVibeAnswers] = useState<Record<string, string> | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or map
  const [needMode, setNeedMode] = useState('recreational');

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    if (vibeAnswers && properties.length > 0) {
      filterProperties();
    }
  }, [vibeAnswers, properties, needMode]);

  const loadProperties = async () => {
    try {
      const data = await base44.entities.Property.filter({ status: 'published' });
      setProperties(data);
      setFilteredProperties(data);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    // Filter by vibe answers
    if (vibeAnswers?.purpose) {
      const purposeMapping: Record<string, string[]> = {
        solitude: ['solitude', 'retreat', 'quiet'],
        work: ['professional', 'work', 'business'],
        legacy: ['heritage', 'history', 'legacy'],
        gathering: ['family', 'group', 'gathering'],
        event: ['event', 'conference', 'meeting'],
      };
      const tags = purposeMapping[vibeAnswers.purpose] || [];
      filtered = filtered.filter(p => 
        p.category_tags?.some((tag: string) => tags.includes(tag.toLowerCase())) || true
      );
    }

    if (vibeAnswers?.region && vibeAnswers.region !== 'any') {
      filtered = filtered.filter(p => {
        const region = p.location?.region?.toLowerCase() || '';
        return region.includes(vibeAnswers.region) || vibeAnswers.region === 'any';
      });
    }

    // Limit to 9 curated results
    setFilteredProperties(filtered.slice(0, 9));
  };

  const handleVibeComplete = (answers: Record<string, string>) => {
    setVibeAnswers(answers);
    setShowAI(false);
  };

  const skipAI = () => {
    setShowAI(false);
    setFilteredProperties(properties.slice(0, 9));
  };

  return (
    <div className="min-h-screen pt-16 overflow-hidden">
      {/* Hero with AI Cursor */}
      <AnimatePresence mode="wait">
        {showAI ? (
          <motion.section
            key="ai-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-8"
          >
            {/* Background texture */}
            <div className="fixed inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZGVmcz48cGF0dGVybiBpZD0idGV4dHVyZSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjAuNSIgZmlsbD0iIzJDMkMyQyIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3RleHR1cmUpIi8+PC9zdmc+')] opacity-50" />
            </div>

            <motion.h1 
              className="text-3xl md:text-5xl font-light text-[#2C2C2C] text-center mb-2 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-[#B5573E]">Lekhyo</span>
            </motion.h1>
            <motion.p 
              className="text-[#2C2C2C]/60 text-center mb-6 font-light max-w-md text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Curated spaces with stories. NGO guest houses reimagined.
            </motion.p>

            <div className="flex-1 flex items-center justify-center w-full">
              <AICursor onComplete={handleVibeComplete} isActive={showAI} />
            </div>

            <motion.button
              onClick={skipAI}
              className="mt-4 text-xs md:text-sm text-[#2C2C2C]/40 hover:text-[#B5573E] transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Skip and explore all spaces →
            </motion.button>
          </motion.section>
        ) : (
          <motion.section
            key="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-12"
          >
            {/* Results header */}
            <div className="max-w-6xl mx-auto mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                {vibeAnswers ? (
                  <>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B9D77]/10 rounded-full text-[#8B9D77] text-sm mb-4">
                      <Sparkles className="w-4 h-4" />
                      Matched to your vibe
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-[#2C2C2C]">
                      {filteredProperties.length} Spaces Revealed
                    </h2>
                  </>
                ) : (
                  <h2 className="text-3xl md:text-4xl font-light text-[#2C2C2C]">
                    Explore Our Spaces
                  </h2>
                )}
              </motion.div>

              {/* Need mode selector */}
              <div className="mb-8">
                <NeedModeSelector selected={needMode} onSelect={setNeedMode} />
              </div>

              {/* View toggle */}
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-[#B5573E] hover:bg-[#9a4935]' : ''}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Gallery
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className={viewMode === 'map' ? 'bg-[#B5573E] hover:bg-[#9a4935]' : ''}
                >
                  <Map className="w-4 h-4 mr-2" />
                  Story Map
                </Button>
              </div>
            </div>

            {/* Results */}
            <div className="max-w-6xl mx-auto">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[4/3] bg-[#2C2C2C]/5 rounded-2xl mb-4" />
                      <div className="h-5 bg-[#2C2C2C]/5 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-[#2C2C2C]/5 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : viewMode === 'map' ? (
                <StoryMap properties={filteredProperties} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProperties.map((property, idx) => (
                    <PropertyCard key={property.id} property={property} index={idx} />
                  ))}
                </div>
              )}

              {filteredProperties.length === 0 && !isLoading && (
                <motion.div 
                  className="text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-[#2C2C2C]/60 mb-4">No spaces match your current filters</p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setVibeAnswers(null);
                      setFilteredProperties(properties.slice(0, 9));
                    }}
                  >
                    Show all spaces
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Restart AI button */}
            <motion.div 
              className="text-center mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="ghost"
                onClick={() => setShowAI(true)}
                className="text-[#B5573E] hover:text-[#9a4935] hover:bg-[#B5573E]/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try AI Vibe Matching Again
              </Button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer area */}
      {!showAI && (
        <footer className="bg-[#2C2C2C] text-white py-16 mt-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-xl font-light mb-4">Lekhyo</h3>
                <p className="text-white/60 text-sm font-light">
                  Curated accommodations in NGO guest houses across Bangladesh. 
                  Every stay supports development programs.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-4">For NGOs</h4>
                <p className="text-white/60 text-sm font-light mb-4">
                  Transform your guest house into a mission-aligned profit center.
                </p>
                <Link to={createPageUrl('ManagementDashboard')}>
                  <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                    Partner With Us
                  </Button>
                </Link>
              </div>
              <div>
                <h4 className="font-medium mb-4">Our Promise</h4>
                <ul className="text-white/60 text-sm font-light space-y-2">
                  <li>✓ Mission-first booking priority</li>
                  <li>✓ Authentic local experiences</li>
                  <li>✓ Transparent impact tracking</li>
                  <li>✓ Women-safe accommodations</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-white/40 text-sm">
              © 2025 Lekhyo. All rights reserved.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
