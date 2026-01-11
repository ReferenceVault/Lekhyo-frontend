import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VIBE_QUESTIONS = [
  {
    id: 'purpose',
    question: 'What brings you here?',
    options: [
      { value: 'solitude', label: 'Seeking Solitude', emoji: '🌿' },
      { value: 'work', label: 'Working Quietly', emoji: '💼' },
      { value: 'legacy', label: 'Tracing a Legacy', emoji: '🏛️' },
      { value: 'gathering', label: 'Gathering Family', emoji: '👨‍👩‍👧‍👦' },
      { value: 'event', label: 'Hosting an Event', emoji: '🎉' },
    ]
  },
  {
    id: 'duration',
    question: 'How long would you like to stay?',
    options: [
      { value: 'short', label: 'A few nights', emoji: '🌙' },
      { value: 'week', label: 'About a week', emoji: '📅' },
      { value: 'month', label: 'A month or longer', emoji: '🗓️' },
    ]
  },
  {
    id: 'vibe',
    question: 'What atmosphere calls to you?',
    options: [
      { value: 'heritage', label: 'Heritage & History', emoji: '🧱' },
      { value: 'nature', label: 'Gardens & Nature', emoji: '🌳' },
      { value: 'minimal', label: 'Simple & Clean', emoji: '✨' },
      { value: 'community', label: 'Warm Community', emoji: '🤝' },
    ]
  },
  {
    id: 'region',
    question: 'Any region calling you?',
    options: [
      { value: 'any', label: 'Surprise me', emoji: '🎲' },
      { value: 'sylhet', label: 'Tea Gardens of Sylhet', emoji: '🍵' },
      { value: 'cox', label: 'Cox\'s Bazar Coast', emoji: '🌊' },
      { value: 'rural', label: 'Rural Heartland', emoji: '🌾' },
      { value: 'dhaka', label: 'Near Dhaka', emoji: '🏙️' },
    ]
  }
];

interface AICursorProps {
  onComplete: (answers: Record<string, string>) => void;
  isActive?: boolean;
}

export default function AICursor({ onComplete, isActive = true }: AICursorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [state, setState] = useState('idle'); // idle, listening, thinking, revealing
  const [typedText, setTypedText] = useState('');

  const currentQuestion = VIBE_QUESTIONS[currentStep];

  useEffect(() => {
    if (isActive && currentQuestion) {
      setState('listening');
      // Typewriter effect
      const text = currentQuestion.question;
      let i = 0;
      setTypedText('');
      const interval = setInterval(() => {
        if (i < text.length) {
          setTypedText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [currentStep, isActive]);

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentStep < VIBE_QUESTIONS.length - 1) {
      setState('thinking');
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 500);
    } else {
      setState('revealing');
      setTimeout(() => {
        onComplete(newAnswers);
      }, 1000);
    }
  };

  if (!isActive) return null;

  return (
    <motion.div 
      className="flex flex-col items-center justify-center w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* AI Cursor orb */}
      <motion.div
        className={`w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 flex items-center justify-center ${
          state === 'revealing' ? 'bg-[#8B9D77]' : 'bg-[#B5573E]'
        }`}
        animate={{
          scale: state === 'thinking' ? [1, 1.1, 1] : 1,
          boxShadow: state === 'listening' 
            ? ['0 0 20px rgba(181, 87, 62, 0.3)', '0 0 40px rgba(181, 87, 62, 0.5)', '0 0 20px rgba(181, 87, 62, 0.3)']
            : '0 0 20px rgba(181, 87, 62, 0.3)'
        }}
        transition={{
          duration: 2,
          repeat: state === 'listening' ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        {state === 'thinking' || state === 'revealing' ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <motion.div
            className="w-3 h-3 rounded-full bg-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Progress dots */}
      <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-6">
        {VIBE_QUESTIONS.map((_, idx) => (
          <motion.div
            key={idx}
            className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${
              idx < currentStep ? 'bg-[#B5573E]' : 
              idx === currentStep ? 'bg-[#B5573E]/60' : 
              'bg-[#2C2C2C]/20'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        {state !== 'revealing' && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-lg mx-auto px-4"
          >
            <h2 className="text-xl md:text-2xl font-light text-[#2C2C2C] mb-4 md:mb-6 min-h-[60px] md:min-h-[70px] flex items-center justify-center">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-4 md:h-5 bg-[#B5573E] ml-1 align-middle"
              />
            </h2>

            {/* Options */}
            <motion.div 
              className="flex flex-wrap justify-center gap-2 md:gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {currentQuestion?.options.map((option, idx) => (
                <motion.button
                  key={option.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAnswer(option.value)}
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-white/80 backdrop-blur-sm border border-[#2C2C2C]/10 
                           rounded-full text-[#2C2C2C] hover:border-[#B5573E]/50 
                           hover:bg-white transition-all shadow-sm text-sm md:text-base"
                >
                  <span className="mr-1.5 md:mr-2">{option.emoji}</span>
                  {option.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}

        {state === 'revealing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-xl text-[#2C2C2C]/70 font-light">
              Revealing spaces that match your soul...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
