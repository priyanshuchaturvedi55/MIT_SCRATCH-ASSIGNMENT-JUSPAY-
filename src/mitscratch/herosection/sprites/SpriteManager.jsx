import React, { useState, useRef, useCallback } from 'react';

const SpriteManager = () => {
  const [sprites, setSprites] = useState([
    {
      id: 1,
      name: 'Sprite1',
      x: 100,
      y: 100,
      rotation: 0,
      size: 50,
      color: 'bg-blue-500',
      blocks: [],
      isRunning: false,
      currentBlockIndex: 0,
      message: '',
      messageTimer: null
    }
  ]);
  
  const [selectedSpriteId, setSelectedSpriteId] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const executionTimers = useRef(new Map());
  const animationFrames = useRef(new Map());

  // Add new sprite
  const addSprite = () => {
    const newId = Math.max(...sprites.map(s => s.id)) + 1;
    const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const newSprite = {
      id: newId,
      name: `Sprite${newId}`,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 50,
      rotation: 0,
      size: 50,
      color: colors[Math.floor(Math.random() * colors.length)],
      blocks: [],
      isRunning: false,
      currentBlockIndex: 0,
      message: '',
      messageTimer: null
    };
    setSprites(prev => [...prev, newSprite]);
  };

  // Update sprite blocks
  const updateSpriteBlocks = (spriteId, blocks) => {
    setSprites(prev => prev.map(sprite => 
      sprite.id === spriteId ? { ...sprite, blocks } : sprite
    ));
  };

  // Update sprite position
  const updateSpritePosition = (spriteId, x, y) => {
    setSprites(prev => prev.map(sprite => 
      sprite.id === spriteId ? { ...sprite, x, y } : sprite
    ));
  };

  // Update sprite rotation
  const updateSpriteRotation = (spriteId, rotation) => {
    setSprites(prev => prev.map(sprite => 
      sprite.id === spriteId ? { ...sprite, rotation } : sprite
    ));
  };

  // Show sprite message
  const showSpriteMessage = (spriteId, message, duration = 2000) => {
    setSprites(prev => prev.map(sprite => {
      if (sprite.id === spriteId) {
        // Clear existing timer
        if (sprite.messageTimer) {
          clearTimeout(sprite.messageTimer);
        }
        
        const timer = setTimeout(() => {
          setSprites(current => current.map(s => 
            s.id === spriteId ? { ...s, message: '', messageTimer: null } : s
          ));
        }, duration);
        
        return { ...sprite, message, messageTimer: timer };
      }
      return sprite;
    }));
  };

  // Check collision between two sprites
  const checkCollision = (sprite1, sprite2) => {
    const distance = Math.sqrt(
      Math.pow(sprite1.x - sprite2.x, 2) + Math.pow(sprite1.y - sprite2.y, 2)
    );
    return distance < (sprite1.size + sprite2.size) / 2;
  };

  // Handle collision by swapping blocks
  const handleCollision = (sprite1Id, sprite2Id) => {
    setSprites(prev => prev.map(sprite => {
      if (sprite.id === sprite1Id) {
        const otherSprite = prev.find(s => s.id === sprite2Id);
        return { ...sprite, blocks: otherSprite.blocks };
      }
      if (sprite.id === sprite2Id) {
        const otherSprite = prev.find(s => s.id === sprite1Id);
        return { ...sprite, blocks: otherSprite.blocks };
      }
      return sprite;
    }));
  };

  // Execute a single block
  const executeBlock = useCallback((sprite, block) => {
  return new Promise((resolve) => {
    switch (block.type) {
      case 'move': {
        const steps = parseFloat(block.inputs?.steps) || 10;
        const radians = (sprite.rotation * Math.PI) / 180;
        const newX = sprite.x + Math.cos(radians) * steps;
        const newY = sprite.y + Math.sin(radians) * steps;
        updateSpritePosition(sprite.id, Math.max(0, Math.min(750, newX)), Math.max(0, Math.min(450, newY)));
        setTimeout(resolve, 500);
        break;
      }

      case 'turn': {
        const degrees = parseFloat(block.inputs?.degrees) || 15;
        updateSpriteRotation(sprite.id, sprite.rotation + degrees);
        setTimeout(resolve, 300);
        break;
      }

      case 'goto': {
        const gotoX = parseFloat(block.inputs?.x) || 0;
        const gotoY = parseFloat(block.inputs?.y) || 0;
        updateSpritePosition(sprite.id, gotoX, gotoY);
        setTimeout(resolve, 500);
        break;
      }

      case 'say': {
        const message = block.inputs?.message || 'Hello!';
        const duration = parseFloat(block.inputs?.duration || 2) * 1000;
        showSpriteMessage(sprite.id, message, duration);
        setTimeout(resolve, duration);
        break;
      }

      case 'think': {
        const message = block.inputs?.message || 'Hmm...';
        const duration = parseFloat(block.inputs?.duration || 2) * 1000;
        showSpriteMessage(sprite.id, `💭 ${message}`, duration);
        setTimeout(resolve, duration);
        break;
      }

      case 'repeat':
        // skip here — handled in executeSprite
        resolve();
        break;

      default:
        resolve();
    }
  });
}, []);


  // Execute all blocks for a sprite
  const executeSprite = useCallback(async (sprite) => {
    if (!sprite.blocks.length) return;

    setSprites(prev => prev.map(s => 
      s.id === sprite.id ? { ...s, isRunning: true, currentBlockIndex: 0 } : s
    ));

    for (let i = 0; i < sprite.blocks.length; i++) {
      const block = sprite.blocks[i];
      
      setSprites(prev => prev.map(s => 
        s.id === sprite.id ? { ...s, currentBlockIndex: i } : s
      ));

      if (block.type === 'repeat') {
        const repeatCount = parseInt(block.inputs?.times) || 1;

        // For simplicity, repeat the next block (if exists)
        if (i + 1 < sprite.blocks.length) {
          const nextBlock = sprite.blocks[i + 1];
          for (let r = 0; r < repeatCount; r++) {
            await executeBlock(sprite, nextBlock);
            
            // Check for collisions after each execution
            const currentSprite = sprites.find(s => s.id === sprite.id);
            if (currentSprite) {
              sprites.forEach(otherSprite => {
                if (otherSprite.id !== sprite.id && checkCollision(currentSprite, otherSprite)) {
                  handleCollision(sprite.id, otherSprite.id);
                }
              });
            }
          }
          i++; // Skip the next block as it was repeated
        }
      } else {
        await executeBlock(sprite, block);
        
        // Check for collisions after each block execution
        const currentSprite = sprites.find(s => s.id === sprite.id);
        if (currentSprite) {
          sprites.forEach(otherSprite => {
            if (otherSprite.id !== sprite.id && checkCollision(currentSprite, otherSprite)) {
              handleCollision(sprite.id, otherSprite.id);
            }
          });
        }
      }
    }

    setSprites(prev => prev.map(s => 
      s.id === sprite.id ? { ...s, isRunning: false, currentBlockIndex: -1 } : s
    ));
  }, [sprites, executeBlock]);

  // Play all sprites
  const playAll = () => {
    setIsPlaying(true);
    sprites.forEach(sprite => {
      if (sprite.blocks.length > 0) {
        executeSprite(sprite);
      }
    });
    
    // Auto-stop after all animations (rough estimate)
    setTimeout(() => {
      setIsPlaying(false);
    }, sprites.reduce((max, sprite) => Math.max(max, sprite.blocks.length * 1000), 3000));
  };

  // Stop all sprites
  const stopAll = () => {
    setIsPlaying(false);
    executionTimers.current.forEach(timer => clearTimeout(timer));
    animationFrames.current.forEach(frame => cancelAnimationFrame(frame));
    executionTimers.current.clear();
    animationFrames.current.clear();
    
    setSprites(prev => prev.map(sprite => ({
      ...sprite,
      isRunning: false,
      currentBlockIndex: -1,
      message: '',
      messageTimer: sprite.messageTimer ? clearTimeout(sprite.messageTimer) : null
    })));
  };

  return {
    sprites,
    selectedSpriteId,
    isPlaying,
    setSelectedSpriteId,
    addSprite,
    updateSpriteBlocks,
    playAll,
    stopAll
  };
};

export default SpriteManager;