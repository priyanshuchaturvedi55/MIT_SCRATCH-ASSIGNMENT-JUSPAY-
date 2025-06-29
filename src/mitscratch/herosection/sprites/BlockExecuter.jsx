// Enhanced block execution utilities
export class BlockExecutor {
  constructor(updateSpritePosition, updateSpriteRotation, showSpriteMessage, checkCollisions) {
    this.updateSpritePosition = updateSpritePosition;
    this.updateSpriteRotation = updateSpriteRotation;
    this.showSpriteMessage = showSpriteMessage;
    this.checkCollisions = checkCollisions;
    this.executionQueue = new Map();
    this.animationSpeed = 1; // Speed multiplier
  }

  // Set animation speed (0.5 = half speed, 2 = double speed)
  setSpeed(speed) {
    this.animationSpeed = Math.max(0.1, Math.min(5, speed));
  }

  // Execute a single block with enhanced animations
  async executeBlock(sprite, block, context = {}) {
    const duration = (context.duration || 500) / this.animationSpeed;
    
    switch (block.type) {
      case 'move':
        return await this.executeMoveBlock(sprite, block, duration);
      
      case 'turn':
        return await this.executeTurnBlock(sprite, block, duration);
      
      case 'goto':
        return await this.executeGotoBlock(sprite, block, duration);
      
      case 'say':
        return await this.executeSayBlock(sprite, block);
      
      case 'think':
        return await this.executeThinkBlock(sprite, block);
      
      case 'repeat':
        return await this.executeRepeatBlock(sprite, block, context);
      
      case 'wait':
        return await this.executeWaitBlock(sprite, block);
      
      case 'change_size':
        return await this.executeChangeSizeBlock(sprite, block, duration);
      
      case 'set_color':
        return await this.executeSetColorBlock(sprite, block);
      
      default:
        return Promise.resolve();
    }
  }

  async executeMoveBlock(sprite, block, duration) {
    const steps = parseInt(block.placeholder) || 10;
    const radians = (sprite.rotation * Math.PI) / 180;
    
    // Calculate target position
    const targetX = sprite.x + Math.cos(radians) * steps;
    const targetY = sprite.y + Math.sin(radians) * steps;
    
    // Boundary constraints (assuming 800x500 stage)
    const boundedX = Math.max(25, Math.min(775, targetX));
    const boundedY = Math.max(25, Math.min(475, targetY));
    
    // Smooth animation
    return this.animatePosition(sprite, boundedX, boundedY, duration);
  }

  async executeTurnBlock(sprite, block, duration) {
    const degrees = parseInt(block.placeholder) || 15;
    const targetRotation = sprite.rotation + degrees;
    
    return this.animateRotation(sprite, targetRotation, duration);
  }

  async executeGotoBlock(sprite, block, duration) {
    const targetX = parseInt(block.x) || 0;
    const targetY = parseInt(block.y) || 0;
    
    // Boundary constraints
    const boundedX = Math.max(25, Math.min(775, targetX));
    const boundedY = Math.max(25, Math.min(475, targetY));
    
    return this.animatePosition(sprite, boundedX, boundedY, duration);
  }

