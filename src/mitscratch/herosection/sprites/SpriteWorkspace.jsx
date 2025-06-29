import React, { useState, useEffect } from "react";
import { getBlockType } from "../blockConfig";

const SpriteWorkspace = ({ sprite, onBlocksUpdate, isPlaying }) => {
  const [blocks, setBlocks] = useState(sprite?.blocks || []);

  useEffect(() => {
    if (sprite?.blocks) {
      setBlocks(sprite.blocks);
    }
  }, [sprite?.blocks]);

  const logProgramBlocks = () => {
    console.log("🚀 Running Program with Blocks:", blocks);
    blocks.forEach((block) => {
      console.log(`${block.label}`, block.inputs);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const blockData = e.dataTransfer.getData("block");
    if (blockData && sprite) {
      const droppedBlock = JSON.parse(blockData);
      console.log("🔻 Dropped Block:", droppedBlock);

      const blockType = getBlockType(droppedBlock.type);

      if (blockType) {
        const newBlock = {
          id: Date.now() + Math.random(),
          type: droppedBlock.type,
          label: droppedBlock.label,
          color: droppedBlock.color,
          isContainer: droppedBlock.isContainer || false,
          inputs: {}, // Initialize as empty object
          childBlocks: droppedBlock.isContainer ? [] : undefined,
        };

        // Set default values for inputs
        if (blockType.inputs) {
          blockType.inputs.forEach((input) => {
            newBlock.inputs[input.name] = input.default;
          });
        }

        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        onBlocksUpdate(sprite.id, newBlocks);
        logProgramBlocks(); // ✅ Log all blocks after drop
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeBlock = (blockId) => {
    const newBlocks = blocks.filter((block) => block.id !== blockId);
    setBlocks(newBlocks);
    onBlocksUpdate(sprite.id, newBlocks);
  };

  const updateBlockInput = (blockId, inputName, value) => {
    console.log(`📝 Updating block ${blockId}, input ${inputName} to:`, value);
    const newBlocks = blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            inputs: {
              ...block.inputs,
              [inputName]: value,
            },
          }
        : block
    );
    setBlocks(newBlocks);
    onBlocksUpdate(sprite.id, newBlocks);
  };

  const moveBlock = (dragIndex, hoverIndex) => {
    const dragBlock = blocks[dragIndex];
    const newBlocks = [...blocks];
    newBlocks.splice(dragIndex, 1);
    newBlocks.splice(hoverIndex, 0, dragBlock);
    setBlocks(newBlocks);
    onBlocksUpdate(sprite.id, newBlocks);
  };

  const clearAllBlocks = () => {
    setBlocks([]);
    onBlocksUpdate(sprite.id, []);
  };

  const duplicateBlock = (blockId) => {
    const blockToDuplicate = blocks.find((block) => block.id === blockId);
    if (blockToDuplicate) {
      const duplicatedBlock = {
        ...blockToDuplicate,
        id: Date.now() + Math.random(),
        inputs: { ...blockToDuplicate.inputs },
      };
      const blockIndex = blocks.findIndex((block) => block.id === blockId);
      const newBlocks = [...blocks];
      newBlocks.splice(blockIndex + 1, 0, duplicatedBlock);
      setBlocks(newBlocks);
      onBlocksUpdate(sprite.id, newBlocks);
    }
  };

  const renderBlockInputs = (block) => {
    const blockType = getBlockType(block.type);
    if (!blockType?.inputs) return null;

    return blockType.inputs.map((input, index) => (
      <React.Fragment key={input.name}>
        {input.name === "x" && <span className="text-xs">x:</span>}
        {input.name === "y" && <span className="text-xs">y:</span>}
        {input.name === "duration" && blockType.inputs.length > 1 && (
          <span className="text-xs">for</span>
        )}
        {input.name === "times" && <span className="text-xs">times</span>}
        <input
          type={input.type === "number" ? "number" : "text"}
          value={
            block.inputs[input.name] !== undefined
              ? block.inputs[input.name]
              : input.default
          }
          onChange={(e) =>
            updateBlockInput(block.id, input.name, e.target.value)
          }
          className={`${
            input.type === "number" && ["x", "y"].includes(input.name)
              ? "w-16"
              : input.type === "number"
              ? "w-16"
              : "w-24"
          } bg-white text-black text-center rounded px-2 py-1 border border-gray-300 focus:border-blue-500 focus:outline-none text-xs font-medium hover:border-blue-400 transition-colors`}
          disabled={isPlaying}
          placeholder={input.placeholder}
          min={input.type === "number" ? input.min || 0 : undefined}
          max={input.type === "number" ? input.max : undefined}
        />
        {input.name === "duration" && <span className="text-xs">sec</span>}
        {input.name === "steps" && <span className="text-xs">steps</span>}
        {input.name === "degrees" && <span className="text-xs">degrees</span>}
        {input.name === "seconds" && <span className="text-xs">sec</span>}
        {input.name === "times" && index === blockType.inputs.length - 1 && (
          <span className="text-xs">times</span>
        )}
      </React.Fragment>
    ));
  };

  if (!sprite) {
    return (
      <div className="w-full h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-2">
            Select a sprite to see its workspace
          </p>
          <p className="text-sm text-gray-400">
            Drag blocks here to program your sprite
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <div className={`w-4 h-4 ${sprite.color} rounded-full mr-2`}></div>
          {sprite.name} Workspace
        </h3>
        <div className="flex gap-2 items-center">
          <button
            onClick={clearAllBlocks}
            disabled={isPlaying || blocks.length === 0}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            Clear All
          </button>
          <div
            className={`px-2 py-1 rounded text-sm font-medium ${
              sprite.isRunning
                ? "bg-green-100 text-green-800 animate-pulse"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {sprite.isRunning ? "▶ Running" : "⏸ Ready"}
          </div>
        </div>
      </div>

      <div
        className="min-h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors hover:border-gray-400"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <p>Drop blocks here for {sprite.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                Drag from the block panel on the left
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((block, index) => {
              const blockType = getBlockType(block.type);

              return (
                <div
                  key={block.id}
                  className={`
                    ${block.color || "bg-gray-500"}
                    text-white px-4 py-3 rounded-lg shadow-md flex items-center gap-3 relative group
                    ${
                      sprite.isRunning && sprite.currentBlockIndex === index
                        ? "ring-2 ring-yellow-400 shadow-lg transform scale-105"
                        : ""
                    }
                    ${
                      block.isContainer
                        ? "border-l-4 border-white border-opacity-50"
                        : ""
                    }
                    transition-all duration-300 hover:shadow-lg
                  `}
                >
                  <div className="flex-shrink-0 bg-white bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-medium">{block.label}</span>
                    {renderBlockInputs(block)}
                    {blockType?.unit &&
                      !blockType.inputs?.some(
                        (input) =>
                          input.name === "duration" || input.name === "seconds"
                      ) && (
                        <span className="text-white text-opacity-80 text-xs">
                          {blockType.unit}
                        </span>
                      )}
                  </div>

                  {block.isContainer && (
                    <div className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs">
                      📦 {block.childBlocks?.length || 0} inside
                    </div>
                  )}

                  {sprite.isRunning && sprite.currentBlockIndex === index && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => duplicateBlock(block.id)}
                      disabled={isPlaying}
                      className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white w-6 h-6 rounded-full text-xs transition-all disabled:opacity-0 flex items-center justify-center"
                      title="Duplicate block"
                    >
                      ⧉
                    </button>
                    <button
                      onClick={() => removeBlock(block.id)}
                      disabled={isPlaying}
                      className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full text-xs transition-all disabled:opacity-0 flex items-center justify-center"
                      title="Remove block"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {blocks.length > 0 && (
        <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
          <span>Total blocks: {blocks.length}</span>
          {sprite.isRunning && (
            <span className="text-green-600 font-medium">
              Executing block {(sprite.currentBlockIndex || 0) + 1} of{" "}
              {blocks.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SpriteWorkspace;
