import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {skeletons.map((_, index) => (
          <div key={index} className="bg-surface-charcoal border border-outline-variant p-6 clip-corner-top relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none"></div>
            <div className="h-4 bg-surface-bright w-1/3 mb-4 rounded-sm"></div>
            <div className="h-8 bg-surface-bright w-3/4 mb-4 rounded-sm"></div>
            <div className="h-20 bg-surface-bright w-full mb-6 rounded-sm"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-surface-bright w-1/4 rounded-sm"></div>
              <div className="h-8 bg-surface-bright w-1/4 rounded-sm"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-surface-charcoal border border-outline-variant overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none"></div>
        <div className="bg-surface-container-low px-6 py-4 flex justify-between items-center border-b border-outline-variant">
          <div className="h-6 bg-surface-bright w-1/4 rounded-sm"></div>
          <div className="h-4 bg-surface-bright w-1/6 rounded-sm"></div>
        </div>
        <div className="divide-y divide-outline-variant/30">
          {skeletons.map((_, index) => (
            <div key={index} className="px-6 py-4 flex justify-between items-center">
              <div className="h-4 bg-surface-bright w-1/3 rounded-sm"></div>
              <div className="h-4 bg-surface-bright w-1/6 rounded-sm"></div>
              <div className="h-4 bg-surface-bright w-1/5 rounded-sm"></div>
              <div className="h-4 bg-surface-bright w-1/12 rounded-sm"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (type === 'text') {
    return (
      <div className="flex flex-col gap-3 w-full relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-10 pointer-events-none"></div>
        {skeletons.map((_, index) => (
          <div key={index} className={`h-4 bg-surface-bright rounded-sm ${index % 3 === 2 ? 'w-2/3' : 'w-full'}`}></div>
        ))}
      </div>
    );
  }

  return null;
}
