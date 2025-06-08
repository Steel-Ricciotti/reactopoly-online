import React from "react";
import { PROPERTY_DATA, GROUP_MAP } from "../utils/propertyData.js";

export default function BuyHouseModal({ onClose, groups, buyHouse }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Buy House/Hotel</h2>
        <div className="mb-4">
            {console.log(GROUP_MAP)}
          {groups.length === 0 ? (
            <div className="text-gray-500">No eligible property groups.</div>
          ) : (
            groups.map(groupIdx => (
              <button
                key={groupIdx}
                onClick={() => buyHouse(groupIdx)}
                className="block w-full text-left px-4 py-2 rounded bg-green-200 hover:bg-green-300 my-1"
              >
                {/* {GROUP_MAP[groupIdx]} */}
                {groupIdx}
              </button>
            ))
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