  async executeSayBlock(sprite, block) {
    const message = block.placeholder || 'Hello!';
    const duration = (parseInt(block.unit) || 2) * 1000;
    
    this.showSpriteMessage(sprite.id, message, duration);
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async executeThinkBlock(sprite, block) {
    const message = block.placeholder || 'Hmm...';
    const duration = (parseInt(block.unit) || 2) * 1000;
    
    this.showSpriteMessage(sprite.id, `💭 ${message}`, duration);
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  async executeRepeatBlock(sprite, block, context) {
    const repeatCount = parseInt(block.placeholder) || 1;
    const blocksToRepeat = context.blocksToRepeat || [];
    
    for (let i = 0; i < repeatCount; i++) {
      for (const repeatBlock of blocksToRepeat) {
        await this.executeBlock(sprite, repeatBlock, context);
        
        // Check for collisions during repeat
        if (this.checkCollisions) {
          await this.checkCollisions(sprite.id);
        }
      }
    }
  }

  async executeWaitBlock(sprite, block) {
    const seconds = parseInt(block.placeholder) || 1;
    return new Promise(resolve => setTimeout(resolve, seconds * 1000 / this.animationSpeed));
  }

  async executeChangeSizeBlock(sprite, block, duration) {
    const sizeChange = parseInt(block.placeholder) || 10;
    const newSize = Math.max(20, Math.min(100, sprite.size + sizeChange));
    
    return this.animateSize(sprite, newSize, duration);
  }

  async executeSetColorBlock(sprite, block) {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
    const colorIndex = parseInt(block.placeholder) || 0;
    const newColor = colors[colorIndex % colors.length];
    
    // Instant color change
    this.updateSpritePosition(sprite.id, sprite.x, sprite.y, { color: newColor });
    return Promise.resolve();
  }

  // Animation helpers
  async animatePosition(sprite, targetX, targetY, duration) {
    return new Promise(resolve => {
      const startX = sprite.x;
      const startY = sprite.y;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentX = startX + (targetX - startX) * easeProgress;
        const currentY = startY + (targetY - startY) * easeProgress;
        
        this.updateSpritePosition(sprite.id, currentX, currentY);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  async animateRotation(sprite, targetRotation, duration) {
    return new Promise(resolve => {
      const startRotation = sprite.rotation;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentRotation = startRotation + (targetRotation - startRotation) * progress;
        this.updateSpriteRotation(sprite.id, currentRotation);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  async animateSize(sprite, targetSize, duration) {
    return new Promise(resolve => {
      const startSize = sprite.size;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentSize = startSize + (targetSize - startSize) * progress;
        this.updateSpritePosition(sprite.id, sprite.x, sprite.y, { size: currentSize });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }

  // Advanced execution patterns
  async executeSequence(sprite, blocks, options = {}) {
    const { loop = 1, onBlockStart, onBlockEnd, onSequenceComplete } = options;
    
    for (let loopIndex = 0; loopIndex < loop; loopIndex++) {
      for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
        const block = blocks[blockIndex];
        
        if (onBlockStart) {
          onBlockStart(sprite.id, blockIndex, block);
        }
        
        // Handle special block combinations
        if (block.type === 'repeat' && blockIndex + 1 < blocks.length) {
          const repeatCount = parseInt(block.placeholder) || 1;
          const nextBlock = blocks[blockIndex + 1];
          
          for (let i = 0; i < repeatCount; i++) {
            await this.executeBlock(sprite, nextBlock);
          }
          
          blockIndex++; // Skip the next block as it was repeated
        } else {
          await this.executeBlock(sprite, block);
        }
        
        if (onBlockEnd) {
          onBlockEnd(sprite.id, blockIndex, block);
        }
        
        // Check for collisions after each block
        if (this.checkCollisions) {
          await this.checkCollisions(sprite.id);
        }
      }
    }
    
    if (onSequenceComplete) {
      onSequenceComplete(sprite.id);
    }
  }

  // Stop all animations for a sprite
  stopSprite(spriteId) {
    if (this.executionQueue.has(spriteId)) {
      const { timeouts, intervals } = this.executionQueue.get(spriteId);
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
      this.executionQueue.delete(spriteId);
    }
  }

  // Stop all animations
  stopAll() {
    this.executionQueue.forEach((timers, spriteId) => {
      this.stopSprite(spriteId);
    });
    this.executionQueue.clear();
  }
}

// Utility functions for collision detection
export const CollisionDetector = {
  // Check if two circular sprites collide
  checkCircleCollision(sprite1, sprite2) {
    const dx = sprite1.x - sprite2.x;
    const dy = sprite1.y - sprite2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = (sprite1.size + sprite2.size) / 2;
    
    return distance < combinedRadius;
  },

  // Check if sprite is near edge of stage
  checkBoundaryCollision(sprite, stageWidth = 800, stageHeight = 500, margin = 10) {
    return {
      left: sprite.x <= margin,
      right: sprite.x >= stageWidth - margin,
      top: sprite.y <= margin,
      bottom: sprite.y >= stageHeight - margin
    };
  },

  // Find all colliding sprite pairs
  findAllCollisions(sprites) {
    const collisions = [];
    
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i + 1; j < sprites.length; j++) {
        if (this.checkCircleCollision(sprites[i], sprites[j])) {
          collisions.push([sprites[i], sprites[j]]);
        }
      }
    }
    
    return collisions;
  }
};

export default BlockExecutor;