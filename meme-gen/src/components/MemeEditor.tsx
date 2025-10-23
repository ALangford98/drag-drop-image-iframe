import React, { useState, useRef, useEffect } from "react";
import DrawingCanvas from "./DrawingCanvas";
import TextControls from "./TextControls";
import CharacterControls from "./CharacterControls";
import DrawingControls from "./DrawingControls";

import "../styles/meme_editor.css";
import html2canvas from "html2canvas";

interface MemeEditorProps {
  onBack: () => void;
  initialBackground?: string;
  textColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

interface TextBox {
    id: number;
    text: string;
    x: number;
    y: number;
    isEditing: boolean;
}

interface Character {
    id: number;
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

const characterImages = [
    `${process.env.PUBLIC_URL}/ragers/RAGEGUY.png`,
    `${process.env.PUBLIC_URL}/ragers/FUUUUUUU.webp`,
    `${process.env.PUBLIC_URL}/ragers/RAGE.png`,
    `${process.env.PUBLIC_URL}/ragers/FFFFUUUU.png`,
    `${process.env.PUBLIC_URL}/ragers/DOWN.png`,
    `${process.env.PUBLIC_URL}/ragers/Rageguy.webp`,
    `${process.env.PUBLIC_URL}/ragers/Troll.webp`,
    `${process.env.PUBLIC_URL}/ragers/Lolguy.webp`,
    `${process.env.PUBLIC_URL}/ragers/Bitch Please.webp`,
    `${process.env.PUBLIC_URL}/ragers/Confused Derp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Crying Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Derpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Forever Alone.webp`,
    `${process.env.PUBLIC_URL}/ragers/Fuck No.webp`,
    `${process.env.PUBLIC_URL}/ragers/Grrrr.webp`,
    `${process.env.PUBLIC_URL}/ragers/Happy Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Happy Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Indifferent Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Lauging Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Me Gusta.webp`,
    `${process.env.PUBLIC_URL}/ragers/Precious.webp`,
];

export default function MemeEditor({
    onBack,
    initialBackground,
}: MemeEditorProps) {
    const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [activeBox, setActiveBox] = useState<number | null>(null);
    const [activeChar, setActiveChar] = useState<number | null>(null);
    const [selectedChar, setSelectedChar] = useState<number | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });
    const [backgroundColor, setBackgroundColor] = useState<string>("#000");
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [textColor, setTextColor] = useState<string>("#fff");

    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [draw_color, set_draw_color] = useState("#ff0000");

    const dragOffset = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [showCharDropdown, setShowCharDropdown] = useState(false);

    // deselect helper
    const deselectAll = () => {
        setSelectedChar(null);
        setActiveBox(null);
    };

    // initial background handling
    useEffect(() => {
        if (!initialBackground) return;
        if (initialBackground === "black" || initialBackground === "white") {
            setBackgroundColor(initialBackground);
            setBackgroundImage(null);
            setTextColor(initialBackground === "black" ? "#fff" : "#000");
        } else {
            setBackgroundImage(initialBackground);
            setBackgroundColor("#000");
            setTextColor("#000");
            // attempt to size canvas to image
            const img = new Image();
            img.onload = () =>
                setCanvasSize({ width: img.width, height: img.height });
            img.src = initialBackground;
        }
    }, [initialBackground]);

    const handleUploadBackground = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setCanvasSize({ width: img.width, height: img.height });
                setBackgroundImage(img.src);
                setBackgroundColor("#000");
                setTextColor("#000");
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const onDownload = async () => {
        deselectAll();
        if (!canvasRef.current) return;
        try {
            const canvas = await html2canvas(canvasRef.current);
            const link = document.createElement("a");
            link.download = "meme.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    const addTextBox = () => {
        deselectAll();
        setTextBoxes((p) => [
            ...p,
            {
                id: Date.now(),
                text: "Double-click to edit",
                x: 200,
                y: 200,
                isEditing: false,
            },
        ]);
    };

    const DEFAULT_CHAR_WIDTH = 100;
    const DEFAULT_CHAR_HEIGHT = 100;
    const addCharacter = (src: string) => {
        deselectAll();
        setCharacters((p) => [
            ...p,
            {
                id: Date.now(),
                src,
                x: 150,
                y: 150,
                width: DEFAULT_CHAR_WIDTH,
                height: DEFAULT_CHAR_HEIGHT,
            },
        ]);
        setShowCharDropdown(false);
    };

    const startDrag = (
        id: number,
        clientX: number,
        clientY: number,
        type: "text" | "char"
    ) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        if (type === "text") {
            const box = textBoxes.find((b) => b.id === id);
            if (!box) return;
            dragOffset.current = {
                x: clientX - (rect.left + box.x),
                y: clientY - (rect.top + box.y),
            };
            setActiveBox(id);
        } else {
            const char = characters.find((c) => c.id === id);
            if (!char) return;
            dragOffset.current = {
                x: clientX - (rect.left + char.x),
                y: clientY - (rect.top + char.y),
            };
            setActiveChar(id);
        }
    };

    const stopDrag = () => {
        setActiveBox(null);
        setActiveChar(null);
    };

