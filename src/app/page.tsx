"use client";

import { useState } from 'react';
import { redirect } from 'next/navigation';
import { version } from '@/package';

export default function RuincityLoginPage() {
  /**
   * Info: (20251027 - Luphia) 隨機使用背景
   * /covers/ruincity_01.png
   * /covers/ruincity_02.png
   * /covers/ruincity_03.png
   * /covers/ruincity_04.png
   * 手機直式畫面，背景圖置中顯示，覆蓋整個背景
   * 畫面中下方右側顯示「如茵城市」文字
   */
  const backgrounds = [
    '/covers/ruincity_01.png',
    '/covers/ruincity_02.png',
    '/covers/ruincity_03.png',
    '/covers/ruincity_04.png',
    '/covers/ruincity_04.png',
  ];
  const index = new Date().getDate() % backgrounds.length;
  const backgroundImage = backgrounds[index];

  const versionString = `v${version}`;
  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Blurred background image */}
      <div
        aria-hidden
        className="absolute inset-0 bg-center bg-cover transform-gpu filter blur-xs scale-105"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />


      {/* Dim overlay to increase contrast for text */}
      <div className="absolute inset-0 bg-black/45" />


      {/* Centered heading */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            Ruin City
          </h1>
          <p className="mt-4 text-white/90 text-lg sm:text-xl md:text-2xl font-medium">{versionString}</p>
        </div>
      </div>
    </main>
  );
}
