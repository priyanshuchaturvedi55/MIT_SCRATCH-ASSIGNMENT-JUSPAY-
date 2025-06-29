// blockConfig.js - Centralized block definitions with execution logic
export const blockTypes = {
  // Motion blocks
  move: {
    category: 'motion',
    label: 'Move',
    color: 'bg-blue-500',
    inputs: [
      { name: 'steps', type: 'number', default: 10, placeholder: '10' }
    ],
    unit: 'steps',
    execute: async (sprite, inputs, updateSprite) => {
      const steps = parseInt(inputs.steps) || 10;
      const radians = (sprite.rotation - 90) * (Math.PI / 180);
      const newX = sprite.x + Math.cos(radians) * steps;
      const newY = sprite.y + Math.sin(radians) * steps;
      
      // Animate movement
      const startX = sprite.x;
      const startY = sprite.y;
      const duration = Math.abs(steps) * 50; // 50ms per step
      const startTime = Date.now();
      
      return new Promise((resolve) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const currentX = startX + (newX - startX) * progress;
          const currentY = startY + (newY - startY) * progress;
          
          updateSprite({
            x: Math.max(0, Math.min(400 - sprite.size, currentX)),
            y: Math.max(0, Math.min(300 - sprite.size, currentY)),
            trail: [...(sprite.trail || []), { x: currentX, y: currentY }]
          });
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    }
  },

  turn: {
    category: 'motion',
    label: 'Turn',
    color: 'bg-blue-500',
    inputs: [
      { name: 'degrees', type: 'number', default: 15, placeholder: '15' }
    ],
    unit: 'degrees',
    execute: async (sprite, inputs, updateSprite) => {
      const degrees = parseInt(inputs.degrees) || 15;
      const startRotation = sprite.rotation;
      const endRotation = startRotation + degrees;
      const duration = Math.abs(degrees) * 10; // 10ms per degree
      const startTime = Date.now();
      
      return new Promise((resolve) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const currentRotation = startRotation + (endRotation - startRotation) * progress;
          updateSprite({ rotation: currentRotation % 360 });
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    }
  },

  goto: {
    category: 'motion',
    label: 'Go to',
    color: 'bg-blue-500',
    inputs: [
      { name: 'x', type: 'number', default: 0, placeholder: '0' },
      { name: 'y', type: 'number', default: 0, placeholder: '0' }
    ],
    unit: '',
    execute: async (sprite, inputs, updateSprite) => {
      const targetX = parseInt(inputs.x) || 0;
      const targetY = parseInt(inputs.y) || 0;
      const startX = sprite.x;
      const startY = sprite.y;
      const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
      const duration = distance * 5; // 5ms per pixel
      const startTime = Date.now();
      
      return new Promise((resolve) => {
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const currentX = startX + (targetX - startX) * progress;
          const currentY = startY + (targetY - startY) * progress;
          
          updateSprite({
            x: Math.max(0, Math.min(400 - sprite.size, currentX)),
            y: Math.max(0, Math.min(300 - sprite.size, currentY)),
            trail: [...(sprite.trail || []), { x: currentX, y: currentY }]
          });
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    }
  },

  repeat: {
    category: 'motion',
    label: 'Repeat',
    color: 'bg-blue-500',
    inputs: [
      { name: 'times', type: 'number', default: 10, placeholder: '10' }
    ],
    unit: 'times',
    isContainer: true,
    execute: async (sprite, inputs, updateSprite, childBlocks, executeBlock) => {
      const times = parseInt(inputs.times) || 10;
      
      for (let i = 0; i < times; i++) {
        for (const childBlock of childBlocks || []) {
          await executeBlock(sprite, childBlock, updateSprite);
        }
      }
    }
  },

  // Looks blocks
  say: {
    category: 'looks',
    label: 'Say',
    color: 'bg-purple-500',
    inputs: [
      { name: 'message', type: 'text', default: 'Hello!', placeholder: 'Hello!' },
      { name: 'duration', type: 'number', default: 2, placeholder: '2' }
    ],
    unit: 'sec',
    execute: async (sprite, inputs, updateSprite) => {
      const message = inputs.message || 'Hello!';
      const duration = parseInt(inputs.duration) || 2;
      
      updateSprite({ message });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          updateSprite({ message: null });
          resolve();
        }, duration * 1000);
      });
    }
  },

  think: {
    category: 'looks',
    label: 'Think',
    color: 'bg-purple-500',
    inputs: [
      { name: 'message', type: 'text', default: 'Hmm...', placeholder: 'Hmm...' },
      { name: 'duration', type: 'number', default: 2, placeholder: '2' }
    ],
    unit: 'sec',
    execute: async (sprite, inputs, updateSprite) => {
      const message = inputs.message || 'Hmm...';
      const duration = parseInt(inputs.duration) || 2;
      
      updateSprite({ message: `💭 ${message}` });
      
      return new Promise((resolve) => {
        setTimeout(() => {
          updateSprite({ message: null });
          resolve();
        }, duration * 1000);
      });
    }
  },

  wait: {
    category: 'motion',
    label: 'Wait',
    color: 'bg-blue-500',
    inputs: [
      { name: 'seconds', type: 'number', default: 1, placeholder: '1' }
    ],
    unit: 'seconds',
    execute: async (sprite, inputs, updateSprite) => {
      const seconds = parseInt(inputs.seconds) || 1;
      
      return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      });
    }
  }
};

// Helper function to get block definition
export const getBlockType = (type) => {
  return blockTypes[type] || null;
};

// Helper function to get blocks by category
export const getBlocksByCategory = (category) => {
  return Object.entries(blockTypes)
    .filter(([_, block]) => block.category === category)
    .map(([type, block]) => ({ type, ...block }));
};