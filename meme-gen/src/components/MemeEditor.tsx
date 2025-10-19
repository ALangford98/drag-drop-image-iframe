import React, { useState, useRef, useEffect } from "react";
import "../styles/meme_editor.css";
import html2canvas from "html2canvas";

interface MemeEditorProps {
    initialBackground?: string; // can be color or image URL
    textColor?: string;
    onBack: () => void;
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
    `${process.env.PUBLIC_URL}/ragers/Bitch Please.webp`,
    `${process.env.PUBLIC_URL}/ragers/Confused Derp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Crying Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Derpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Forever Alone.webp`,
    `${process.env.PUBLIC_URL}/ragers/Fuck No.webp`,
    `${process.env.PUBLIC_URL}/ragers/FUUUUUUU.webp`,
    `${process.env.PUBLIC_URL}/ragers/Grrrr.webp`,
    `${process.env.PUBLIC_URL}/ragers/Happy Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Happy Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Indifferent Herp.webp`,
    `${process.env.PUBLIC_URL}/ragers/Lauging Herpette.webp`,
    `${process.env.PUBLIC_URL}/ragers/Lolguy.webp`,
    `${process.env.PUBLIC_URL}/ragers/Me Gusta.webp`,
    `${process.env.PUBLIC_URL}/ragers/Precious.webp`,
    `${process.env.PUBLIC_URL}/ragers/Rageguy.webp`,
    `${process.env.PUBLIC_URL}/ragers/Troll.webp`,
    `${process.env.PUBLIC_URL}/ragers/Y U NO.webp`,
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

    const dragOffset = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    const [showCharDropdown, setShowCharDropdown] = useState(false);

    // Determine if initial background is a color or image
    useEffect(() => {
        if (!initialBackground) return;

        if (initialBackground === "black" || initialBackground === "white") {
            setBackgroundColor(initialBackground);
            setBackgroundImage(null);
            setTextColor(initialBackground === "black" ? "#fff" : "#000");
        } else {
            setBackgroundImage(initialBackground);
            setBackgroundColor("#000"); // fallback if image fails
            setTextColor("#000"); // default black text on images
        }
    }, [initialBackground]);

    const handleUploadBackground = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                setCanvasSize({ width: img.width, height: img.height });
                setBackgroundImage(img.src);
                setBackgroundColor("#000"); // default fallback
                setTextColor("#000"); // black text for image
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const onDownload = async () => {
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
        setTextBoxes((prev) => [
            ...prev,
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
        setCharacters((prev) => [
            ...prev,
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
                prev.map((box) =>
                    box.id === activeBox
                        ? {
                              ...box,
                              x: clientX - rect.left - dragOffset.current.x,
                              y: clientY - rect.top - dragOffset.current.y,
                          }
                        : box
                )
            );
        }

        if (activeChar !== null) {
            setCharacters((prev) =>
                prev.map((char) =>
                    char.id === activeChar
                        ? {
                              ...char,
                              x: clientX - rect.left - dragOffset.current.x,
                              y: clientY - rect.top - dragOffset.current.y,
                          }
                        : char
                )
            );
        }
    };

    const handleTextDoubleClick = (id: number) => {
        setTextBoxes((prev) =>
            prev.map((box) =>
                box.id === id ? { ...box, isEditing: !box.isEditing } : box
            )
        );
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
                }}
                onMouseMove={(e) => doDrag(e.clientX, e.clientY)}
                onMouseUp={stopDrag}
                onMouseLeave={stopDrag}
                onTouchMove={(e) =>
                    doDrag(e.touches[0].clientX, e.touches[0].clientY)
                }
                onTouchEnd={stopDrag}
            >
                {textBoxes.map((box) => (
                    <div
                        key={box.id}
                        className="draggable-text"
                        style={{ left: box.x, top: box.y, color: textColor }}
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
                                    setTextBoxes((prev) =>
                                        prev.map((b) =>
                                            b.id === box.id
                                                ? { ...b, text: e.target.value }
                                                : b
                                        )
                                    )
                                }
                                onBlur={() =>
                                    setTextBoxes((prev) =>
                                        prev.map((b) =>
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
                {selectedChar !== null && (
                    <div
                        className="scale-control"
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            background: "rgba(255,255,255,0.8)",
                            padding: "5px",
                            borderRadius: "5px",
                            zIndex: 1000, // make sure it's on top
                        }}
                    >
                        <label>Scale:</label>
                        <input
                            type="range"
                            min={50}
                            max={300}
                            value={
                                characters.find((c) => c.id === selectedChar)
                                    ?.width || 100
                            }
                            onChange={(e) => {
                                const newSize = parseInt(e.target.value, 10);
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
                    </div>
                )}
            </div>

            <div className="controls">
                <button className="action-btn" onClick={addTextBox}>
                    ➕ Add Text
                </button>
                <button
                    className="action-btn"
                    onClick={() => setShowCharDropdown(!showCharDropdown)}
                >
                    ➕ Add Character
                </button>
                {showCharDropdown && (
                    <div className="char-dropdown">
                        {characterImages.map((img) => (
                            <img
                                key={img}
                                src={img}
                                alt=""
                                className="char-option"
                                onClick={() => addCharacter(img)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
