import React, { useRef, useEffect } from 'react';
import { RoundResult } from '../types/yuki';

interface Props {
  rounds: RoundResult[];
}

interface LeftItem {
  winningNumber: number;
  size: 'small' | 'big';
  label?: string;
}

interface RightItem {
  color: 'red' | 'green' | 'blue';
  parity: 'odd' | 'even';
  label?: string;
}

/**
 * Exact historical base rounds from image_0757ea5d.png
 * Left Grid (លេខ / តូចធំ):
 * 15 columns matching the exact positions and streaks in the user's reference image
 */
const BASE_LEFT_ITEMS: LeftItem[] = [
  // Col 0: 8, 7 (Big, Big)
  { winningNumber: 8, size: 'big' },
  { winningNumber: 7, size: 'big' },
  // Col 1: 3 (Small)
  { winningNumber: 3, size: 'small' },
  // Col 2: 9 (Big)
  { winningNumber: 9, size: 'big' },
  // Col 3: 2, 3, 2, 3 (Small, Small, Small, Small)
  { winningNumber: 2, size: 'small' },
  { winningNumber: 3, size: 'small' },
  { winningNumber: 2, size: 'small' },
  { winningNumber: 3, size: 'small' },
  // Col 4: 10, 11 (Big, Big)
  { winningNumber: 10, size: 'big' },
  { winningNumber: 11, size: 'big' },
  // Col 5: 2 (Small)
  { winningNumber: 2, size: 'small' },
  // Col 6: 7, 7 (Big, Big)
  { winningNumber: 7, size: 'big' },
  { winningNumber: 7, size: 'big' },
  // Col 7: 5 (Small)
  { winningNumber: 5, size: 'small' },
  // Col 8: 11, 7, 7, 12 (Big, Big, Big, Big)
  { winningNumber: 11, size: 'big' },
  { winningNumber: 7, size: 'big' },
  { winningNumber: 7, size: 'big' },
  { winningNumber: 12, size: 'big' },
  // Col 9: 4 (Small)
  { winningNumber: 4, size: 'small' },
  // Col 10: 12 (Big)
  { winningNumber: 12, size: 'big' },
  // Col 11: 5, 6, 4, 1, 3 (Small, Small, Small, Small, Small)
  { winningNumber: 5, size: 'small' },
  { winningNumber: 6, size: 'small' },
  { winningNumber: 4, size: 'small' },
  { winningNumber: 1, size: 'small' },
  { winningNumber: 3, size: 'small' },
  // Col 12: 9 (Big)
  { winningNumber: 9, size: 'big' },
  // Col 13: 5, 1 (Small, Small)
  { winningNumber: 5, size: 'small' },
  { winningNumber: 1, size: 'small' },
  // Col 14: 8, 8 (Big, Big)
  { winningNumber: 8, size: 'big' },
  { winningNumber: 8, size: 'big' },
];

/**
 * Exact historical base rounds from image_0757ea5d.png
 * Right Grid (ពណ៌ / សេសគូ):
 * 15 columns matching the exact positions, colors, and parity letters (ស/គ)
 */
const BASE_RIGHT_ITEMS: RightItem[] = [
  // Col 0: Red គ
  { color: 'red', parity: 'even' },
  // Col 1: Green ស, Green គ
  { color: 'green', parity: 'odd' },
  { color: 'green', parity: 'even' },
  // Col 2: Red ស, Red ស
  { color: 'red', parity: 'odd' },
  { color: 'red', parity: 'odd' },
  // Col 3: Green ស, Green ស
  { color: 'green', parity: 'odd' },
  { color: 'green', parity: 'odd' },
  // Col 4: Red ស, Red ស
  { color: 'red', parity: 'odd' },
  { color: 'red', parity: 'odd' },
  // Col 5: Blue គ
  { color: 'blue', parity: 'even' },
  // Col 6: Red គ
  { color: 'red', parity: 'even' },
  // Col 7: Blue គ
  { color: 'blue', parity: 'even' },
  // Col 8: Green ស
  { color: 'green', parity: 'odd' },
  // Col 9: Blue គ
  { color: 'blue', parity: 'even' },
  // Col 10: Red គ, Red ស
  { color: 'red', parity: 'even' },
  { color: 'red', parity: 'odd' },
  // Col 11: Blue ស, Blue ស
  { color: 'blue', parity: 'odd' },
  { color: 'blue', parity: 'odd' },
  // Col 12: Green ស
  { color: 'green', parity: 'odd' },
  // Col 13: Red ស
  { color: 'red', parity: 'odd' },
  // Col 14: Green គ, Green គ
  { color: 'green', parity: 'even' },
  { color: 'green', parity: 'even' },
];

