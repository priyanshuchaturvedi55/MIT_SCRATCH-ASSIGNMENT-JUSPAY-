import React, { useState } from "react";
import { getBlocksByCategory, getBlockType } from "./blockConfig";

const BlockPanel = () => {
  // Store input values for each block type in the panel
  const [blockInputValues, setBlockInputValues] = useState({});
  
  const motionBlocks = getBlocksByCategory('motion');
  const looksBlocks = getBlocksByCategory('looks');

  const handleDragStart = (e, block) => {
    // Get current input values for this block type
    const currentInputs = blockInputValues[block.type] || {};
    const blockType = getBlockType(block.type);
    
    // Merge current inputs with defaults
    const finalInputs = {};
    if (blockType?.inputs) {
      blockType.inputs.forEach(input => {
        finalInputs[input.name] = currentInputs[input.name] !== undefined 
          ? currentInputs[input.name] 
          : input.default;
      });
    }

    e.dataTransfer.setData("block", JSON.stringify({
      type: block.type,
      label: block.label,
      color: block.color,
      inputs: finalInputs, // Pass the actual input values
      unit: block.unit,
      isContainer: block.isContainer || false
    }));
  };

  const handleInputClick = (e) => {
    e.stopPropagation(); // Prevent drag when clicking on inputs
  };

  const handleInputChange = (blockType, inputName, value) => {
    setBlockInputValues(prev => ({
      ...prev,
      [blockType]: {
        ...prev[blockType],
        [inputName]: value
      }
    }));
  };

  const renderBlockInputs = (block) => {
    const blockType = getBlockType(block.type);
    if (!blockType?.inputs) return null;
    
    const currentInputs = blockInputValues[block.type] || {};
    
    return blockType.inputs.map((input, index) => (
      <React.Fragment key={index}>
        {input.name === 'x' && <span className="text-xs">x:</span>}
        {input.name === 'y' && <span className="text-xs">y:</span>}
        {input.name === 'duration' && blockType.inputs.length > 1 && <span className="text-xs">for</span>}
        {input.name === 'times' && <span className="text-xs">times</span>}
        {input.name === 'steps' && block.type === 'move' && <span className="text-xs"></span>}
        {input.name === 'degrees' && <span className="text-xs"></span>}
       
        <input
          type={input.type === 'number' ? 'number' : 'text'}
          value={currentInputs[input.name] !== undefined ? currentInputs[input.name] : input.default}
          onChange={(e) => handleInputChange(block.type, input.name, e.target.value)}
          placeholder={input.placeholder}
          min={input.min || (input.type === 'number' ? 0 : undefined)}
          max={input.max || undefined}
          className={`${
            input.type === 'number' && ['x', 'y'].includes(input.name)
              ? 'w-12'
              : input.type === 'number'
                ? 'w-14'
                : 'w-20'
          } bg-white text-black text-center rounded px-2 py-1 border border-gray-300 focus:border-blue-500 focus:outline-none text-xs font-medium`}
          onClick={handleInputClick}
          onMouseDown={handleInputClick}
        />
       
        {input.name === 'duration' && <span className="text-xs"></span>}
        {input.name === 'steps' && <span className="text-xs"></span>}
        {input.name === 'degrees' && <span className="text-xs"></span>}
      </React.Fragment>
    ));
  };

  const BlockItem = ({ block }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(e, block)}
      className={`${block.color} text-sm text-white h-auto px-3 py-2 rounded-lg mb-3 cursor-move shadow-md hover:shadow-lg flex items-center space-x-2 hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
    >
      <span className="font-medium">{block.label}</span>
      {renderBlockInputs(block)}
      {block.unit && !block.inputs?.some(input => input.name === 'duration') && (
        <span className="text-xs">{block.unit}</span>
      )}
      
    </div>
  );

  return (
    <div className="w-1/4 h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 overflow-y-auto border-r-2 border-blue-200 shadow-inner">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 flex items-center">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
          Blocks
        </h2>
        <p className="text-sm text-gray-600">Drag blocks to create programs</p>
      </div>
     
      <div className="mb-8">
        <h3 className="font-bold text-lg text-blue-800 mt-3 mb-4 flex items-center bg-white bg-opacity-50 p-2 rounded-lg">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2 shadow-sm"></div>
         Motion
        </h3>
        <div className="space-y-2">
          {motionBlocks.map((block, index) => (
            <BlockItem key={`motion-${index}`} block={block} />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-lg text-purple-800 mt-3 mb-4 flex items-center bg-white bg-opacity-50 p-2 rounded-lg">
          <div className="w-4 h-4 bg-purple-500 rounded mr-2 shadow-sm"></div>
         Looks
        </h3>
        <div className="space-y-2">
          {looksBlocks.map((block, index) => (
            <BlockItem key={`looks-${index}`} block={block} />
          ))}
        </div>
      </div>

      {/* Block Categories Legend */}
     
    </div>
  );
};

export default BlockPanel;