'use client';

// Info: (20251027 - Luphia) 單一長條圖的內部元件
interface StatBarProps {
  label: string;
  value: number;
  max: number;
}

function StatBar({ label, value, max }: StatBarProps) {
  const percentage = (value / max) * 100;

  // Info: (20251027 - Luphia) 根據百分比決定顏色
  let barColorClass = 'bg-green-500'; // Info: (20251027 - Luphia) 預設綠色
  if (percentage <= 30) {
    barColorClass = 'bg-red-500'; // Info: (20251027 - Luphia) 低于 30% 紅色
  } else if (percentage <= 50) {
    barColorClass = 'bg-yellow-500'; // Info: (20251027 - Luphia) 低于 50% 黃色
  }

  return (
    <div className="flex items-center space-x-2 text-white">
      {/* Info: (20251027 - Luphia) 標籤 */}
      <span className="text-sm font-medium w-12 text-right">{label}</span>

      {/* Info: (20251027 - Luphia) 長條圖背景 */}
      <div className="flex-1 bg-gray-600 rounded-full h-4 overflow-hidden relative">
        {/* Info: (20251027 - Luphia) 長條圖前景 (動態寬度與顏色) */}
        <div
          className={`h-4 rounded-full transition-all duration-300 ease-out ${barColorClass}`}
          style={{ width: `${percentage}%` }}
        />
        {/* Info: (20251027 - Luphia) 數值固定在背景 bar 最右側 */}
        <span
          className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-mono select-none"
          style={{ color: '#fff', textShadow: '0 0 2px #000' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// Info: (20251027 - Luphia)主要的 Dashboard 元件
interface SmallDashboardProps {
  credit: number;
  stamina: number;
  resources: number;
}

export default function SmallDashboard({
  credit,
  stamina,
  resources,
}: SmallDashboardProps) {
  const MAX_VALUE = 1000;

  return (
    // Info: (20251027 - Luphia) 為了和 CardStack (w-72) 對齊，這裡也使用 w-72
    <div className="w-72 p-4 bg-gray-800 rounded-lg shadow-md space-y-2">
      <StatBar label="信用" value={credit} max={MAX_VALUE} />
      <StatBar label="體力" value={stamina} max={MAX_VALUE} />
      <StatBar label="資源" value={resources} max={MAX_VALUE} />
    </div>
  );
}
