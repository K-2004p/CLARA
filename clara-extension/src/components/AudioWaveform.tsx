import React from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
  isRecording: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording }) => {
  return (
    <div className="flex items-center gap-1 h-6 px-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
      <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse mr-1" />
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-rose-400 rounded-full"
          animate={{
            height: isRecording ? ['40%', '100%', '40%'] : '20%',
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          style={{ height: '20%' }}
        />
      ))}
    </div>
  );
};
