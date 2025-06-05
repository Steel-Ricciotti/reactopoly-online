import React from "react";

export default function DiceDisplay({ diceResult, rolling }) {
  // If currently “rolling,” show a spinning white square
  if (rolling) {
    return (
      <div
        className="w-12 h-12 bg-white border border-gray-600 rounded flex items-center justify-center dice-rotating"
      />
    );
  }

  // If not rolled yet, show an empty placeholder (white square with “?”)
  if (!diceResult) {
    return (
      <div className="flex space-x-1">
        <div className="w-12 h-12 bg-white border border-gray-600 rounded flex items-center justify-center">
          <span className="text-xl text-gray-400">?</span>
        </div>
        <div className="w-12 h-12 bg-white border border-gray-600 rounded flex items-center justify-center">
          <span className="text-xl text-gray-400">?</span>
        </div>
      </div>
    );
  }

  // Otherwise, show two white squares with the rolled numbers
  return (
    <div className="flex space-x-1">
      <div className="w-12 h-12 bg-white border border-gray-600 rounded flex items-center justify-center">
        <span className="text-2xl font-bold text-black">{diceResult[0]}</span>
      </div>
      <div className="w-12 h-12 bg-white border border-gray-600 rounded flex items-center justify-center">
        <span className="text-2xl font-bold text-black">{diceResult[1]}</span>
      </div>
    </div>
  );
}
