import React, { useRef, useState, useCallback, useEffect } from "react";
import { CATEGORIES } from "../types/search";

interface SketchCanvasProps {
  onSearch: (file: File, topK: number, category?: string) => void;
  loading: boolean;
}

const SketchCanvas: React.FC<SketchCanvasProps> = ({ onSearch, loading }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [topK, setTopK] = useState(10);
  const [category, setCategory] = useState("All");
  const [history, setHistory] = useState<ImageData[]>([]);
  const uploadRef = useRef<HTMLInputElement>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || history.length === 0) return;
    const last = history[history.length - 1];
    ctx.putImageData(last, 0, 0);
    setHistory((prev) => prev.slice(0, -1));
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    saveState();
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    setHistory([]);
    initCanvas();
  };

  const canvasToFile = (): File | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(new File([blob], "sketch.png", { type: "image/png" }));
      }, "image/png");
    }) as unknown as File;
  };

  const handleSearch = async () => {
    const file = canvasToFile();
    if (!file) return;
    onSearch(file, topK, category === "All" ? undefined : category);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      saveState();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Draw your fashion sketch
        </label>
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border border-gray-300 rounded-lg cursor-crosshair bg-white touch-none"
          style={{ maxHeight: "400px" }}
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Brush:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-500">{brushSize}px</span>
        </div>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={clearCanvas}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => uploadRef.current?.click()}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
        >
          Upload Sketch
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashion-500 focus:border-fashion-500 outline-none"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Results
          </label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fashion-500 focus:border-fashion-500 outline-none"
            disabled={loading}
          >
            {[5, 10, 20, 50].map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full bg-fashion-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-fashion-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Searching..." : "Search by Sketch"}
      </button>
    </div>
  );
};

export default SketchCanvas;
