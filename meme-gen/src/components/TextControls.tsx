import React from "react";

interface TextControlsProps {
  addTextBox: () => void;
}

export default function TextControls({ addTextBox }: TextControlsProps) {
  return (
    <div className="controls">
      <button className="action-btn" onClick={addTextBox}>
        ➕ Add Text
      </button>
    </div>
  );
}
