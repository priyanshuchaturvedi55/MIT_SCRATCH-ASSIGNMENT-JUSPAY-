import React from "react";
import BlockPanel from "./herosection/BlockPanel";
import MainScratchEditor from "./herosection/sprites/mainScratch";
import Navbar from "./herosection/Navbar";
import Footer from "./herosection/Footer";

const Wholesection = () => {
  return (
    <div>
      <Navbar />

      <div className="flex h-screen">
        {/* Left Panel - Block Palette */}
        <BlockPanel />
        {/* Right Panel - Main Editor */}
        <div className="flex-1 overflow-y-auto">
          <MainScratchEditor />
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default Wholesection;
