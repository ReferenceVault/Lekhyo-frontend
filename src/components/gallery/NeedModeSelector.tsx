import { motion } from 'framer-motion';
import { Briefcase, Clock, TreePine, Users } from 'lucide-react';

const NEED_MODES = [
  {
    id: 'professional_short',
    label: 'Professional',
    sublabel: 'Short Stay',
    icon: Briefcase,
    description: 'Quick business stays with essential amenities'
  },
  {
    id: 'professional_long',
    label: 'Professional',
    sublabel: 'Long Term',
    icon: Clock,
    description: 'Extended stays with monthly rates'
  },
  {
    id: 'recreational',
    label: 'Recreational',
    sublabel: 'Leisure',
    icon: TreePine,
    description: 'Peaceful retreats and nature escapes'
  },
  {
    id: 'event',
    label: 'Event',
    sublabel: 'Social',
    icon: Users,
    description: 'Gatherings, meetings, and celebrations'
  },
];

interface NeedModeSelectorProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function NeedModeSelector({ selected, onSelect }: NeedModeSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {NEED_MODES.map((mode) => {
        const Icon = mode.icon;
        const isSelected = selected === mode.id;

        return (
          <motion.button
            key={mode.id}
            onClick={() => onSelect(mode.id)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`relative px-5 py-3 rounded-xl border transition-all ${
              isSelected
                ? 'bg-[#B5573E] border-[#B5573E] text-white shadow-lg shadow-[#B5573E]/20'
                : 'bg-white border-[#2C2C2C]/10 text-[#2C2C2C] hover:border-[#B5573E]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#B5573E]'}`} />
              <div className="text-left">
                <div className="text-sm font-medium">{mode.label}</div>
                <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-[#2C2C2C]/50'}`}>
                  {mode.sublabel}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
