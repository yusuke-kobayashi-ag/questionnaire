'use client'

interface ComparisonSliderProps {
  optionA: string
  optionB: string
  value: number
  minValue: number
  maxValue: number
  onChange: (value: number) => void
}

export default function ComparisonSlider({ 
  optionA, 
  optionB, 
  value, 
  minValue, 
  maxValue, 
  onChange 
}: ComparisonSliderProps) {
  // 中央値を計算（より正確に）
  const centerValue = (minValue + maxValue) / 2
  
  // ラベル生成
  const getLabel = (val: number) => {
    // 中立の判定（小数点も考慮）
    if (Math.abs(val - centerValue) < 0.5) return '中立'
    if (val < centerValue) {
      const distance = centerValue - val
      const maxDistance = centerValue - minValue
      if (distance >= maxDistance * 0.8) return `最も${optionA}に近い`
      return `${optionA}に近い`
    } else {
      const distance = val - centerValue
      const maxDistance = maxValue - centerValue
      if (distance >= maxDistance * 0.8) return `最も${optionB}に近い`
      return `${optionB}に近い`
    }
  }

  return (
    <div className="space-y-6">
      {/* 選択肢の表示 */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="font-bold text-lg text-blue-600">{optionA}</div>
        </div>
        <div className="text-center text-gray-500 font-medium">VS</div>
        <div className="text-center">
          <div className="font-bold text-lg text-red-600">{optionB}</div>
        </div>
      </div>

      {/* スライダーセクション */}
      <div className="space-y-4">
        <div className="relative">
          {/* スライダー */}
          <input
            type="range"
            min={minValue}
            max={maxValue}
            step={1}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #d1d5db 48%, #d1d5db 52%, #ef4444 100%)`
            }}
          />
          
          {/* 中央のマーク */}
          <div 
            className="absolute top-0 w-0.5 h-4 bg-gray-800 pointer-events-none"
            style={{ 
              left: `${((centerValue - minValue) / (maxValue - minValue)) * 100}%`,
              transform: 'translateX(-50%) translateY(-4px)'
            }}
          />
          
          {/* 中央ラベル */}
          <div 
            className="absolute top-6 text-xs font-medium text-gray-800 pointer-events-none"
            style={{ 
              left: `${((centerValue - minValue) / (maxValue - minValue)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            0
          </div>
        </div>

        {/* スケールラベル */}
        <div className="flex justify-between text-xs text-gray-500">
          <div className="text-left">
            <div>最も{optionA}に近い</div>
            <div className="text-blue-600 font-medium">{minValue}</div>
          </div>
          <div className="text-center">
            <div>{optionA}に近い</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 font-medium">中立</div>
            <div className="text-gray-600">{centerValue}</div>
          </div>
          <div className="text-center">
            <div>{optionB}に近い</div>
          </div>
          <div className="text-right">
            <div>最も{optionB}に近い</div>
            <div className="text-red-600 font-medium">{maxValue}</div>
          </div>
        </div>
      </div>

      {/* 現在の選択表示 */}
      <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
        <div className="text-sm text-gray-600 mb-1">現在の選択</div>
        <div className="text-lg font-bold text-indigo-800">
          {getLabel(value)} ({value})
        </div>
      </div>


    </div>
  )
} 