"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;

function getMermaidTheme(isDark: boolean) {
  return {
    startOnLoad: false,
    theme: "base" as const,
    themeVariables: isDark
      ? {
          primaryColor: "#1e293b",
          primaryTextColor: "#e2e8f0",
          primaryBorderColor: "#475569",
          lineColor: "#64748b",
          secondaryColor: "#1e293b",
          tertiaryColor: "#0f172a",
          background: "#0f172a",
          mainBkg: "#1e293b",
          nodeBorder: "#475569",
          clusterBkg: "#0f172a",
          clusterBorder: "#334155",
          titleColor: "#e2e8f0",
          edgeLabelBackground: "#1e293b",
          nodeTextColor: "#e2e8f0",
        }
      : {
          primaryColor: "#f1f5f9",
          primaryTextColor: "#1e293b",
          primaryBorderColor: "#cbd5e1",
          lineColor: "#94a3b8",
          secondaryColor: "#f8fafc",
          tertiaryColor: "#e2e8f0",
          background: "#ffffff",
          mainBkg: "#f1f5f9",
          nodeBorder: "#cbd5e1",
          clusterBkg: "#f8fafc",
          clusterBorder: "#e2e8f0",
          titleColor: "#1e293b",
          edgeLabelBackground: "#ffffff",
          nodeTextColor: "#1e293b",
        },
    fontFamily:
      "IBM Plex Sans, ui-sans-serif, system-ui, -apple-system, sans-serif",
    flowchart: { curve: "basis", padding: 16 },
    sequence: { mirrorActors: false },
  } as Record<string, unknown>;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgSourceRef = useRef("");
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
    zoom: 1,
  });

  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomDisplay, setZoomDisplay] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  function applyTransform() {
    const d = dragRef.current;
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${d.panX}px, ${d.panY}px) scale(${d.zoom})`;
    }
    setZoomDisplay(Math.round(d.zoom * 100));
  }

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize(getMermaidTheme(isDark));
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (cancelled) return;
        svgSourceRef.current = svg;
        if (canvasRef.current) {
          canvasRef.current.innerHTML = svg;
          const svgEl = canvasRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "100%";
            svgEl.style.maxWidth = "none";
            svgEl.removeAttribute("height");
            svgEl.querySelectorAll(".node, .cluster, .edgePath").forEach((el) => {
              (el as HTMLElement).style.cursor = "pointer";
              el.addEventListener("click", (e) => {
                e.stopPropagation();
                const text =
                  el.querySelector(".nodeLabel")?.textContent ??
                  el.querySelector("text")?.textContent ??
                  (el as HTMLElement).id;
                setSelectedElement((prev) => (prev === text ? null : text));
              });
            });
          }
        }
        setRendered(true);
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Mermaid render failed");
      }
    }
    render();
    return () => { cancelled = true; };
  }, [chart]);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (!canvasRef.current || !rendered) return;
      import("mermaid").then(({ default: mermaid }) => {
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize(getMermaidTheme(isDark));
        const id = `mermaid-re-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        mermaid.render(id, chart.trim()).then(({ svg }) => {
          svgSourceRef.current = svg;
          if (canvasRef.current) {
            canvasRef.current.innerHTML = svg;
            const svgEl = canvasRef.current.querySelector("svg");
            if (svgEl) {
              svgEl.style.width = "100%";
              svgEl.style.height = "100%";
              svgEl.style.maxWidth = "none";
              svgEl.removeAttribute("height");
            }
          }
        });
      });
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [chart, rendered]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = dragRef.current;
      if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        d.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, d.zoom + delta));
      } else {
        d.panX -= e.deltaX * 0.8;
        d.panY -= e.deltaY * 0.8;
      }
      applyTransform();
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const d = dragRef.current;
      d.active = true;
      d.startX = e.clientX - d.panX;
      d.startY = e.clientY - d.panY;
      vp.setPointerCapture(e.pointerId);
      vp.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      d.panX = e.clientX - d.startX;
      d.panY = e.clientY - d.startY;
      applyTransform();
    };

    const onUp = (e: PointerEvent) => {
      const d = dragRef.current;
      d.active = false;
      vp.releasePointerCapture(e.pointerId);
      vp.style.cursor = "grab";
    };

    vp.addEventListener("wheel", onWheel, { passive: false });
    vp.addEventListener("pointerdown", onDown);
    vp.addEventListener("pointermove", onMove);
    vp.addEventListener("pointerup", onUp);
    vp.addEventListener("pointercancel", onUp);

    return () => {
      vp.removeEventListener("wheel", onWheel);
      vp.removeEventListener("pointerdown", onDown);
      vp.removeEventListener("pointermove", onMove);
      vp.removeEventListener("pointerup", onUp);
      vp.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const resetView = useCallback(() => {
    dragRef.current.zoom = 1;
    dragRef.current.panX = 0;
    dragRef.current.panY = 0;
    applyTransform();
    setSelectedElement(null);
  }, []);

  const fitToView = useCallback(() => {
    if (!viewportRef.current || !canvasRef.current) return;
    const svgEl = canvasRef.current.querySelector("svg");
    if (!svgEl) return;
    const vp = viewportRef.current.getBoundingClientRect();
    const bb = svgEl.getBBox();
    const scaleX = (vp.width - 48) / bb.width;
    const scaleY = (vp.height - 48) / bb.height;
    dragRef.current.zoom = Math.max(MIN_ZOOM, Math.min(scaleX, scaleY, MAX_ZOOM));
    dragRef.current.panX = 0;
    dragRef.current.panY = 0;
    applyTransform();
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => {
      if (!f) setTimeout(fitToView, 50);
      return !f;
    });
  }, [fitToView]);

  const exportSVG = useCallback(() => {
    if (!svgSourceRef.current) return;
    downloadBlob(new Blob([svgSourceRef.current], { type: "image/svg+xml" }), "diagram.svg");
    setExportMenuOpen(false);
  }, []);

  const exportPNG = useCallback(() => {
    const svg = svgSourceRef.current;
    const svgEl = canvasRef.current?.querySelector("svg");
    if (!svg || !svgEl) return;
    const bb = svgEl.getBBox();
    const w = Math.max(bb.width + 40, 800);
    const h = Math.max(bb.height + 40, 400);
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    const isDark = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, w, h);
    const img = new Image();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 20, 20, w - 40, h - 40);
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => { if (b) downloadBlob(b, "diagram.png"); }, "image/png");
    };
    img.src = url;
    setExportMenuOpen(false);
  }, []);

  const exportPDF = useCallback(() => {
    const svg = svgSourceRef.current;
    if (!svg) return;
    const isDark = document.documentElement.classList.contains("dark");
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(`<!DOCTYPE html><html><head><title>${title ?? "Diagram"}</title>
<style>body{margin:20px;background:${isDark ? "#0f172a" : "#fff"};display:flex;justify-content:center;align-items:center;min-height:100vh}svg{max-width:100%;height:auto}@media print{body{margin:0}}</style>
</head><body>${svg}</body></html>`);
    pw.document.close();
    setTimeout(() => pw.print(), 300);
    setExportMenuOpen(false);
  }, [title]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fullscreen) setFullscreen(false);
      else if (selectedElement) setSelectedElement(null);
      else if (exportMenuOpen) setExportMenuOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [fullscreen, selectedElement, exportMenuOpen]);

  useEffect(() => {
    if (!exportMenuOpen) return;
    const close = () => setExportMenuOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [exportMenuOpen]);

  if (error) {
    return (
      <div className="mmd-error">
        <pre>{chart}</pre>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`mmd-wrapper ${fullscreen ? "mmd-fullscreen" : ""}`}>
      <div className="mmd-toolbar">
        {title && <span className="mmd-title">{title}</span>}
        <div className="mmd-toolbar-actions">
          <button type="button" onClick={() => { dragRef.current.zoom = Math.min(MAX_ZOOM, dragRef.current.zoom + ZOOM_STEP); applyTransform(); }} title="Zoom in" className="mmd-btn"><ZoomInIcon /></button>
          <span className="mmd-zoom-label">{zoomDisplay}%</span>
          <button type="button" onClick={() => { dragRef.current.zoom = Math.max(MIN_ZOOM, dragRef.current.zoom - ZOOM_STEP); applyTransform(); }} title="Zoom out" className="mmd-btn"><ZoomOutIcon /></button>
          <button type="button" onClick={fitToView} title="Fit to view" className="mmd-btn"><FitIcon /></button>
          <button type="button" onClick={resetView} title="Reset view" className="mmd-btn"><ResetIcon /></button>
          <div className="mmd-separator" />
          <button type="button" onClick={toggleFullscreen} title={fullscreen ? "Exit fullscreen" : "Fullscreen"} className="mmd-btn">{fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}</button>
          <div className="mmd-export-wrapper">
            <button type="button" onClick={(e) => { e.stopPropagation(); setExportMenuOpen((o) => !o); }} title="Export" className="mmd-btn"><ExportIcon /></button>
            {exportMenuOpen && (
              <div className="mmd-export-menu" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={exportSVG}>SVG</button>
                <button type="button" onClick={exportPNG}>PNG</button>
                <button type="button" onClick={exportPDF}>PDF (Print)</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="mmd-element-info">
          <span>{selectedElement}</span>
          <button type="button" onClick={() => setSelectedElement(null)} className="mmd-btn mmd-btn-sm"><CloseIcon /></button>
        </div>
      )}

      <div ref={viewportRef} className="mmd-viewport" style={{ cursor: "grab", touchAction: "none" }}>
        <div ref={canvasRef} className="mmd-canvas" onClick={() => setSelectedElement(null)} />
        {!rendered && <div className="mmd-loading"><div className="mmd-spinner" /></div>}
      </div>

      <div className="mmd-hints">
        Scroll to pan &middot; Ctrl+scroll to zoom &middot; Drag to pan &middot; Click element to inspect &middot; Esc to close
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ZoomInIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><line x1="11" y1="11" x2="14.5" y2="14.5" /><line x1="5" y1="7" x2="9" y2="7" /><line x1="7" y1="5" x2="7" y2="9" /></svg>);
}
function ZoomOutIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><line x1="11" y1="11" x2="14.5" y2="14.5" /><line x1="5" y1="7" x2="9" y2="7" /></svg>);
}
function FitIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="10" height="10" rx="1" /><polyline points="6,3 6,1 1,1 1,6 3,6" /><polyline points="10,13 10,15 15,15 15,10 13,10" /></svg>);
}
function ResetIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8a6 6 0 0 1 10.47-4" /><path d="M14 8a6 6 0 0 1-10.47 4" /><polyline points="2,3 2,8 7,8" /></svg>);
}
function FullscreenIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="10,1 15,1 15,6" /><polyline points="6,15 1,15 1,10" /><line x1="15" y1="1" x2="9" y2="7" /><line x1="1" y1="15" x2="7" y2="9" /></svg>);
}
function ExitFullscreenIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4,10 1,13 1,10" /><polyline points="12,6 15,3 15,6" /><line x1="1" y1="10" x2="6" y2="5" /><line x1="15" y1="6" x2="10" y2="11" /></svg>);
}
function ExportIcon() {
  return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 1v9" /><polyline points="4,6 8,10 12,6" /><path d="M2 13h12" /></svg>);
}
function CloseIcon() {
  return (<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10" /><line x1="10" y1="2" x2="2" y2="10" /></svg>);
}