    const doDrag = (clientX: number, clientY: number) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        if (activeBox !== null) {
            setTextBoxes((prev) =>
                prev.map((b) =>
                    b.id === activeBox
                        ? {
                              ...b,
                              x: clientX - rect.left - dragOffset.current.x,
                              y: clientY - rect.top - dragOffset.current.y,
                          }
                        : b
                )
            );
        }
        if (activeChar !== null) {
            setCharacters((prev) =>
                prev.map((c) =>
                    c.id === activeChar
                        ? {
                              ...c,
                              x: clientX - rect.left - dragOffset.current.x,
                              y: clientY - rect.top - dragOffset.current.y,
                          }
                        : c
                )
            );
        }
    };

    const handleTextDoubleClick = (id: number) => {
        deselectAll();
        setTextBoxes((prev) =>
            prev.map((b) =>
                b.id === id ? { ...b, isEditing: !b.isEditing } : b
            )
        );
    };

    const deleteCharacter = () => {
        if (selectedChar === null) return;
        setCharacters((prev) => prev.filter((c) => c.id !== selectedChar));
        setSelectedChar(null);
    };

    // onMouseDown for the canvas: deselect if not clicking a selectable element
    const onCanvasMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // If the click is inside a draggable element -> don't deselect
        if (
            target.closest(".draggable-char") ||
            target.closest(".draggable-text") ||
            target.tagName === "INPUT"
        ) {
            return;
        }
        deselectAll();
    };

    return (
        <div className="meme-editor">
            <div className="top-buttons">
                <button className="back-btn" onClick={onBack}>
                    ← Back
                </button>
                <button className="back-btn" onClick={onDownload}>
                    ↓ Download
                </button>
            </div>

            <div
                ref={canvasRef}
                onMouseDown={onCanvasMouseDown}
                className="meme-canvas"
                style={{
                    width: canvasSize.width,
                    height: canvasSize.height,
                    backgroundColor: backgroundImage
                        ? undefined
                        : backgroundColor,
                    backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : undefined,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    position: "relative",
                }}
                onMouseMove={(e) => doDrag(e.clientX, e.clientY)}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onTouchMove={(e) =>
                    doDrag(e.touches[0].clientX, e.touches[0].clientY)
                }
                onTouchEnd={stopDrag}
            >
                <DrawingCanvas
                    width={canvasSize.width}
                    height={canvasSize.height}
                    isActive={isDrawingMode}
                    drawColor={draw_color}
                />

                {/* Text boxes */}
                {textBoxes.map((box) => (
                    <div
                        key={box.id}
                        className="draggable-text"
                        style={{
                            left: box.x,
                            top: box.y,
                            color: textColor,
                            position: "absolute",
                        }}
                        onMouseDown={(e) =>
                            startDrag(box.id, e.clientX, e.clientY, "text")
                        }
                        onTouchStart={(e) =>
                            startDrag(
                                box.id,
                                e.touches[0].clientX,
                                e.touches[0].clientY,
                                "text"
                            )
                        }
                        onDoubleClick={() => handleTextDoubleClick(box.id)}
                    >
                        {box.isEditing ? (
                            <input
                                autoFocus
                                type="text"
                                value={box.text}
                                style={{ color: textColor }}
                                onChange={(e) =>
                                    setTextBoxes((p) =>
                                        p.map((b) =>
                                            b.id === box.id
                                                ? { ...b, text: e.target.value }
                                                : b
                                        )
                                    )
                                }
                                onBlur={() =>
                                    setTextBoxes((p) =>
                                        p.map((b) =>
                                            b.id === box.id
                                                ? { ...b, isEditing: false }
                                                : b
                                        )
                                    )
                                }
                            />
                        ) : (
                            <span className="text-display">{box.text}</span>
                        )}
                    </div>
                ))}

                {/* Characters */}
                {characters.map((char) => (
                    <img
                        key={char.id}
                        src={char.src}
                        alt=""
                        className="draggable-char"
                        style={{
                            left: char.x,
                            top: char.y,
                            width: char.width,
                            height: char.height,
                            position: "absolute",
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setSelectedChar(char.id);
                            startDrag(char.id, e.clientX, e.clientY, "char");
                        }}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            setActiveChar(char.id);
                            startDrag(
                                char.id,
                                e.touches[0].clientX,
                                e.touches[0].clientY,
                                "char"
                            );
                        }}
                    />
                ))}
            </div>

            {/* Scale control moved OUTSIDE canvas so it is not included in exports */}
            {selectedChar !== null && !isDrawingMode && (
                <div className="scale-control" style={{ marginTop: 8 }}>
                    <label>Scale:</label>
                    <input
                        type="range"
                        min="20"
                        max="300"
                        value={
                            characters.find((c) => c.id === selectedChar)
                                ?.width ?? 100
                        }
                        onChange={(e) => {
                            const newSize = parseInt(e.target.value);
                            setCharacters((prev) =>
                                prev.map((c) =>
                                    c.id === selectedChar
                                        ? {
                                              ...c,
                                              width: newSize,
                                              height: newSize,
                                          }
                                        : c
                                )
                            );
                        }}
                    />
                    <button
                        onClick={deleteCharacter}
                        style={{
                            marginLeft: 10,
                            background: "#ff4d4d",
                            color: "white",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: 6,
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}

            <div className="controls">
                <TextControls addTextBox={addTextBox} />
                <CharacterControls
                    characterImages={characterImages}
                    addCharacter={addCharacter}
                />
                <div >
                    <DrawingControls
                        isDrawingMode={isDrawingMode}
                        drawColor={draw_color}
                        setIsDrawingMode={setIsDrawingMode}
                        setDrawColor={set_draw_color}
                    />                    
                </div>
            </div>
        </div>
    );
}
