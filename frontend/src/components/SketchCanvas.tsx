import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
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
    ctx.strokeStyle = "#0D111A";
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
    <motion.div
      className="flex flex-col items-center space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-[80%]">
        <canvas
          ref={canvasRef}
          width={500}
          height={360}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border-2 border-primary-lighter rounded-2xl cursor-crosshair bg-white touch-none transition-colors duration-200 hover:border-primary-light"
          style={{ maxHeight: "360px" }}
        />
      </div>

      <div className="w-[80%] flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-surface-muted rounded-xl px-3 py-2">
          <label className="text-xs text-primary-dark/50 font-medium">Brush</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-primary"
          />
          <span className="text-xs text-primary-dark/40 w-7">{brushSize}px</span>
        </div>
        <button type="button" onClick={undo} disabled={history.length === 0} className="btn-secondary text-xs px-4 py-2">
          Undo
        </button>
        <button type="button" onClick={clearCanvas} className="btn-secondary text-xs px-4 py-2">
          Clear
        </button>
        <button type="button" onClick={() => uploadRef.current?.click()} className="btn-secondary text-xs px-4 py-2">
          Upload
        </button>
        <input ref={uploadRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      <div className="w-[80%] flex gap-4">
        <div className="w-[80%]">
          <label className="label-text">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field h-[50px]"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[20%]">
          <label className="label-text">Results</label>
          <select
            value={topK}
            onChange={(e) => setTopK(Number(e.target.value))}
            className="input-field h-[50px]"
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
        className="btn-primary w-[80%] h-[55px] flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Search by Sketch
          </>
        )}
      </button>
    </motion.div>
  );
};

export default SketchCanvas;
