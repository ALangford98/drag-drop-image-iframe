import React, { useState } from "react";
import MemeEditor from "./components/MemeEditor";
import "./App.css";

interface Template {
  name: string;
  color?: string;
  image?: string;
}

// Generate background panels that all share a fixed canvas size (1000x1000)
function generatePanels(rows: number, cols: number, lineColor = "#000") {
  const width = 1000;
  const height = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // black grid lines
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 6;

  // vertical lines
  for (let c = 1; c < cols; c++) {
    const x = (width / cols) * c;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // horizontal lines
  for (let r = 1; r < rows; r++) {
    const y = (height / rows) * r;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  return canvas.toDataURL("image/png");
}

const panelTemplates = {
  blank: null,
  horizontal2: generatePanels(1, 2),
  vertical2: generatePanels(2, 1),
  fourPanel: generatePanels(2, 2),
  eightPanel: generatePanels(4, 2),
};

const templates: Template[] = [
  { name: "Black", color: "black" },
  { name: "White", color: "white" },
  { name: "2 Panel (Horizontal)", image: panelTemplates.horizontal2 },
  { name: "2 Panel (Vertical)", image: panelTemplates.vertical2 },
  { name: "4 Panel", image: panelTemplates.fourPanel },
  { name: "8 Panel", image: panelTemplates.eightPanel },
];

function App() {
  const MAJOR_VERSION = "1"
  const MINOR_VERSION = "0.0.3"

  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedTemplate({
        name: "Custom",
        image: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const getTextColor = (template: Template) => {
    if (template.color === "white") return "black";
    if (template.color === "black") return "white";
    return "black";
  };

  return (
    <div className="App">
      <div
                    style={{
                        fontFamily: "monospace",
                        position: "absolute",
                        bottom: 8,
                        right: 12,
                        fontSize: "16px",
                        color: "rgba(100, 100, 100, 0.84)",
                        pointerEvents: "none",
                        userSelect: "none",
                    }}
                >
                    meme-maker v{MAJOR_VERSION}.{MINOR_VERSION} @ rageonsol.com
                </div>
      {!selectedTemplate ? (
        <div className="template-selector">
          <h2 style={{ color: "black" }}>Select a Background</h2>
          <div className="template-list">
            {templates.map((template) => (
              <div
                key={template.name}
                className="template"
                style={{
                  backgroundColor: template.color,
                  backgroundImage: template.image ? `url(${template.image})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                onClick={() => setSelectedTemplate(template)}
              />
            ))}
          </div>

          <div style={{ marginTop: "20px" }}>
            <label className="upload-btn">
              Upload Background
              <input type="file" accept="image/*" onChange={handleUpload} />
            </label>
          </div>
        </div>
      ) : (
        <MemeEditor
          onBack={() => setSelectedTemplate(null)}
          initialBackground={selectedTemplate.image || selectedTemplate.color}
          textColor={getTextColor(selectedTemplate)}
          // 👇 Force a consistent bounding box for the canvas
          canvasWidth={1000}
          canvasHeight={1000}
        />
      )}
    </div>
  );
}

export default App;
