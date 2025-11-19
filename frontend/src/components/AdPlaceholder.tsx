/**
 * Ad placeholder component for future Google AdSense integration.
 *
 * This component creates semantic containers where ad tags will be inserted.
 * DO NOT include actual AdSense code - these are placeholders only.
 */

import React from 'react';

interface AdPlaceholderProps {
  slot: string;
  size: 'leaderboard' | 'medium-rectangle' | 'large-rectangle' | 'skyscraper';
}

const adSizes = {
  'leaderboard': { width: '728px', height: '90px', className: 'w-full h-24' },
  'medium-rectangle': { width: '300px', height: '250px', className: 'w-full h-64' },
  'large-rectangle': { width: '336px', height: '280px', className: 'w-full h-72' },
  'skyscraper': { width: '160px', height: '600px', className: 'w-40 h-[600px]' },
};

export default function AdPlaceholder({ slot, size }: AdPlaceholderProps) {
  const adSize = adSizes[size];

  return (
    <div
      id={`ad-slot-${slot}`}
      className={`bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center ${adSize.className}`}
      data-ad-slot={slot}
      data-ad-size={size}
    >
      {/*
        Google AdSense code will be inserted here.
        Example structure:

        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"></ins>

        And call: (adsbygoogle = window.adsbygoogle || []).push({});
      */}
      <span className="text-gray-400 text-sm font-medium">Ad Space ({size})</span>
    </div>
  );
}
