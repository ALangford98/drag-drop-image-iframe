import React from "react";

interface DrawingControlsProps {
  isDrawingMode: boolean;
  drawColor: string;
  setIsDrawingMode: (value: boolean) => void;
  setDrawColor: (value: string) => void;
}

export default function DrawingControls({
  isDrawingMode,
  drawColor,
  setIsDrawingMode,
  setDrawColor,
}: DrawingControlsProps) {
  return (
    <div className="controls">
      <button
        className={`action-btn ${isDrawingMode ? "active" : ""}`}
        onClick={() => setIsDrawingMode(!isDrawingMode)}
      >
        ✏️ {isDrawingMode ? "Disable Drawing" : "Enable Drawing"}
      </button>
      {isDrawingMode && (
        <input
          type="color"
          value={drawColor}
          onChange={(e) => setDrawColor(e.target.value)}
        />
      )}
    </div>
  );
}
