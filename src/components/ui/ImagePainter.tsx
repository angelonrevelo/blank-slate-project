import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Check } from 'lucide-react';

interface ImagePainterProps {
  width?: number;
  height?: number;
  backgroundImage?: string;
  onSave?: (pngUrl: string, jsonData: string) => void;
  initialData?: string;
}

type Tool = 'select' | 'brush' | 'line' | 'circle' | 'eraser';

interface DrawAction {
  tool: Tool;
  points: { x: number; y: number }[];
  color: string;
  size: number;
}

export function ImagePainter({
  width = 800,
  height = 600,
  backgroundImage,
  onSave,
  // initialData can be used for future restoration feature
  initialData: _initialData,
}: ImagePainterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>('brush');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        redrawActions(ctx);
      };
      img.src = backgroundImage;
    } else {
      redrawActions(ctx);
    }
  }, [actions, backgroundImage, width, height]);

  // Define handleSave before using it in the auto-save effect
  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onSave) return;

    const pngUrl = canvas.toDataURL('image/png');
    const jsonData = JSON.stringify({ actions, backgroundImage });
    onSave(pngUrl, jsonData);
  }, [actions, backgroundImage, onSave]);

  // Auto-save with debounce when actions change
  useEffect(() => {
    if (actions.length === 0) {
      setIsSaved(true);
      return;
    }

    setIsSaved(false);

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce auto-save by 1 second
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
      setIsSaved(true);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [actions, handleSave]);

  const redrawActions = (ctx: CanvasRenderingContext2D) => {
    actions.forEach(action => {
      drawAction(ctx, action);
    });
  };

  const drawAction = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
    if (action.points.length === 0) return;

    ctx.strokeStyle = action.color;
    ctx.lineWidth = action.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (action.tool === 'brush' || action.tool === 'eraser') {
      ctx.globalCompositeOperation = action.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.beginPath();
      ctx.moveTo(action.points[0].x, action.points[0].y);
      action.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    } else if (action.tool === 'line' && action.points.length >= 2) {
      const start = action.points[0];
      const end = action.points[action.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (action.tool === 'circle' && action.points.length >= 2) {
      const start = action.points[0];
      const end = action.points[action.points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'select') return;
    
    setIsDrawing(true);
    const pos = getMousePos(e);
    setCurrentAction({
      tool: activeTool,
      points: [pos],
      color: activeTool === 'eraser' ? '#ffffff' : brushColor,
      size: activeTool === 'eraser' ? brushSize * 2 : brushSize,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction) return;
    
    const pos = getMousePos(e);
    setCurrentAction({
      ...currentAction,
      points: [...currentAction.points, pos],
    });

    // Draw current action immediately
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      drawAction(ctx, { ...currentAction, points: [...currentAction.points, pos] });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentAction) return;
    
    setIsDrawing(false);
    setActions([...actions, currentAction]);
    setCurrentAction(null);
  };

  const handleToolClick = (tool: Tool) => {
    setActiveTool(tool);
  };

  const handleUndo = () => {
    if (actions.length > 0) {
      setActions(actions.slice(0, -1));
    }
  };

  const handleClear = () => {
    // Clear all recorded actions
    setActions([]);

    // Cancel any pending auto-save since we're handling save manually
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas to a blank state
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Persist the cleared state so parents (and the backend) stop seeing the old drawing
    if (onSave) {
      const pngUrl = canvas.toDataURL('image/png');
      const jsonData = JSON.stringify({ actions: [], backgroundImage: null });
      onSave(pngUrl, jsonData);
    }

    setIsSaved(true);
  };

  const tools = [
    { id: 'select' as Tool, icon: '↖', label: 'Select' },
    { id: 'brush' as Tool, icon: '✎', label: 'Brush' },
    { id: 'line' as Tool, icon: '/', label: 'Line' },
    { id: 'circle' as Tool, icon: '○', label: 'Circle' },
    { id: 'eraser' as Tool, icon: '⌫', label: 'Eraser' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
        {/* Tools */}
        <div className="flex gap-1">
          {tools.map(tool => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleToolClick(tool.id)}
              title={tool.label}
            >
              {tool.icon}
            </Button>
          ))}
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Color Picker */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Color:</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => setBrushColor(e.target.value)}
            className="w-10 h-10 rounded border border-border cursor-pointer"
          />
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Size:</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground w-6">{brushSize}</span>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Actions */}
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={handleUndo}>
            Undo
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear
          </Button>
          
          {/* Auto-save status indicator */}
          {actions.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {isSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Saved</span>
                </>
              ) : (
                <span>Saving...</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="border border-border rounded-lg shadow-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair"
        />
      </div>
    </div>
  );
}
