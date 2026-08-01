import React from 'react';
import TactileButton from './TactileButton';

export default function EmptyState({ icon: Icon, title, desc, actionText, onAction }) {
  return (
    <div className="bg-surface-charcoal border border-outline-variant p-12 flex flex-col items-center justify-center gap-4 animate-fadeIn clip-corner-top">
      <div className="w-16 h-16 bg-surface-bright/50 border border-outline-variant flex items-center justify-center rounded-sm">
        <Icon size={28} className="text-tactical-gray" />
      </div>
      <h3 className="font-display text-lg text-off-white/80 uppercase mt-2">{title}</h3>
      <p className="font-body text-sm text-off-white/50 text-center max-w-sm mb-2">{desc}</p>
      
      {actionText && onAction && (
        <TactileButton 
          variant="outline"
          size="sm"
          onClick={onAction}
          className="mt-2"
        >
          {actionText}
        </TactileButton>
      )}
    </div>
  );
}
