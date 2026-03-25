"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<string>("");
  const [rendered, setRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: isDark
            ? {
                primaryColor: "#2563eb",
                primaryTextColor: "#e2e8f0",
                primaryBorderColor: "#3b82f6",
                lineColor: "#64748b",
                secondaryColor: "#1e293b",
                tertiaryColor: "#0f172a",
                background: "#0f172a",
                mainBkg: "#1e293b",
                nodeBorder: "#3b82f6",
                clusterBkg: "#1e293b",
                clusterBorder: "#334155",
                titleColor: "#e2e8f0",
                edgeLabelBackground: "#1e293b",
                nodeTextColor: "#e2e8f0",
              }
            : {
                primaryColor: "#2563eb",
                primaryTextColor: "#1e293b",
                primaryBorderColor: "#1d4ed8",
                lineColor: "#64748b",
                secondaryColor: "#eff6ff",
                tertiaryColor: "#dbeafe",
                background: "#ffffff",
                mainBkg: "#eff6ff",
                nodeBorder: "#2563eb",
                clusterBkg: "#f8fafc",
                clusterBorder: "#cbd5e1",
                titleColor: "#1e293b",
                edgeLabelBackground: "#ffffff",
                nodeTextColor: "#1e293b",
              },
          fontFamily:
            "IBM Plex Sans, ui-sans-serif, system-ui, -apple-system, sans-serif",
          flowchart: { curve: "basis", padding: 16 },
          sequence: { mirrorActors: false },
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { svg } = await mermaid.render(id, chart.trim());
        if (cancelled) return;
        svgRef.current = svg;
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector("svg");
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
                  el.id;
                setSelectedElement((prev) => (prev === text ? null : text));
              });
            });
          }
        }
        setRendered(true);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Mermaid render failed");
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  useEffect(() => {
    const obs = new MutationObserver(() => {
      if (!containerRef.current || !rendered) return;
      const mermaidImport = import("mermaid");
      mermaidImport.then(({ default: mermaid }) => {
        const isDark = document.documentElement.classList.contains("dark");
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "default",
          themeVariables: isDark
            ? {
                primaryColor: "#2563eb",
                primaryTextColor: "#e2e8f0",
                primaryBorderColor: "#3b82f6",
                lineColor: "#64748b",
                secondaryColor: "#1e293b",
                tertiaryColor: "#0f172a",
                background: "#0f172a",
                mainBkg: "#1e293b",
                nodeBorder: "#3b82f6",
                clusterBkg: "#1e293b",
                clusterBorder: "#334155",
                titleColor: "#e2e8f0",
                edgeLabelBackground: "#1e293b",
                nodeTextColor: "#e2e8f0",
              }
            : {
                primaryColor: "#2563eb",
                primaryTextColor: "#1e293b",
                primaryBorderColor: "#1d4ed8",
                lineColor: "#64748b",
                secondaryColor: "#eff6ff",
                tertiaryColor: "#dbeafe",
                background: "#ffffff",
                mainBkg: "#eff6ff",
                nodeBorder: "#2563eb",
                clusterBkg: "#f8fafc",
                clusterBorder: "#cbd5e1",
                titleColor: "#1e293b",
                edgeLabelBackground: "#ffffff",
                nodeTextColor: "#1e293b",
              },
          fontFamily:
            "IBM Plex Sans, ui-sans-serif, system-ui, -apple-system, sans-serif",
          flowchart: { curve: "basis", padding: 16 },
        });
        const id = `mermaid-re-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        mermaid.render(id, chart.trim()).then(({ svg }) => {
          svgRef.current = svg;
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            const svgEl = containerRef.current.querySelector("svg");
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
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, [chart, rendered]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
      } else {
        setPan((p) => ({
          x: p.x - e.deltaX,
          y: p.y - e.deltaY,
        }));
      }
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        setDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [pan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [dragging, dragStart]
  );

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedElement(null);
  }, []);

  const fitToView = useCallback(() => {
    if (!viewportRef.current || !containerRef.current) return;
    const svgEl = containerRef.current.querySelector("svg");
    if (!svgEl) return;
    const vp = viewportRef.current.getBoundingClientRect();
    const svgBB = svgEl.getBBox();
    const scaleX = (vp.width - 48) / svgBB.width;
    const scaleY = (vp.height - 48) / svgBB.height;
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM);
    setZoom(Math.max(MIN_ZOOM, newZoom));
    setPan({ x: 0, y: 0 });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => !f);
    if (!fullscreen) {
      setTimeout(fitToView, 50);
    }
  }, [fullscreen, fitToView]);

  const exportSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, "diagram.svg");
    setExportMenuOpen(false);
  }, []);

  const exportPNG = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgEl = containerRef.current?.querySelector("svg");
    if (!svgEl) return;
    const bb = svgEl.getBBox();
    const width = Math.max(bb.width + 40, 800);
    const height = Math.max(bb.height + 40, 400);
    const scale = 2;

    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(scale, scale);
    const isDark = document.documentElement.classList.contains("dark");
    ctx.fillStyle = isDark ? "#0f172a" : "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const img = new Image();
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 20, 20, width - 40, height - 40);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, "diagram.png");
      }, "image/png");
    };
    img.src = url;
    setExportMenuOpen(false);
  }, []);

  const exportPDF = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const isDark = document.documentElement.classList.contains("dark");
    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${title ?? "Diagram"}</title>
<style>
  body { margin: 20px; background: ${isDark ? "#0f172a" : "#fff"}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
  svg { max-width: 100%; height: auto; }
  @media print { body { margin: 0; } }
</style></head><body>${svg}</body></html>`);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
    setExportMenuOpen(false);
  }, [title]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (fullscreen) setFullscreen(false);
        else if (selectedElement) setSelectedElement(null);
        else if (exportMenuOpen) setExportMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
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
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
            title="Zoom in"
            className="mmd-btn"
          >
            <ZoomInIcon />
          </button>
          <span className="mmd-zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
            title="Zoom out"
            className="mmd-btn"
          >
            <ZoomOutIcon />
          </button>
          <button
            type="button"
            onClick={fitToView}
            title="Fit to view"
            className="mmd-btn"
          >
            <FitIcon />
          </button>
          <button
            type="button"
            onClick={resetView}
            title="Reset view"
            className="mmd-btn"
          >
            <ResetIcon />
          </button>
          <div className="mmd-separator" />
          <button
            type="button"
            onClick={toggleFullscreen}
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="mmd-btn"
          >
            {fullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
          <div className="mmd-export-wrapper">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExportMenuOpen((o) => !o);
              }}
              title="Export"
              className="mmd-btn"
            >
              <ExportIcon />
            </button>
            {exportMenuOpen && (
              <div className="mmd-export-menu" onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={exportSVG}>
                  SVG
                </button>
                <button type="button" onClick={exportPNG}>
                  PNG
                </button>
                <button type="button" onClick={exportPDF}>
                  PDF (Print)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="mmd-element-info">
          <span>{selectedElement}</span>
          <button
            type="button"
            onClick={() => setSelectedElement(null)}
            className="mmd-btn mmd-btn-sm"
          >
            <CloseIcon />
          </button>
        </div>
      )}

      <div
        ref={viewportRef}
        className="mmd-viewport"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          ref={containerRef}
          className="mmd-canvas"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
          }}
          onClick={() => setSelectedElement(null)}
        />
        {!rendered && (
          <div className="mmd-loading">
            <div className="mmd-spinner" />
          </div>
        )}
      </div>

      <div className="mmd-hints">
        Scroll to pan &middot; Ctrl+scroll to zoom &middot; Drag to pan &middot;
        Click element to inspect &middot; Esc to close
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
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <line x1="11" y1="11" x2="14.5" y2="14.5" />
      <line x1="5" y1="7" x2="9" y2="7" />
      <line x1="7" y1="5" x2="7" y2="9" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="5" />
      <line x1="11" y1="11" x2="14.5" y2="14.5" />
      <line x1="5" y1="7" x2="9" y2="7" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="10" height="10" rx="1" />
      <polyline points="6,3 6,1 1,1 1,6 3,6" />
      <polyline points="10,13 10,15 15,15 15,10 13,10" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8a6 6 0 0 1 10.47-4" />
      <path d="M14 8a6 6 0 0 1-10.47 4" />
      <polyline points="2,3 2,8 7,8" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="10,1 15,1 15,6" />
      <polyline points="6,15 1,15 1,10" />
      <line x1="15" y1="1" x2="9" y2="7" />
      <line x1="1" y1="15" x2="7" y2="9" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,10 1,13 1,10" />
      <polyline points="12,6 15,3 15,6" />
      <line x1="1" y1="10" x2="6" y2="5" />
      <line x1="15" y1="6" x2="10" y2="11" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1v9" />
      <polyline points="4,6 8,10 12,6" />
      <path d="M2 13h12" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="2" x2="10" y2="10" />
      <line x1="10" y1="2" x2="2" y2="10" />
    </svg>
  );
}
