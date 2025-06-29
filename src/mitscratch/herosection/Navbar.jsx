import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex justify-between items-center">
      {/* Left: Scratch Button */}
      <div className="text-2xl font-bold text-blue-600">
        <button className="hover:underline transition duration-150 ease-in-out">
           <span className='text-yellow-500 '>MIT</span> 
          Scratch
        </button>
      </div>

      {/* Right: Navigation (Optional) */}
      
      
    </nav>
  );
};

export default Navbar;
