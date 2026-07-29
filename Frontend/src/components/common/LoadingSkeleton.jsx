import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-surface-charcoal border border-outline-variant p-6 clip-corner animate-shimmer flex flex-col justify-between h-64">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-3 w-16 bg-surface-bright rounded"></div>
          <div className="h-4 w-20 bg-surface-bright rounded"></div>
        </div>
        <div className="h-6 w-3/4 bg-surface-bright rounded mb-4"></div>
        <div className="space-y-2 mb-6">
          <div className="h-3 w-full bg-surface-bright rounded"></div>
          <div className="h-3 w-2/3 bg-surface-bright rounded"></div>
        </div>
      </div>
      <div className="h-10 w-full bg-surface-bright rounded"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-outline-variant/40 animate-shimmer">
      <td className="py-4 px-4"><div className="h-4 w-32 bg-surface-bright rounded"></div></td>
      <td className="py-4 px-4"><div className="h-4 w-24 bg-surface-bright rounded"></div></td>
      <td className="py-4 px-4"><div className="h-4 w-28 bg-surface-bright rounded"></div></td>
      <td className="py-4 px-4"><div className="h-4 w-16 bg-surface-bright rounded mx-auto"></div></td>
      <td className="py-4 px-4"><div className="h-6 w-12 bg-surface-bright rounded ml-auto"></div></td>
    </tr>
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-surface-charcoal border border-outline-variant p-4 clip-corner animate-shimmer">
      <div className="flex justify-between items-center mb-3">
        <div className="h-3 w-32 bg-surface-bright rounded"></div>
        <div className="h-4 w-20 bg-surface-bright rounded"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 bg-surface-bright rounded"></div>
          <div className="h-4 w-20 bg-surface-bright rounded"></div>
        </div>
        <div className="h-6 w-12 bg-surface-bright rounded"></div>
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="h-4 w-20 bg-surface-bright rounded"></div>
          <div className="w-8 h-8 bg-surface-bright rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  if (type === 'table') {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left">
          <tbody>
            {items.map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'match') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((_, i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
