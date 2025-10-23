import React, { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
    width: number;
    height: number;
    isActive: boolean;
    drawColor: string;
}

export default function DrawingCanvas({
    width,
    height,
    isActive,
    drawColor,
}: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [history, setHistory] = useState<ImageData[]>([]);

    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
    }, []);

    // Helpers to get coords relative to canvas
    const getXY = (clientX: number, clientY: number) => {
        const c = canvasRef.current;
        if (!c) return { x: 0, y: 0 };
        const r = c.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    };

    const handlePointerDown = (clientX: number, clientY: number) => {
        if (!isActive) return;
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;

        // Save snapshot for undo
        try {
            const snapshot = ctx.getImageData(0, 0, c.width, c.height);
            setHistory((h) => [...h, snapshot]);
        } catch {
            // some browsers may throw if tainted, ignore
        }

        const p = getXY(clientX, clientY);
        ctx.strokeStyle = drawColor;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        setIsDrawing(true);
    };

    const handlePointerMove = (clientX: number, clientY: number) => {
        if (!isActive || !isDrawing) return;
        const c = canvasRef.current;
        if (!c) return;
        const ctx = c.getContext("2d");
        if (!ctx) return;
        const p = getXY(clientX, clientY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = drawColor;
        ctx.stroke();
    };

    const handlePointerUp = () => {
        if (!isActive) return;
        setIsDrawing(false);
    };

    // Mouse handlers
    const onMouseDown = (e: React.MouseEvent) =>
        handlePointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) =>
        handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();

    // Touch handlers
    const onTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        handlePointerDown(t.clientX, t.clientY);
    };
    const onTouchMove = (e: React.TouchEvent) => {
        const t = e.touches[0];
        if (!t) return;
        handlePointerMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    const undo = () => {
        const c = canvasRef.current;
        const ctx = c?.getContext("2d");
        if (!c || !ctx) return;
        const prev = [...history];
        const last = prev.pop();
        setHistory(prev);
        if (last) ctx.putImageData(last, 0, 0);
        else ctx.clearRect(0, 0, c.width, c.height);
    };

    const clear = () => {
        const c = canvasRef.current;
        const ctx = c?.getContext("2d");
        if (!c || !ctx) return;
        ctx.clearRect(0, 0, c.width, c.height);
        setHistory([]);
    };

    // pointer-events: none when not active so clicks pass through
    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 5,
                    pointerEvents: isActive ? "auto" : "none", // only catch events when drawing
                    touchAction: "none",
                    cursor: isActive ? "crosshair" : "default",
                }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            />

            {/* Toolbar: always pointer-events auto */}
            {isActive && (
                <div
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        zIndex: 100, // make sure it's above the canvas
                        background: "rgba(255,255,255,0.9)",
                        padding: 6,
                        borderRadius: 8,
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        pointerEvents: "auto", // <-- important
                    }}
                >
                    <button onClick={undo}>↩️ Undo</button>
                    <button onClick={clear}>🧽 Clear</button>
                </div>
            )}
        </div>
    );
}
