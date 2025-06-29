import React from "react";
import SpriteManager from "./spriteManager";
import StagePanel from "./stagePanel";
import SpriteWorkspace from "./SpriteWorkspace";
import ControlPanel from "./ControlPanel";
import BlockPanel from "../BlockPanel"; // Your existing BlockPanel

const MainScratchEditor = () => {
  const {
    sprites,
    selectedSpriteId,
    isPlaying,
    setSelectedSpriteId,
    addSprite,
    updateSpriteBlocks,
    playAll,
    stopAll,
  } = SpriteManager();

  const selectedSprite = sprites.find((s) => s.id === selectedSpriteId);

  return (
    <div className="h-screen bg-white-100 flex">
      {/* Left Panel - Blocks */}
      {/* <div className="w-1/4 min-w-[220px] max-w-xs bg-blue-50 overflow-y-auto border-r border-gray-300">
    <BlockPanel />
  </div> */}

      {/* Center Panel - Stage and Workspace */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Stage */}
        <div>
          <h2 className="text-xl font-bold mb-2 text-gray-800">Stage</h2>
          <StagePanel
            sprites={sprites}
            selectedSpriteId={selectedSpriteId}
            onSpriteSelect={setSelectedSpriteId}
          />
        </div>

        {/* Sprite Workspace */}
        <div>
          <SpriteWorkspace
            sprite={selectedSprite}
            onBlocksUpdate={updateSpriteBlocks}
            isPlaying={isPlaying}
          />
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div className="w-[350px] bg-white border-l border-gray-300 p-4 overflow-y-auto">
        <ControlPanel
          sprites={sprites}
          selectedSpriteId={selectedSpriteId}
          isPlaying={isPlaying}
          onPlay={playAll}
          onStop={stopAll}
          onAddSprite={addSprite}
          onSpriteSelect={setSelectedSpriteId}
        />
      </div>
    </div>
  );
};

export default MainScratchEditor;
