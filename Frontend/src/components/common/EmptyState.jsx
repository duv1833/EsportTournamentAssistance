import React from 'react';

export default function EmptyState({ icon: Icon, title, desc }) {
  return (
    <div className="bg-surface-charcoal border border-outline-variant p-12 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-surface-bright/50 border border-outline-variant flex items-center justify-center">
        <Icon size={28} className="text-tactical-gray" />
      </div>
      <h3 className="font-display text-lg text-off-white/60 uppercase">{title}</h3>
      <p className="font-body text-sm text-off-white/40 text-center max-w-sm">{desc}</p>
    </div>
  );
}
