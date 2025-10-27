'use client';

import { useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  PanInfo,
} from 'framer-motion';
import { cardData, CardEffect, Card, swipeCard } from '@/lib/repo/card';
import Image from 'next/image';

const SWIPE_THRESHOLD = 100;
const MAX_VISIBLE_CARDS = 3;

interface CardStackProps {
  onSwipe: (card: Card, direction: 'left' | 'right', isSuccess: boolean, effect: CardEffect) => void;
}

export default function CardStack({ onSwipe }: CardStackProps) {
  const [cards, setCards] = useState(cardData);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);

  const opacityRight = useTransform(x, [0, SWIPE_THRESHOLD * 0.75], [0, 1]);
  const opacityLeft = useTransform(x, [-SWIPE_THRESHOLD * 0.75, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
      const direction = info.offset.x > 0 ? 1 : -1;
      const swipeDir = direction > 0 ? 'right' : 'left';
      // 隨機判斷成功或失敗（70%成功）
      const isSuccess = Math.random() < 0.7;
      const swipedCard = cards[0];
      let effect;
      if (swipeDir === 'right') {
        effect = swipedCard.rightEffect;
      } else {
        effect = isSuccess ? swipedCard.leftEffect : swipedCard.leftEffect;
      }
      animate(x, direction * 500, {
        type: 'spring',
        stiffness: 500,
        damping: 30,
        onComplete: () => {
          setCards((prevCards) => {
            const remainingCards = swipeCard(swipedCard, swipeDir);
            return remainingCards;
          });
          // Info: (20251027 - Luphia) 回傳卡片、方向、成功與否、效果
          onSwipe(swipedCard, swipeDir, isSuccess, effect ?? {});
          x.set(0);
        },
      });
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  return (
    <div className="relative w-72 h-96 [perspective:1000px]">
      {cards
        .slice(0, MAX_VISIBLE_CARDS)
        .reverse()
        .map((card, index) => {
          const isTopCard = index === MAX_VISIBLE_CARDS - 1;

          return (
            <motion.div
              key={card.id}
              className="absolute w-full h-full [transform-style:preserve-3d]"
              style={{
                x: isTopCard ? x : 0,
                rotate: isTopCard ? rotate : 0,
              }}
              animate={{
                rotateY: isTopCard ? 0 : 180,
                scale: 1 - (MAX_VISIBLE_CARDS - 1 - index) * 0.05,
                y: (MAX_VISIBLE_CARDS - 1 - index) * 20,
                opacity: 1 - (MAX_VISIBLE_CARDS - 1 - index) * 0.1,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag={isTopCard ? 'x' : false}
              draggable={false}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={isTopCard ? handleDragEnd : undefined}
              whileTap={{ cursor: 'grabbing' }}
            >
              {/* Info: (20251027 - Luphia) 卡片正面 */}
              <div
                // Info: (20251027 - Luphia) rotateY 與上層父元素 rotateY 相同方向
                // Info: (20251027 - Luphia) --- 2. 修改：移除 flex items-center justify-center ---
                className={`absolute w-full h-full rounded-2xl shadow-xl p-4 select-none cursor-grab [backface-visibility:hidden] overflow-hidden ${isTopCard ? 'rotate-y-0' : 'rotate-y-180'}`}
                style={{
                  backgroundImage: `url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: '#ffeeddff',
                }}
              >
                {/* Info: (20251027 - Luphia) --- 3. 新增：左右提示訊息 --- */}
                {isTopCard && (
                  <>
                    {/* Info: (20251027 - Luphia) 右方訊息 (靠右對齊) */}
                    <motion.div
                      className="absolute top-4 right-4 z-10 px-4 py-2 rounded-lg bg-black/50 text-white font-bold"
                      style={{ opacity: opacityRight }}
                    >
                      {card.rightMessage}
                    </motion.div>

                    {/* Info: (20251027 - Luphia) 左方訊息 (靠左對齊) */}
                    <motion.div
                      className="absolute top-4 left-4 z-10 px-4 py-2 rounded-lg bg-black/50 text-white font-bold"
                      style={{ opacity: opacityLeft }}
                    >
                      {card.leftMessage}
                    </motion.div>
                  </>
                )}
                {/* Info: (20251027 - Luphia) --- 結束新增 --- */}

                {/* Info: (20251027 - Luphia) --- 4. 修改：將 h2 包裹起來以保持置中 --- */}
                <div className="w-full h-full flex items-center justify-center">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {card.description}
                  </h2>
                </div>
                {/* Info: (20251027 - Luphia) --- 結束修改 --- */}
              </div>

              {/* Info: (20251027 - Luphia) 卡片背面 */}
              <div
                // Info: (20251027 - Luphia) rotateY 與上層父元素 rotateY 相反方向
                className={`absolute w-full h-full rounded-2xl shadow-xl select-none [backface-visibility:hidden] overflow-hidden ${isTopCard ? 'rotate-y-180' : 'rotate-y-0'}`}
              >
                <Image
                  src="/card_back.png"
                  alt="Card Back"
                  fill
                  sizes="18rem"
                  className="object-cover"
                  draggable={false}
                  onDragEnd={undefined}
                />
              </div>
            </motion.div>
          );
        })}
    </div>
  );
}
