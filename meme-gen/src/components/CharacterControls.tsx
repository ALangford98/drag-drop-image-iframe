import React, { useState } from "react";

interface CharacterControlsProps {
  characterImages: string[];
  addCharacter: (src: string) => void;
}

export default function CharacterControls({
  characterImages,
  addCharacter,
}: CharacterControlsProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="controls">
      <button className="action-btn" onClick={() => setShowDropdown(s => !s)}>
        ➕ Add Character
      </button>
      {showDropdown && (
        <div className="char-dropdown">
          {characterImages.map((img) => (
            <img
              key={img}
              src={img}
              alt=""
              className="char-option"
              onClick={() => {
                addCharacter(img);
                setShowDropdown(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
