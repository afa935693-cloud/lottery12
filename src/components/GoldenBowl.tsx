import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimalCard } from '../types/yuki';
import { KHMER_NUM_WORDS } from '../utils/audio';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  isRevealing?: boolean;
  revealedAnimal?: AnimalCard | null;
  highlightedIndex?: number;
  bowlIndex?: number;
}

export const GoldenBowlGraphic: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  style?: React.CSSProperties;
}> = ({ size = 'md', pulse = false, style }) => {
  const dimensions =
    size === 'sm'
      ? 'w-[85px] h-[83px]'
      : size === 'md'
      ? 'w-14 h-14 sm:w-16 sm:h-16'
      : 'w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56';

  return (
    <div
      style={size === 'sm' ? { width: '85px', height: '83px', paddingLeft: '0px', ...style } : style}
      className={`relative ${dimensions} rounded-lg overflow-hidden flex items-center justify-center transition-transform duration-300 ${
        pulse ? 'animate-pulse scale-105' : 'hover:scale-105'
      }`}
    >
      <img
        src="/assets/aistudio/image_01283f85.png"
        alt="ថាសមាស"
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
  );
};

export const CenterGoldenArena: React.FC<{
  isRevealing: boolean;
  revealStep?: number;
  revealedAnimal: AnimalCard | null;
  eliminatedBowls?: AnimalCard[];
  activeRoundId: string;
  remainingSeconds: number;
}> = ({
  isRevealing,
  revealStep = 0,
  revealedAnimal,
  eliminatedBowls = [],
  activeRoundId,
  remainingSeconds,
}) => {
  return (
    <div className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 w-full h-full p-2 sm:p-2.5 bg-white rounded-xl border border-slate-300 shadow-sm select-none">
      {/* Top 11 Covered Golden Bowls Grid */}
      <div className="w-full flex flex-col items-center gap-1.5 sm:gap-2 pt-1">
        {/* Row 1: 6 Golden Bowls (Numbers 1–6) */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full flex-wrap">
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const isOpen = isRevealing && revealStep > idx;
            const isCurrentlyOpening = isRevealing && revealStep === idx + 1;
            const isNextInLine = isRevealing && revealStep === idx;
            const animal = eliminatedBowls[idx];

            return (
              <motion.div
                key={`bowl-row1-${idx}`}
                whileHover={{ y: -2, scale: 1.04 }}
                style={{ width: '85px', height: '83px', paddingLeft: '0px' }}
                className={`rounded-md sm:rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  isCurrentlyOpening
                    ? 'bg-white border-2 border-amber-400 ring-2 ring-amber-300 shadow-amber-200'
                    : isOpen
                    ? 'bg-slate-50 border-2 border-[#1976d2] shadow-xs'
                    : 'bg-transparent'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isOpen && animal ? (
                    <motion.div
                      key={`revealed-bowl-${idx}-${animal.number}`}
                      initial={{ scale: 0.3, rotateY: 90, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 220 }}
                      className="w-full h-full flex items-center justify-center p-0.5 relative overflow-hidden"
                    >
                      <img
                        src={animal.image}
                        alt={animal.khmerName}
                        className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                      />
                    </motion.div>
                  ) : (
                    <GoldenBowlGraphic
                      key={`closed-bowl-${idx}`}
                      size="sm"
                      pulse={isNextInLine}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: 5 Golden Bowls (Numbers 7–11) */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full flex-wrap">
          {[6, 7, 8, 9, 10].map((idx) => {
            const isOpen = isRevealing && revealStep > idx;
            const isCurrentlyOpening = isRevealing && revealStep === idx + 1;
            const isNextInLine = isRevealing && revealStep === idx;
            const animal = eliminatedBowls[idx];

            return (
              <motion.div
                key={`bowl-row2-${idx}`}
                whileHover={{ y: -2, scale: 1.04 }}
                style={{ width: '85px', height: '83px', paddingLeft: '0px' }}
                className={`rounded-md sm:rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                  isCurrentlyOpening
                    ? 'bg-white border-2 border-amber-400 ring-2 ring-amber-300 shadow-amber-200'
                    : isOpen
                    ? 'bg-slate-50 border-2 border-[#1976d2] shadow-xs'
                    : 'bg-transparent'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isOpen && animal ? (
                    <motion.div
                      key={`revealed-bowl-${idx}-${animal.number}`}
                      initial={{ scale: 0.3, rotateY: 90, opacity: 0 }}
                      animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 220 }}
                      className="w-full h-full flex items-center justify-center p-0.5 relative overflow-hidden"
                    >
                      <img
                        src={animal.image}
                        alt={animal.khmerName}
                        className="w-full h-full object-contain filter drop-shadow-md select-none pointer-events-none"
                      />
                    </motion.div>
                  ) : (
                    <GoldenBowlGraphic
                      key={`closed-bowl-${idx}`}
                      size="sm"
                      pulse={isNextInLine}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Row 3: Center Big Featured Bowl / Final Result Stage (Number 12) */}
      <div className="relative mt-1 mb-1 sm:mt-1.5 sm:mb-1.5 flex flex-col items-center justify-center">
        {/* Center Big Featured Bowl Container (outer outline removed, image kept) */}
        <div
          style={{ width: '191px', height: '178px' }}
          className={`flex items-center justify-center relative overflow-hidden shrink-0 transition-colors duration-300 ${
            revealStep === 11 ? 'animate-pulse' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            {revealedAnimal && isRevealing && revealStep >= 12 ? (
              <motion.div
                key="revealed-token"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 120 }}
                style={{
                  width: '167px',
                  height: '162px',
                  marginTop: '0px',
                  marginBottom: '0px',
                  marginLeft: '0px',
                  marginRight: '0px',
                  paddingTop: '3px',
                  paddingLeft: '3px',
                  paddingRight: '3px',
                  paddingBottom: '3px',
                }}
                className="flex items-center justify-center relative shrink-0 overflow-hidden"
              >
                {revealedAnimal.image ? (
                  <img
                    src={revealedAnimal.image}
                    alt={revealedAnimal.khmerName}
                    className="w-full h-full object-contain filter drop-shadow-xl select-none pointer-events-none"
                  />
                ) : (
                  <span className="text-7xl filter drop-shadow-md">
                    {revealedAnimal.iconSymbol}
                  </span>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="closed-bowl"
                initial={{ scale: 0.95 }}
                animate={{
                  scale: isRevealing && revealStep === 11 ? [1, 1.08, 1] : [1, 1.015, 1],
                  rotate: isRevealing && revealStep === 11 ? [0, 2, -2, 0] : [0, 0.5, -0.5, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isRevealing && revealStep === 11 ? 0.4 : 4,
                  ease: 'easeInOut',
                }}
                style={{
                  width: '167px',
                  height: '162px',
                  marginTop: '0px',
                  marginBottom: '0px',
                  marginLeft: '0px',
                  marginRight: '0px',
                  paddingTop: '3px',
                  paddingLeft: '3px',
                  paddingRight: '3px',
                  paddingBottom: '3px',
                }}
                className="flex items-center justify-center shrink-0 relative"
              >
                <img
                  src="/assets/aistudio/image_01283f85.png"
                  alt="គម្របថាសមាស"
                  className="w-full h-full object-contain rounded-xl select-none pointer-events-none drop-shadow-md"
                />
                {isRevealing && revealStep === 11 && (
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-xl animate-pulse flex items-center justify-center">
                    <span className="px-2 py-1 rounded bg-red-600 text-white text-xs font-black shadow-lg animate-bounce">
                      ត្រៀមបើក...!
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draw Status Indicator - Synced with Khmer voice figures */}
          {remainingSeconds <= 10 && !isRevealing && (
            <div className="absolute bottom-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-bounce shadow-md flex items-center gap-1.5">
              <span>ត្រៀមចេញលទ្ធផល</span>
              <span className="font-mono font-black bg-black/30 px-1.5 py-0.5 rounded text-[11px]">
                {remainingSeconds}
              </span>
              <span>«{KHMER_NUM_WORDS[remainingSeconds]?.khmer}»</span>
            </div>
          )}
        </div>

        {/* Caption & Sequence status */}
        <div className="mt-1 flex flex-col items-center gap-0.5 text-xs text-blue-900/80 font-bold">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isRevealing ? 'bg-amber-500 animate-ping' : 'bg-blue-600'
              }`}
            />
            <span>វេន (Round): {activeRoundId}</span>
          </div>

          {isRevealing && (
            <div className="text-[11px] font-black text-amber-600">
              {revealStep === 0 && 'កំពុងត្រៀមបើក...'}
              {revealStep >= 1 && revealStep <= 6 && `ជួរទី១: លេខ #${revealStep} (1,100ms)`}
              {revealStep >= 7 && revealStep <= 11 && `ជួរទី២: លេខ #${revealStep} (1,100ms)`}
              {revealStep === 12 && '★ លទ្ធផលឈ្នះចុងក្រោយ (បង្ហាញ 5 វិនាទី) ★'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
