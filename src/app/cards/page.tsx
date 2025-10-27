'use client';

import { useState } from 'react';
import CardStack from '@/components/card_stack';
import SmallDashboard from '@/components/small_dashboard';
import { Card } from '@/lib/repo/card';

// Info: (20251027 - Luphia) 狀態的型別
interface GameStats {
  credit: number;
  stamina: number;
  resources: number;
}

// Info: (20251027 - Luphia) 初始狀態
const INITIAL_STATS: GameStats = {
  credit: 600,
  stamina: 200,
  resources: 200,
};

const MAX_VALUE = 1000;
const MIN_VALUE = 0;

export default function GamePage() {
  const [stats, setStats] = useState(INITIAL_STATS);

  // Info: (20251027 - Luphia) 處理卡片滑動的函數
  const handleSwipe = (card: Card, direction: 'left' | 'right') => {
    const effect = direction === 'left' ? card.leftEffect : card.rightEffect;

    if (!effect) return; // Info: (20251027 - Luphia) 如果這張卡片在這個方向沒有效果，則不執行

    setStats((prevStats) => {
      // Info: (20251027 - Luphia) 輔助函數：計算新值並確保它在 0-1000 之間
      const clamp = (value: number) => Math.max(MIN_VALUE, Math.min(MAX_VALUE, value));
      const effectCredit = Array.isArray(effect.credit) ? effect.credit[0] + Math.floor(Math.random() * (effect.credit[1])) : 0;
      const effectStamina = Array.isArray(effect.stamina) ? effect.stamina[0] + Math.floor(Math.random() * (effect.stamina[1])) : 0;
      const effectResources = Array.isArray(effect.resources) ? effect.resources[0] + Math.floor(Math.random() * (effect.resources[1])) : 0;

      return {
        credit: clamp(prevStats.credit + effectCredit),
        stamina: clamp(prevStats.stamina + effectStamina),
        resources: clamp(prevStats.resources + effectResources),
      };
    });
  };

  return (
    // Info: (20251027 - Luphia) 將所有內容垂直排列並置中
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 space-y-4">

      {/* Info: (20251027 - Luphia) 儀表板：顯示當前狀態 */}
      <SmallDashboard
        credit={stats.credit}
        stamina={stats.stamina}
        resources={stats.resources}
      />

      {/* Info: (20251027 - Luphia) 卡牌堆：傳入 handleSwipe 函數 */}
      <CardStack onSwipe={handleSwipe} />

      {/* Info: (20251027 - Luphia) 遊戲結束的邏輯 */}
      {stats.credit <= 0 && <h1 className="text-red-500 text-3xl font-bold">信用破產！遊戲結束</h1>}
      {stats.stamina <= 0 && <h1 className="text-red-500 text-3xl font-bold">體力耗盡！遊戲結束</h1>}

    </div>
  );
}