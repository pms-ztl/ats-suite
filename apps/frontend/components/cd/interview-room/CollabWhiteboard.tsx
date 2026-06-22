"use client";
// Module D — collaborative whiteboard. Strokes live in the shared Y.Doc's "wb"
// array, so drawings (architectures, system designs, flowcharts) sync live and
// persist into the interview record. A lightweight canvas (no heavy dep) that
// rasterizes to PNG for the PDF export bundle. Exposes toDataURL() imperatively.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import * as Y from "yjs";

interface Stroke { points: number[][]; color: string; width: number }
export interface WhiteboardHandle { toDataURL: () => string | null }

const COLORS = ["#e6edf3", "#ff6b6b", "#4dd4ac", "#ffd166", "#7aa2ff"];

export const CollabWhiteboard = forwardRef<WhiteboardHandle, { doc: Y.Doc; editable?: boolean }>(
  function CollabWhiteboard({ doc, editable = true }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawing = useRef(false);
    const current = useRef<Stroke | null>(null);
    const [color, setColor] = useState(COLORS[1]);
    const [width, setWidth] = useState(3);

    useImperativeHandle(ref, () => ({
      toDataURL: () => { try { return canvasRef.current?.toDataURL("image/png") ?? null; } catch { return null; } },
    }));

    const yStrokes = doc.getArray<Stroke>("wb");

    const redraw = () => {
      const cv = canvasRef.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const all = yStrokes.toArray();
      const draw = (s: Stroke) => {
        if (!s.points || s.points.length < 1) return;
        ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath();
        s.points.forEach((p, i) => { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
        ctx.stroke();
      };
      for (const s of all) draw(s);
      if (current.current) draw(current.current);
    };

    useEffect(() => {
      redraw();
      const obs = () => redraw();
      yStrokes.observe(obs);
      return () => yStrokes.unobserve(obs);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doc]);

    const pos = (e: React.PointerEvent) => {
      const cv = canvasRef.current!; const r = cv.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * cv.width, ((e.clientY - r.top) / r.height) * cv.height];
    };
    const onDown = (e: React.PointerEvent) => {
      if (!editable) return;
      drawing.current = true;
      current.current = { points: [pos(e)], color: color!, width };
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const onMove = (e: React.PointerEvent) => {
      if (!drawing.current || !current.current) return;
      current.current.points.push(pos(e));
      redraw();
    };
    const onUp = () => {
      if (!drawing.current || !current.current) return;
      drawing.current = false;
      if (current.current.points.length > 1) yStrokes.push([current.current]);
      current.current = null;
      redraw();
    };
    const clearAll = () => { yStrokes.delete(0, yStrokes.length); redraw(); };

    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {editable && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderBottom: "1px solid var(--line,#2a2a2a)" }}>
            {COLORS.map((c) => (
              <button key={c} aria-label={`color ${c}`} onClick={() => setColor(c)}
                style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: color === c ? "2px solid #fff" : "2px solid transparent", cursor: "pointer" }} />
            ))}
            <input type="range" min={1} max={10} value={width} onChange={(e) => setWidth(Number(e.target.value))} aria-label="stroke width" />
            <button onClick={clearAll} style={{ marginLeft: "auto", fontSize: 12, background: "transparent", color: "inherit", border: "1px solid var(--line,#2a2a2a)", borderRadius: 6, padding: "3px 10px", cursor: "pointer" }}>Clear</button>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            style={{ width: "100%", height: "100%", touchAction: "none", cursor: editable ? "crosshair" : "default", background: "#0d1117" }}
          />
        </div>
      </div>
    );
  },
);
