import React, { useState, useEffect } from 'react';

const StagePanel = ({
  sprites,
  selectedSpriteId,
  onSpriteSelect,
  isPlaying,
  executionStep,
  currentExecutingSprite
}) => {
  const [animationStates, setAnimationStates] = useState({});

  useEffect(() => {
    if (currentExecutingSprite && executionStep) {
      setAnimationStates(prev => ({
        ...prev,
        [currentExecutingSprite.id]: {
          currentStep: executionStep,
          timestamp: Date.now()
        }
      }));
    }
  }, [currentExecutingSprite, executionStep]);

  const getCurrentBlock = (sprite) => {
    const animState = animationStates[sprite.id];
    if (!animState || !sprite.isRunning) return null;
    return animState.currentStep;
  };

  const getCommandText = (block) => {
    if (!block) return '';
    switch (block.type) {
      case 'move':
        return `Move ${block.inputs?.steps || 10} steps`;
      case 'turn':
        return `Turn ${block.inputs?.degrees || 15}°`;
      case 'say':
        return `Say "${block.inputs?.message || 'Hello!'}"`;
      case 'think':
        return `Think "${block.inputs?.message || 'Hmm...'}"`;
      case 'repeat':
        return `Repeat ${block.inputs?.times || 1} times`;
      case 'wait':
        return `Wait ${block.inputs?.seconds || 1}s`;
      case 'goto':
        return `Go to (${block.inputs?.x || 0}, ${block.inputs?.y || 0})`;
      default:
        return block.type || 'Unknown command';
    }
  };

  const getMovementTrail = (sprite) => {
    if (!Array.isArray(sprite.trail) || sprite.trail.length < 2) return null;

    const pathData = sprite.trail.reduce((path, point, index) => {
      const centerX = point.x + sprite.size / 2;
      const centerY = point.y + sprite.size / 2;
      return index === 0 ? `M ${centerX} ${centerY}` : `${path} L ${centerX} ${centerY}`;
    }, '');

    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <path
          d={pathData}
          stroke={sprite.color.replace('bg-', '').replace('-500', '')}
          strokeWidth="2"
          strokeOpacity="0.5"
          strokeDasharray="5,5"
          fill="none"
        />
      </svg>
    );
  };

  return (
    <div className="w-full h-96 bg-white border-2 border-gray-300 relative overflow-hidden rounded-lg">
      {isPlaying && (
        <div className="absolute top-2 left-20 bg-green-600 text-white px-2 py-1 rounded text-sm z-20 animate-pulse">
          ▶ Executing
        </div>
      )}

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          zIndex: 0
        }}
      />

      {sprites.map(sprite => getMovementTrail(sprite))}

      {sprites.map(sprite => {
        const currentBlock = getCurrentBlock(sprite);
        const isCurrentlyExecuting = currentExecutingSprite?.id === sprite.id;

        return (
          <div key={sprite.id} className="absolute" style={{ zIndex: 10 }}>
            <div
              className={`
                ${sprite.color}
                rounded-full
                cursor-pointer
                transition-all
                duration-300
                flex
                items-center
                justify-center
                text-white
                font-bold
                relative
                ${selectedSpriteId === sprite.id ? 'ring-4 ring-yellow-400' : ''}
                ${sprite.isRunning ? 'shadow-lg' : ''}
                ${isCurrentlyExecuting ? 'ring-2 ring-green-400 animate-pulse' : ''}
              `}
              style={{
                width: `${sprite.size}px`,
                height: `${sprite.size}px`,
                left: `${sprite.x}px`,
                top: `${sprite.y}px`,
                transform: `rotate(${sprite.rotation}deg)`,
                fontSize: '12px',
                zIndex: 15
              }}
              onClick={() => onSpriteSelect(sprite.id)}
            >
              {sprite.name[0]}

              {sprite.isRunning && (
                <div
                  className="absolute w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-white"
                  style={{
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }}
                />
              )}
            </div>

            {sprite.isRunning && currentBlock && (
              <div
                className="absolute bg-blue-600 text-white text-xs px-2 py-1 rounded-lg shadow-lg z-20 animate-bounce"
                style={{
                  left: `${sprite.x}px`,
                  top: `${sprite.y - 35}px`,
                  maxWidth: '180px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <div className="font-bold text-yellow-300">Executing:</div>
                <div>{getCommandText(currentBlock)}</div>
              </div>
            )}

            {sprite.message && (
              <div
                className="absolute bg-white border-2 border-gray-300 rounded-lg px-2 py-1 text-sm shadow-lg z-20"
                style={{
                  left: `${sprite.x + sprite.size + 10}px`,
                  top: `${sprite.y - 10}px`,
                  maxWidth: '150px',
                  wordWrap: 'break-word'
                }}
              >
                <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-white"></div>
                {sprite.message}
              </div>
            )}

            {sprite.isRunning && !currentBlock && (
              <div
                className="absolute bg-green-500 text-white text-xs px-2 py-1 rounded z-20"
                style={{
                  left: `${sprite.x}px`,
                  top: `${sprite.y - 25}px`
                }}
              >
                Running...
              </div>
            )}

            {sprite.isRunning && sprite.currentBlockIndex !== undefined && (
              <div
                className="absolute bg-purple-600 text-white text-xs px-1 py-0.5 rounded-full z-20"
                style={{
                  left: `${sprite.x + sprite.size + 8}px`,
                  top: `${sprite.y}px`
                }}
              >
                {sprite.currentBlockIndex + 1}/{sprite.blocks.length}
              </div>
            )}
          </div>
        );
      })}

      {isPlaying && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm z-20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-bold">Execution in Progress</span>
          </div>
          {currentExecutingSprite && (
            <div className="text-xs text-gray-300">
              Current: {currentExecutingSprite.name}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs z-20">
        <div>Click sprites to select • Drag blocks to workspace</div>
        {isPlaying && <div className="text-green-400">💡 Watch sprites execute commands step by step</div>}
      </div>
    </div>
  );
};

export default StagePanel;
