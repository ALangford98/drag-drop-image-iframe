import React, { useState } from "react";
import MemeEditor from "./components/MemeEditor";
import "./App.css";
import { color } from "html2canvas/dist/types/css/types/color";

interface Template {
    name: string;
    color?: string;
    image?: string;
}

const backgroundImages = [
    `${process.env.PUBLIC_URL}/backgrounds/2panel_v.webp`,
    `${process.env.PUBLIC_URL}/backgrounds/2panel.jpg`,
    `${process.env.PUBLIC_URL}/backgrounds/4panel.jpg`,
    `${process.env.PUBLIC_URL}/backgrounds/8panel.jpg`,
];

const templates: Template[] = [
    { name: "Black", color: "black" },
    { name: "White", color: "white" },
];

function App() {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
        null
    );

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
        return "black"; // default for image backgrounds
    };

    return (
        <div className="App">
            {!selectedTemplate ? (
                <div className="template-selector">
                    <h2 style={{ color: "black" }}>Select a Background</h2>
                    <div className="template-list">
                        {templates.map((template) => (
                            <div
                                key={template.name}
                                className="template"
                                style={{ backgroundColor: template.color }}
                                onClick={() => setSelectedTemplate(template)}
                            ></div>
                        ))}
                        {backgroundImages.map((src, i) => (
                            <div
                                key={i}
                                className="template"
                                style={{
                                    backgroundImage: `url(${src})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                                onClick={() =>
                                    setSelectedTemplate({
                                        name: `Image ${i + 1}`,
                                        image: src,
                                    })
                                }
                            />
                        ))}
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <label className="upload-btn">
                            Upload Background
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                            />
                        </label>
                    </div>
                </div>
            ) : (
                <MemeEditor
                    onBack={() => setSelectedTemplate(null)}
                    initialBackground={
                        selectedTemplate.image || selectedTemplate.color
                    }
                    textColor={getTextColor(selectedTemplate)}
                />
            )}
        </div>
    );
}

export default App;