/**
 * Asian Casino Big Road placement algorithm
 * Places items down the column for consecutive matching streaks (up to 6 rows).
 * Dragon-tails right when hitting the bottom or an already occupied slot.
 * Starts a new column at row 0 when the streak switches.
 */
function buildBigRoadGrid<T>(
  items: T[],
  getKey: (item: T) => string,
  minCols: number = 24
): { grid: (T | null)[][]; totalCols: number } {
  const rows = 6;
  const grid: (T | null)[][] = Array.from({ length: rows }, () => []);

  let lastKey: string | null = null;
  let curCol = 0;
  let curRow = 0;
  let startColOfStreak = 0;
  let isTurningRight = false;

  items.forEach((item) => {
    const key = getKey(item);

    if (lastKey === null) {
      curCol = 0;
      curRow = 0;
      startColOfStreak = 0;
      isTurningRight = false;
      grid[curRow][curCol] = item;
      lastKey = key;
    } else if (key === lastKey) {
      // Continue streak
      if (!isTurningRight) {
        const nextRow = curRow + 1;
        if (nextRow < rows && !grid[nextRow][curCol]) {
          curRow = nextRow;
        } else {
          isTurningRight = true;
          curCol = curCol + 1;
        }
      } else {
        curCol = curCol + 1;
      }
      grid[curRow][curCol] = item;
    } else {
      // Streak changed, advance to next column at row 0
      startColOfStreak = startColOfStreak + 1;
      curCol = startColOfStreak;
      curRow = 0;
      isTurningRight = false;

      while (grid[0][curCol]) {
        curCol++;
        startColOfStreak = curCol;
      }
      grid[curRow][curCol] = item;
      lastKey = key;
    }
  });

  // Calculate maximum columns used (at least minCols to match grid paper layout)
  let maxCol = minCols;
  for (let r = 0; r < rows; r++) {
    if (grid[r].length > maxCol) {
      maxCol = grid[r].length;
    }
  }

  // Ensure uniform 2D array [6][maxCol]
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < maxCol; c++) {
      if (!grid[r][c]) {
        grid[r][c] = null;
      }
    }
  }

  return { grid, totalCols: maxCol };
}

