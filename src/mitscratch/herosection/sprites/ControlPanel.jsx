import React, { useState, useEffect } from "react";

const ControlPanel = ({
  sprites,
  selectedSpriteIds = [], // Array for multi-selection
  isPlaying,
  onPlay,
  onStop,
  onAddSprite,
  onSpriteSelect,
  onDeleteSprite,
  onMultiSpriteSelect, // Function to handle multi-selection
  onClearSelection, // Function to clear selection
  onUpdateSprite, // Function to update sprite position/rotation during animation
}) => {
  const [executionState, setExecutionState] = useState({});

  // Handle multiple selected sprites
  const selectedSprites = sprites.filter((sprite) =>
    selectedSpriteIds.includes(sprite.id)
  );

  const totalBlocks = sprites.reduce(
    (sum, sprite) => sum + sprite.blocks.length,
    0
  );
  const runningSprites = sprites.filter((s) => s.isRunning).length;

  const handlePlay = async () => {
    setExecutionState({});
    onPlay(); // Start global play state

    const spritePromises = sprites.map((sprite) =>
      executeSprite(sprite)
    );
    await Promise.all(spritePromises);

    onStop(); // Stop when all finished
  };

  // Execute individual sprite with user-defined values from workspace
  const executeSprite = async (sprite) => {
    if (!sprite.blocks || sprite.blocks.length === 0) return;

    // Mark sprite as running
    onUpdateSprite(sprite.id, { isRunning: true });

    try {
      for (let i = 0; i < sprite.blocks.length; i++) {
        if (isPlaying) {
          // Update current block index for visual feedback
          onUpdateSprite(sprite.id, { currentBlockIndex: i });
          await executeBlock(sprite, sprite.blocks[i]);
        } else {
          break;
        }
      }
    } finally {
      // Mark sprite as stopped and clear current block index
      onUpdateSprite(sprite.id, { isRunning: false, currentBlockIndex: null });
    }
  };

  // Execute individual block with user input values from workspace
  const executeBlock = (sprite, block) => {
    return new Promise((resolve) => {
      switch (block.type) {
        case "move":
          // Get the actual value from block.inputs (set in workspace)
          const steps = parseInt(block.inputs?.steps || 10);
          animateMovement(sprite, steps, resolve);
          break;

        case "turn":
          // Get the actual value from block.inputs (set in workspace)
          const degrees = parseInt(block.inputs?.degrees || 15);
          const newRotation = (sprite.rotation + degrees) % 360;
          onUpdateSprite(sprite.id, { rotation: newRotation });
          setTimeout(resolve, 100);
          break;

        case "goto":
          // Get the actual values from block.inputs (set in workspace)
          const x = parseInt(block.inputs?.x || 0);
          const y = parseInt(block.inputs?.y || 0);
          onUpdateSprite(sprite.id, { x, y });
          setTimeout(resolve, 200);
          break;

        case "wait":
          // Get the actual value from block.inputs (set in workspace)
          const duration = parseFloat(block.inputs?.duration || 1) * 1000;
          setTimeout(resolve, duration);
          break;

        case "repeat":
          // Get the actual value from block.inputs (set in workspace)
          const times = parseInt(block.inputs?.times || 10);
          executeRepeat(sprite, block, times, resolve);
          break;

        case "say":
          // Get the actual values from block.inputs (set in workspace)
          const message = block.inputs?.message || "Hello!";
          const sayDuration = parseFloat(block.inputs?.duration || 2) * 1000;

          onUpdateSprite(sprite.id, { message });
          setTimeout(() => {
            onUpdateSprite(sprite.id, { message: "" });
            resolve();
          }, sayDuration);
          break;

        default:
          resolve();
      }
    });
  };

  // Smooth movement animation
  const animateMovement = (sprite, steps, callback) => {
    const stepSize = 3; // pixels per step
    const totalDistance = steps * stepSize;
    const animationDuration = Math.max(300, steps * 30); // Minimum 300ms, 30ms per step
    const frames = 20;
    const frameDelay = animationDuration / frames;
    const distancePerFrame = totalDistance / frames;

    let currentFrame = 0;

    // Calculate direction based on rotation
    const radians = (sprite.rotation * Math.PI) / 180;
    const deltaX = Math.cos(radians) * distancePerFrame;
    const deltaY = Math.sin(radians) * distancePerFrame;

    const animateFrame = () => {
      if (currentFrame < frames && isPlaying) {
        const newX = sprite.x + deltaX;
        const newY = sprite.y + deltaY;
        onUpdateSprite(sprite.id, { x: newX, y: newY });
        sprite.x = newX; // Update local reference for next frame
        sprite.y = newY;
        currentFrame++;
        setTimeout(animateFrame, frameDelay);
      } else {
        callback();
      }
    };

    animateFrame();
  };

  // Handle repeat block execution
  const executeRepeat = async (sprite, block, times, callback) => {
    for (let i = 0; i < times && isPlaying; i++) {
      if (block.childBlocks && block.childBlocks.length > 0) {
        for (const childBlock of block.childBlocks) {
          if (isPlaying) {
            await executeBlock(sprite, childBlock);
          }
        }
      }
    }
    callback();
  };

  // Handle delete with confirmation
  const handleDeleteSprite = (e, spriteId) => {
    e?.stopPropagation();

    if (window.confirm("Are you sure you want to delete this sprite?")) {
      onDeleteSprite(spriteId);
    }
  };

  // Handle delete multiple sprites
  const handleDeleteSelected = () => {
    if (selectedSpriteIds.length === 0) return;

    const runningSpriteIds = selectedSpriteIds.filter((id) => {
      const sprite = sprites.find((s) => s.id === id);
      return sprite && sprite.isRunning && isPlaying;
    });

    if (runningSpriteIds.length > 0) {
      alert("Cannot delete running sprites. Stop execution first.");
      return;
    }

    const message =
      selectedSpriteIds.length === 1
        ? "Are you sure you want to delete this sprite?"
        : `Are you sure you want to delete ${selectedSpriteIds.length} sprites?`;

    if (window.confirm(message)) {
      selectedSpriteIds.forEach((id) => onDeleteSprite(id));
      onClearSelection();
    }
  };

  // Handle sprite selection (with Ctrl/Cmd for multi-select)
  const handleSpriteClick = (e, spriteId) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-selection mode
      if (selectedSpriteIds.includes(spriteId)) {
        onMultiSpriteSelect(selectedSpriteIds.filter((id) => id !== spriteId));
      } else {
        onMultiSpriteSelect([...selectedSpriteIds, spriteId]);
      }
    } else {
      // Single selection mode
      onSpriteSelect(spriteId);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mr-3"></div>
          Control Panel
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            disabled={isPlaying || totalBlocks === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M4 4l12 6-12 6z" />
            </svg>
            Play All
          </button>
          <button
            onClick={onStop}
            disabled={!isPlaying && runningSprites === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <rect x="4" y="4" width="12" height="12" />
            </svg>
            Stop All
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 shadow-sm">
          <div className="text-sm text-blue-600 font-medium">Total Sprites</div>
          <div className="text-2xl font-bold text-blue-800">
            {sprites.length}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200 shadow-sm">
          <div className="text-sm text-purple-600 font-medium">
            Total Blocks
          </div>
          <div className="text-2xl font-bold text-purple-800">
            {totalBlocks}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200 shadow-sm">
          <div className="text-sm text-green-600 font-medium">Running</div>
          <div className="text-2xl font-bold text-green-700">
            {runningSprites}
          </div>
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600 font-medium">Status</div>
          <div
            className={`text-sm font-bold ${
              isPlaying ? "text-green-600" : "text-gray-600"
            }`}
          >
            {isPlaying ? "▶️ Playing" : "⏹️ Stopped"}
          </div>
        </div>
      </div>

      {/* Multi-Selection Controls */}
      {selectedSpriteIds.length > 1 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedSpriteIds.length} sprites selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteSelected}
                disabled={isPlaying}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm transition-colors"
              >
                Delete Selected
              </button>
              <button
                onClick={onClearSelection}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sprite Management */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700 flex items-center">
            <span className="mr-2">🎭</span>
            Sprites
          </h3>
          <button
            onClick={onAddSprite}
            disabled={isPlaying}
            className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Add Sprite
          </button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {sprites.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-2xl mb-2">🎭</div>
              No sprites yet. Click "Add Sprite" to get started!
            </div>
          ) : (
            sprites.map((sprite) => (
              <div
                key={sprite.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border-2
                  ${
                    selectedSpriteIds.includes(sprite.id)
                      ? "bg-blue-100 border-blue-300 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 border-transparent hover:border-gray-300"
                  }
                `}
              >
                {/* Left side - Select sprite */}
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={(e) => handleSpriteClick(e, sprite.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full ${sprite.color} shadow-sm border-2 border-white`}
                    style={{ transform: `rotate(${sprite.rotation}deg)` }}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{sprite.name}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round(sprite.x)}, {Math.round(sprite.y)}) •{" "}
                      {sprite.rotation}°
                    </span>
                  </div>
                  {sprite.isRunning && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Right side - Block count + Delete button */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">blocks</div>
                    <div className="text-sm font-bold text-gray-700">
                      {sprite.blocks.length}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSprite(e, sprite.id)}
                    disabled={isPlaying && sprite.isRunning}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      isPlaying && sprite.isRunning
                        ? "Cannot delete running sprite"
                        : "Delete Sprite"
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Sprite Info */}
      {selectedSprites.length === 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-blue-800 flex items-center">
              <span className="mr-2">🎯</span>
              Selected: {selectedSprites[0].name}
            </h4>
            <button
              onClick={(e) => handleDeleteSprite(e, selectedSprites[0].id)}
              disabled={isPlaying && selectedSprites[0].isRunning}
              className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Delete
            </button>
          </div>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Position:</span> (
                {Math.round(selectedSprites[0].x)},{" "}
                {Math.round(selectedSprites[0].y)})
              </div>
              <div>
                <span className="font-medium">Rotation:</span>{" "}
                {selectedSprites[0].rotation}°
              </div>
              <div>
                <span className="font-medium">Blocks:</span>{" "}
                {selectedSprites[0].blocks.length}
              </div>
              <div>
                <span className="font-medium">Status:</span>{" "}
                {selectedSprites[0].isRunning ? "🏃 Running" : "⏸️ Idle"}
              </div>
            </div>
            {selectedSprites[0].message && (
              <div className="mt-2 p-2 bg-white bg-opacity-70 rounded border">
                <span className="font-medium">💬 Message:</span> "
                {selectedSprites[0].message}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Help Text */}
      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-sm shadow-sm">
        <div className="font-bold text-yellow-800 mb-2 flex items-center">
          💡 Pro Tips:
        </div>
        <div className="text-yellow-700 space-y-1 text-xs">
          <div>• Drag blocks to sprite workspace to create programs</div>
          <div>
            • Click sprites to select them (Ctrl+Click for multi-select)
          </div>
          <div>• Edit block values in workspace for custom movements</div>
          <div>
            • Higher step values = faster movement, higher degrees = bigger
            turns
          </div>
          <div>• Use repeat blocks to create loops and complex animations</div>
          <div>• Collision detection automatically swaps sprite programs</div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;