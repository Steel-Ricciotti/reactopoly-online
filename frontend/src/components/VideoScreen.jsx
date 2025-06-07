import React, {useContext} from 'react';
import { GameContext } from "../contexts/GameContext";
export default function  VideoScreen ({  width = 640, height = 360 })  {
  const { setScreen } = useContext(GameContext);
  const handleBack =()=>{
    setScreen('Landing')
  }

    return (
    <div>
      <video width={width} height={height} controls>
        <source src="/video/reactopoly.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button
        onClick={handleBack}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow z-50"
      >
        Back
      </button>
    </div>
  );
}