export const Roadmaps: React.FC<Props> = ({ rounds }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // New rounds that occur after the base 30 rounds
  const newRounds = rounds.length > 30 ? rounds.slice(30) : [];

  // Combine base reference history with new live rounds for Left Grid
  const leftItems: LeftItem[] = [
    ...BASE_LEFT_ITEMS,
    ...newRounds.map((r) => ({
      winningNumber: r.winningNumber,
      size: r.size,
      label: `Round #${r.roundNumber}`,
    })),
  ];

  // Combine base reference history with new live rounds for Right Grid
  const rightItems: RightItem[] = [
    ...BASE_RIGHT_ITEMS,
    ...newRounds.map((r) => ({
      color: r.color,
      parity: r.parity,
      label: `Round #${r.roundNumber}`,
    })),
  ];

  // Compute live statistics for header summary badges
  const smallCount = leftItems.filter((i) => i.size === 'small').length;
  const bigCount = leftItems.filter((i) => i.size === 'big').length;
  const redCount = rightItems.filter((i) => i.color === 'red').length;
  const greenCount = rightItems.filter((i) => i.color === 'green').length;
  const blueCount = rightItems.filter((i) => i.color === 'blue').length;
  const oddCount = rightItems.filter((i) => i.parity === 'odd').length;
  const evenCount = rightItems.filter((i) => i.parity === 'even').length;
  const totalRoundsCount = leftItems.length;

  // Build the 6-row Big Road grids (at least 24 columns each to match reference image)
  const leftRoad = buildBigRoadGrid(leftItems, (i) => i.size, 24);
  const rightRoad = buildBigRoadGrid(rightItems, (i) => i.color, 24);

  // Auto-scroll to the right whenever a new round updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  }, [rounds.length]);

  return (
    <div className="w-full bg-white rounded-lg border-2 border-[#8ba3c7] shadow-md overflow-hidden flex flex-col shrink-0 static">
      {/* Top Header Bar with Live Stats & Auto-Update Indicator */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-[#d9e6f6] border-b-2 border-[#8ba3c7] text-xs sm:text-sm gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="font-black text-[#1e3a8a] text-sm sm:text-base tracking-wide"
            style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
          >
            តារាងប្រវត្តិលទ្ធផល (Roadmap History)
          </span>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            ស្វ័យប្រវត្ត (Auto-Updated Every Row)
          </span>

          <div className="flex items-center gap-1.5 text-xs font-bold flex-wrap">
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
              តូច: {smallCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-800 border border-pink-300">
              ធំ: {bigCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
              ក្រហម: {redCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-300">
              បៃតង: {greenCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-300">
              ខៀវ: {blueCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
              សេស: {oddCount}
            </span>
            <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
              គូ: {evenCount}
            </span>
          </div>
        </div>

        <div className="text-xs sm:text-sm text-slate-700 font-bold">
          សរុប: <span className="text-blue-900 font-black text-sm sm:text-base">{totalRoundsCount}</span> វេន
        </div>
      </div>

      {/* Main Roadmap Area (Enlarged cell size + exact image layout) */}
      <div ref={scrollRef} className="w-full bg-white overflow-x-auto select-none">
        <div className="min-w-[1100px] xl:min-w-full flex flex-col">
          {/* Subheader: លេខ / តូចធំ (Left) & ពណ៌ / សេសគូ (Right) */}
          <div className="grid grid-cols-2 bg-[#d9e6f6] border-b-2 border-[#8ba3c7] text-xs sm:text-sm font-black text-slate-800 text-center py-1.5">
            <div
              className="border-r-2 border-[#8ba3c7] tracking-wider"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              លេខ / តូចធំ
            </div>
            <div
              className="tracking-wider"
              style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
            >
              ពណ៌ / សេសគូ
            </div>
          </div>

          {/* 6-Row Grid Panels (Enlarged to 36px-38px cells with high-visibility balls) */}
          <div className="grid grid-cols-2 divide-x-2 divide-[#8ba3c7] bg-white">
            {/* Left Grid: លេខ / តូចធំ */}
            <div className="overflow-x-auto p-1.5 bg-white">
              <div
                className="grid grid-rows-6 gap-0 w-max mx-auto border-t border-l border-[#8ba3c7]"
                style={{
                  gridTemplateRows: 'repeat(6, 36px)',
                }}
              >
                {leftRoad.grid.map((rowArr, rowIdx) => (
                  <div key={`left-row-${rowIdx}`} className="flex">
                    {rowArr.map((item, colIdx) => (
                      <div
                        key={`left-cell-${rowIdx}-${colIdx}`}
                        className="w-[34px] sm:w-[38px] h-[36px] border-r border-b border-[#8ba3c7] bg-white flex items-center justify-center relative transition-colors hover:bg-blue-50/40"
                      >
                        {item ? (
                          <div
                            title={`លេខ ${item.winningNumber} (${item.size === 'small' ? 'តូច / Small' : 'ធំ / Big'})`}
                            style={{
                              fontSize: '20px',
                              fontFamily: 'Verdana',
                              borderRadius: '14.35544px',
                              borderWidth: '3px',
                              borderStyle: 'solid',
                            }}
                            className={`w-[28px] sm:w-[32px] h-[28px] sm:h-[32px] flex items-center justify-center font-black leading-none transition-transform hover:scale-115 cursor-pointer shadow-xs ${
                              item.size === 'small'
                                ? 'border-[#00b0ff] text-slate-900 bg-white'
                                : 'border-[#ec4899] text-slate-900 bg-white'
                            }`}
                          >
                            {item.winningNumber}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Grid: ពណ៌ / សេសគូ */}
            <div className="overflow-x-auto p-1.5 bg-white">
              <div
                className="grid grid-rows-6 gap-0 w-max mx-auto border-t border-l border-[#8ba3c7]"
                style={{
                  gridTemplateRows: 'repeat(6, 36px)',
                }}
              >
                {rightRoad.grid.map((rowArr, rowIdx) => (
                  <div key={`right-row-${rowIdx}`} className="flex">
                    {rowArr.map((item, colIdx) => (
                      <div
                        key={`right-cell-${rowIdx}-${colIdx}`}
                        className="w-[34px] sm:w-[38px] h-[36px] border-r border-b border-[#8ba3c7] bg-white flex items-center justify-center relative transition-colors hover:bg-blue-50/40"
                      >
                        {item ? (
                          <div
                            title={`${item.color === 'red' ? 'ក្រហម (Red)' : item.color === 'green' ? 'បៃតង (Green)' : 'ខៀវ (Blue)'} - ${item.parity === 'odd' ? 'សេស (Odd)' : 'គូ (Even)'}`}
                            className="w-[28px] sm:w-[32px] h-[28px] sm:h-[32px] rounded-full flex items-center justify-center font-black leading-none text-white shadow-xs transition-transform hover:scale-115 cursor-pointer"
                            style={{
                              fontSize: '19px',
                              backgroundColor:
                                item.color === 'red'
                                ? '#dc2626'
                                : item.color === 'green'
                                ? '#16a34a'
                                : '#1d4ed8',
                            }}
                          >
                            <span style={{ fontFamily: "'Kantumruy Pro', sans-serif", fontSize: '20px' }}>
                              {item.parity === 'odd' ? 'ស' : 'គ'}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
