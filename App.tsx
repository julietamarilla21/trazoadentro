import { useEffect, useRef, useState } from "react";
import { standaloneHtml } from "./standalone";

type Step = "first" | "breath" | "second" | "reflection";
type ColorProfile = {
  warm: number;
  cool: number;
  coverage: number;
  colors: string[];
};

const COLORS = ["#c76e55", "#e7b75d", "#718b75", "#637a9c", "#8e7188", "#302e33"];

const ARENA_PROMPT = `Crea una aplicación web responsive, en español, de arte y meditación llamada “Trazo adentro”. Entrégala como un único archivo HTML descargable, autónomo y funcional, con CSS y JavaScript incluidos y sin dependencias externas.

PROPÓSITO
Una experiencia íntima para dibujar antes y después de una respiración guiada, observar ambos dibujos sin juzgar y escribir una reflexión personal. El análisis es simbólico y educativo, nunca un diagnóstico psicológico.

FLUJO
1. Dibujo inicial: permitir dibujar con mouse, lápiz o pantalla táctil en una pizarra digital, elegir color y grosor, borrar, y subir una imagen desde el dispositivo. No exigir una obra terminada.
2. Respiración guiada: ejercicio interactivo de dos minutos con animación orgánica y amable. Guiar inhalación de 4 segundos, pausa suave de 2 y exhalación de 6. Incluir comenzar, pausar, reanudar, progreso y opción de continuar antes.
3. Dibujo final: volver a ofrecer lienzo, carga de imagen, colores y borrado.
4. Contraste y reflexión: comparar las dos imágenes lado a lado; mostrar pistas prudentes de psicología del color y semiótica visual (tonos, uso del espacio y gestualidad), explicar que no hay significados universales ni inferencias clínicas, y cerrar con una pregunta abierta para que cada persona escriba su propia lectura.
5. Compartir: permitir compartir o copiar una reflexión sin subir ni almacenar los dibujos. Añadir una pequeña selección de videos de meditación en YouTube y un enlace al canal oficial de Headspace.

DIRECCIÓN VISUAL
Diseño editorial, cálido, sereno y original: fondo marfil, tinta berenjena/verde oscuro, acentos terracota y salvia, tipografía expresiva con alta legibilidad, mucho aire y formas orgánicas. Inspiración en una guía de meditación acogedora, sin copiar la marca, personajes ni ilustraciones de Headspace. Evitar dashboards, exceso de tarjetas, métricas y adornos flotantes. La pizarra debe sentirse amplia y protagonista. Animaciones lentas y útiles, con soporte para prefers-reduced-motion.

REQUISITOS
Accesible por teclado, etiquetas claras, responsive en móvil y escritorio, botones reales, manejo de errores de carga, privacidad local, estados vacíos cuidados y navegación clara entre etapas. La descarga HTML debe seguir funcionando al abrir el archivo localmente. Genera la aplicación completa, no solo una maqueta.`;

const JOURNEY: { id: Step; label: string }[] = [
  { id: "first", label: "Dibuja" },
  { id: "breath", label: "Respira" },
  { id: "second", label: "Dibuja otra vez" },
  { id: "reflection", label: "Reflexiona" },
];

function Icon({
  name,
  size = 18,
  strokeWidth = 1.8,
}: {
  name: "arrow" | "upload" | "download" | "play" | "pause" | "copy" | "close" | "trash" | "external" | "spark" | "share" | "check";
  size?: number;
  strokeWidth?: number;
}) {
  const paths: Record<typeof name, React.ReactNode> = {
    arrow: <><path d="M4.5 12h14" /><path d="m12.5 5.5 6.5 6.5-6.5 6.5" /></>,
    upload: <><path d="M12 15V3.8" /><path d="m7.5 8.3 4.5-4.5 4.5 4.5" /><path d="M4.5 14.5v4a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4" /></>,
    download: <><path d="M12 3.5v11" /><path d="m7.5 10 4.5 4.5 4.5-4.5" /><path d="M4.5 16.5v2a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2" /></>,
    play: <path d="m8.2 5.6 10.3 5.7a.8.8 0 0 1 0 1.4L8.2 18.4a.8.8 0 0 1-1.2-.7V6.3a.8.8 0 0 1 1.2-.7Z" fill="currentColor" stroke="none" />,
    pause: <><path d="M8.5 5.5v13" /><path d="M15.5 5.5v13" /></>,
    copy: <><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2" /></>,
    close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
    trash: <><path d="M4.5 7h15" /><path d="m7 7 .8 12h8.4L17 7" /><path d="M9.5 7V4.5h5V7" /><path d="M10 10.5v5" /><path d="M14 10.5v5" /></>,
    external: <><path d="M13 5h6v6" /><path d="m19 5-9 9" /><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" /></>,
    spark: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
    share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.5" /><path d="m8.2 13.2 7.6 4.5" /></>,
    check: <path d="m5 12.5 4.4 4.3L19 7" />,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function getPoint(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
  };
}

function CanvasBoard({
  value,
  onChange,
  label,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawingRef = useRef(false);
  const lastEmittedRef = useRef<string | null>(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [hasDrawing, setHasDrawing] = useState(Boolean(value));

  useEffect(() => {
    if (!value || value === lastEmittedRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      lastEmittedRef.current = value;
      setHasDrawing(true);
    };
    image.src = value;
  }, [value]);

  function emitDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawing = canvas.toDataURL("image/png");
    lastEmittedRef.current = drawing;
    onChange(drawing);
  }

  function startStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const point = getPoint(event, canvas);
    drawingRef.current = true;
    setHasDrawing(true);
    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
  }

  function continueStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const point = getPoint(event, canvas);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function finishStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    emitDrawing();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    lastEmittedRef.current = null;
    setHasDrawing(false);
    onChange(null);
  }

  function loadFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const image = new Image();
      image.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        lastEmittedRef.current = null;
        setHasDrawing(true);
        emitDrawing();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="canvas-panel">
      <div className="canvas-toolbar">
        <div className="palette-control">
          <span className="tool-label">Color</span>
          <div className="palette" role="group" aria-label="Elige un color">
            {COLORS.map((swatch) => (
              <button
                aria-label={`Elegir color ${swatch}`}
                aria-pressed={color === swatch}
                className={`color-swatch ${color === swatch ? "selected" : ""}`}
                key={swatch}
                onClick={() => setColor(swatch)}
                style={{ "--swatch": swatch } as React.CSSProperties}
                type="button"
              />
            ))}
          </div>
        </div>
        <label className="brush-control">
          <span className="tool-label">Trazo</span>
          <input
            aria-label="Grosor del trazo"
            max="24"
            min="2"
            onChange={(event) => setBrushSize(Number(event.target.value))}
            type="range"
            value={brushSize}
          />
        </label>
        <div className="canvas-actions">
          <button className="icon-tool" onClick={clearCanvas} type="button">
            <Icon name="trash" size={16} />
            <span>Limpiar</span>
          </button>
          <input
            accept="image/*"
            className="visually-hidden"
            onChange={(event) => {
              loadFile(event.target.files?.[0]);
              event.target.value = "";
            }}
            ref={fileRef}
            type="file"
          />
          <button className="upload-tool" onClick={() => fileRef.current?.click()} type="button">
            <Icon name="upload" size={16} />
            <span>Subir dibujo</span>
          </button>
        </div>
      </div>
      <div className="canvas-workspace">
        <canvas
          aria-label={label}
          className="drawing-canvas"
          height="760"
          onPointerCancel={finishStroke}
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={finishStroke}
          ref={canvasRef}
          width="1240"
        />
        {!hasDrawing && (
          <div className="canvas-empty" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1.1" />
              <path d="M32 5v8M32 51v8M5 32h8M51 32h8M13 13l6 6M45 45l6 6M51 13l-6 6M19 45l-6 6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="32" cy="32" r="4" fill="currentColor" />
            </svg>
            <span>Deja que aparezca la primera línea</span>
          </div>
        )}
      </div>
      <div className="canvas-caption">
        <span>Un trazo también cuenta.</span>
        <span>Tu dibujo se queda en este dispositivo.</span>
      </div>
    </div>
  );
}

function Header({
  step,
  onPrompt,
  onDownload,
}: {
  step: Step;
  onPrompt: () => void;
  onDownload: () => void;
}) {
  const currentIndex = JOURNEY.findIndex((item) => item.id === step);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a aria-label="Trazo adentro, inicio" className="brand-lockup" href="#inicio">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 42 42" fill="none">
              <circle cx="21" cy="21" r="19" fill="#E9B890" />
              <path d="M13 25c2.8-6.4 7.8-9.2 15-8.6-2.4 7-7.3 10.2-15 8.6Z" stroke="#433A43" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 28c3.7-2.4 7.4-5.8 11.1-10.2" stroke="#433A43" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="30.5" cy="11.5" r="2.2" fill="#FCF7EF" />
            </svg>
          </span>
          <span className="brand-type"><strong>trazo</strong><small>adentro</small></span>
        </a>

        <nav className="journey-nav" aria-label="Etapas de la experiencia">
          <ol>
            {JOURNEY.map((item, index) => (
              <li className={`${index === currentIndex ? "current" : ""} ${index < currentIndex ? "complete" : ""}`} key={item.id}>
                <span className="journey-number">{index < currentIndex ? <Icon name="check" size={13} /> : `0${index + 1}`}</span>
                <span className="journey-label">{item.label}</span>
                {index < JOURNEY.length - 1 && <span aria-hidden="true" className="journey-line" />}
              </li>
            ))}
          </ol>
        </nav>

        <div className="header-actions">
          <button className="prompt-button" onClick={onPrompt} type="button">Prompt para Arena</button>
          <button className="download-button" onClick={onDownload} type="button">
            <Icon name="download" size={16} />
            <span>Descargar HTML</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function getColorProfile(source: string): Promise<ColorProfile> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 96;
      canvas.height = 60;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve({ warm: 0, cool: 0, coverage: 0, colors: [] });
        return;
      }
      context.fillStyle = "#fffdf8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
      let warm = 0;
      let cool = 0;
      let marked = 0;

      for (let i = 0; i < pixels.length; i += 20) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : (max - min) / max;
        const isPaper = r > 247 && g > 245 && b > 238;
        if (isPaper) continue;
        marked += 1;

        let hue = 0;
        if (max !== min) {
          if (max === r) hue = ((g - b) / (max - min)) % 6;
          else if (max === g) hue = (b - r) / (max - min) + 2;
          else hue = (r - g) / (max - min) + 4;
          hue *= 60;
          if (hue < 0) hue += 360;
        }
        if (saturation > 0.16 && (hue < 60 || hue >= 335)) warm += 1;
        if (saturation > 0.16 && hue >= 160 && hue <= 275) cool += 1;

        const key = [r, g, b].map((channel) => Math.round(channel / 48)).join("-");
        const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
        bucket.count += 1;
        bucket.r += r;
        bucket.g += g;
        bucket.b += b;
        buckets.set(key, bucket);
      }

      const colors = [...buckets.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map((bucket) => `rgb(${Math.round(bucket.r / bucket.count)}, ${Math.round(bucket.g / bucket.count)}, ${Math.round(bucket.b / bucket.count)})`);
      const total = Math.max(warm + cool, 1);
      resolve({ warm: warm / total, cool: cool / total, coverage: marked / (pixels.length / 4), colors });
    };
    image.onerror = () => resolve({ warm: 0, cool: 0, coverage: 0, colors: [] });
    image.src = source;
  });
}

function describePalette(profile: ColorProfile | null) {
  if (!profile || (!profile.warm && !profile.cool)) return "Una paleta abierta";
  if (profile.warm > profile.cool + 0.12) return "Más tonos cálidos";
  if (profile.cool > profile.warm + 0.12) return "Más tonos fríos";
  return "Gama equilibrada";
}

function buildColorReflection(before: ColorProfile | null, after: ColorProfile | null) {
  if (!before || !after) {
    return "Observa qué colores vuelven, cuáles aparecen por primera vez y qué sensaciones despiertan en ti. En algunas lecturas simbólicas, los cálidos sugieren energía o cercanía y los fríos pueden evocar pausa o amplitud; el sentido final siempre es personal.";
  }

  const warmthShift = after.warm - before.warm;
  let colorReading = "La mezcla de tonos se mantiene bastante pareja. Quizá el cambio vive en un detalle, una forma o en lo que ahora notas al mirar.";
  if (warmthShift > 0.12) {
    colorReading = "En el dibujo final aparecen más tonos cálidos. En algunas tradiciones del color se asocian con cercanía, impulso o vitalidad; quizá uno de esos matices te acompaña ahora, si es que te resuena.";
  } else if (warmthShift < -0.12) {
    colorReading = "En el dibujo final hay más presencia de tonos fríos. A veces se leen como pausa, distancia o amplitud; comprueba si alguna de esas palabras coincide con lo que sientes, o si para ti significan otra cosa.";
  }

  const spaceChange = after.coverage - before.coverage;
  let spaceReading = "La cantidad de espacio ocupado se parece en ambos dibujos. Mira ahora el vacío, la dirección o la presión del trazo: la semiótica visual también se construye con lo que dejamos sin dibujar.";
  if (spaceChange > 0.08) {
    spaceReading = "El segundo dibujo ocupa más espacio. En una lectura visual, llenar más la página puede sentirse como expansión o presencia; es una pista, no una regla sobre tu estado.";
  } else if (spaceChange < -0.08) {
    spaceReading = "El segundo dibujo deja más espacio libre. Ese vacío puede sentirse como descanso, reserva o simplemente una elección compositiva: solo tú puedes darle significado.";
  }

  return `${colorReading} ${spaceReading}`;
}

function PromptModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copyPrompt() {
    try {
      await copyText(ARENA_PROMPT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-scrim" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section aria-labelledby="prompt-title" aria-modal="true" className="prompt-modal" role="dialog">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">LISTO PARA COPIAR</span>
            <h2 id="prompt-title">Tu prompt para Arena</h2>
          </div>
          <button aria-label="Cerrar" className="modal-close" onClick={onClose} type="button"><Icon name="close" /></button>
        </div>
        <p className="modal-description">Describe el recorrido, el tono visual y lo que debe poder hacer. Puedes pegarlo tal cual o editarlo antes.</p>
        <textarea aria-label="Prompt para Arena" className="prompt-textarea" readOnly value={ARENA_PROMPT} />
        <div className="modal-footer">
          <span>Aplicación autónoma · Español · Responsive</span>
          <button className="primary-button" onClick={copyPrompt} type="button">
            <Icon name={copied ? "check" : "copy"} size={17} />
            {copied ? "Copiado" : "Copiar prompt"}
          </button>
        </div>
      </section>
    </div>
  );
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("No se pudo copiar el texto");
}

function downloadHtml() {
  const blob = new Blob([standaloneHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "trazo-adentro.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [step, setStep] = useState<Step>("first");
  const [firstDrawing, setFirstDrawing] = useState<string | null>(null);
  const [lastDrawing, setLastDrawing] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [firstProfile, setFirstProfile] = useState<ColorProfile | null>(null);
  const [lastProfile, setLastProfile] = useState<ColorProfile | null>(null);
  const [reflection, setReflection] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (step !== "breath" || !isBreathing) return;
    const timer = window.setInterval(() => setElapsed((value) => Math.min(value + 1, 120)), 1000);
    return () => window.clearInterval(timer);
  }, [isBreathing, step]);

  useEffect(() => {
    if (step === "breath" && elapsed >= 120) {
      setIsBreathing(false);
      setStep("second");
    }
  }, [elapsed, step]);

  useEffect(() => {
    if (step !== "reflection" || !firstDrawing || !lastDrawing) return;
    let isCurrent = true;
    Promise.all([getColorProfile(firstDrawing), getColorProfile(lastDrawing)]).then(([before, after]) => {
      if (!isCurrent) return;
      setFirstProfile(before);
      setLastProfile(after);
    });
    return () => {
      isCurrent = false;
    };
  }, [firstDrawing, lastDrawing, step]);

  const cycleSecond = elapsed % 12;
  const phase = cycleSecond < 4 ? "inhala" : cycleSecond < 6 ? "sostén" : "exhala";
  const phaseCopy = phase === "inhala" ? "Toma aire por la nariz" : phase === "sostén" ? "Quédate un instante" : "Suelta el aire despacio";
  const phaseClass = phase === "sostén" ? "hold" : phase;
  const stepIndex = JOURNEY.findIndex((item) => item.id === step);

  function startBreathing() {
    if (elapsed >= 120) setElapsed(0);
    setIsBreathing(true);
  }

  function continueToSecond() {
    setIsBreathing(false);
    setStep("second");
  }

  async function shareExperience() {
    const note = reflection.trim() ? ` Mi reflexión: ${reflection.trim()}` : " Me regalé una pausa para dibujar, respirar y volver a mirar.";
    const text = `Hice una pausa creativa con Trazo adentro.${note} No es un diagnóstico: es una forma de escucharme.`;
    setShareMessage("");
    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi pausa creativa", text });
        setShareMessage("Tu experiencia está lista para compartir.");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") setShareMessage("No se pudo abrir el menú para compartir.");
      }
      return;
    }
    try {
      await copyText(text);
      setShareMessage("Tu reflexión se copió al portapapeles.");
    } catch {
      setShareMessage("Tu navegador no permitió copiar. Puedes seleccionar el texto de tu reflexión.");
    }
  }

  function startOver() {
    setStep("first");
    setFirstDrawing(null);
    setLastDrawing(null);
    setFirstProfile(null);
    setLastProfile(null);
    setElapsed(0);
    setIsBreathing(false);
    setReflection("");
    setShareMessage("");
  }

  const reflectionCopy = buildColorReflection(firstProfile, lastProfile);

  return (
    <div className={`app-shell ${step === "breath" ? "is-breathing" : ""}`} id="inicio">
      <Header step={step} onPrompt={() => setShowPrompt(true)} onDownload={downloadHtml} />

      {step === "first" && (
        <main className="workspace-main drawing-layout">
          <section className="step-intro">
            <span className="eyebrow"><i /> UNA PAUSA CON COLOR · 01</span>
            <h1>Dibuja cómo se siente este momento.</h1>
            <p className="intro-copy">No busques que quede bonito. Deja que salgan el color, el ritmo y la forma.</p>
            <div className="intro-bottom">
              <button className="primary-button continue-button" disabled={!firstDrawing} onClick={() => { setElapsed(0); setStep("breath"); }} type="button">
                Guardar y respirar <Icon name="arrow" size={18} />
              </button>
              <p>{firstDrawing ? "Tu primera imagen ya está aquí." : "Dibuja en el lienzo o sube una imagen."}</p>
            </div>
          </section>
          <section aria-label="Primer dibujo" className="canvas-column">
            <CanvasBoard label="Lienzo para el primer dibujo" onChange={setFirstDrawing} value={firstDrawing} />
          </section>
        </main>
      )}

      {step === "breath" && (
        <main className="breathing-stage">
          <div className="breath-topline">
            <span>02 / UNA RESPIRACIÓN A LA VEZ</span>
            <button onClick={continueToSecond} type="button">Continuar sin temporizador <Icon name="arrow" size={15} /></button>
          </div>
          <div className="breathing-composition">
            <div className="breath-words">
              <span className="eyebrow light-eyebrow"><i /> UN MOMENTO PARA TI</span>
              <h1>Haz espacio<br />para lo que viene.</h1>
              <p>Suaviza los hombros. Sigue el círculo, no hace falta hacerlo perfecto.</p>
            </div>
            <div className="breath-practice">
              <div className={`breath-orb ${isBreathing ? phaseClass : "still"}`} aria-live="polite">
                <div className="orb-ring ring-one" />
                <div className="orb-ring ring-two" />
                <div className="orb-core">
                  <svg aria-hidden="true" viewBox="0 0 80 80" fill="none">
                    <path d="M22 44c4.8-12 14.3-18.2 29-18.4-4.6 13.8-14.1 20-29 18.4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                    <path d="M25 51c7.5-4.6 14.6-11.1 21.5-19.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="56" cy="22" r="3" fill="currentColor" />
                  </svg>
                </div>
              </div>
              <div className="breath-instruction">
                <span className="breath-phase">{isBreathing ? phaseCopy : "A tu propio ritmo"}</span>
                <span className="breath-count">{formatTime(elapsed)} <i /> 02:00</span>
              </div>
              <div aria-label="Progreso de la respiración" className="breath-progress" role="progressbar" aria-valuemax={120} aria-valuemin={0} aria-valuenow={elapsed}>
                <span style={{ width: `${(elapsed / 120) * 100}%` }} />
              </div>
              <button className="breath-play" onClick={() => isBreathing ? setIsBreathing(false) : startBreathing()} type="button">
                <Icon name={isBreathing ? "pause" : "play"} size={17} />
                {isBreathing ? "Pausar" : elapsed ? "Reanudar" : "Comenzar práctica"}
              </button>
              <span className="breath-method">Inhala 4 · pausa 2 · exhala 6</span>
            </div>
          </div>
          <div className="breath-bottomline"><span>Si necesitas parar, puedes hacerlo cuando quieras.</span><span>Tu ritmo es el ritmo correcto.</span></div>
        </main>
      )}

      {step === "second" && (
        <main className="workspace-main drawing-layout second-layout">
          <section className="step-intro">
            <span className="eyebrow"><i /> DESPUÉS DE RESPIRAR · 03</span>
            <h1>Vuelve al papel. ¿Qué aparece ahora?</h1>
            <p className="intro-copy">No intentes repetir el dibujo anterior. Nota lo que cambió, aunque sea apenas.</p>
            <div className="intro-bottom">
              <button className="primary-button continue-button" disabled={!lastDrawing} onClick={() => setStep("reflection")} type="button">
                Mirar mi recorrido <Icon name="arrow" size={18} />
              </button>
              <p>{lastDrawing ? "Ya tienes dos momentos para mirar." : "Tómate el tiempo que necesites."}</p>
            </div>
          </section>
          <section aria-label="Segundo dibujo" className="canvas-column">
            <CanvasBoard label="Lienzo para el dibujo después de respirar" onChange={setLastDrawing} value={lastDrawing} />
          </section>
        </main>
      )}

      {step === "reflection" && (
        <main className="reflection-main">
          <section className="reflection-heading">
            <span className="eyebrow"><i /> TU RECORRIDO · 04</span>
            <h1>Dos dibujos. Un instante para escuchar.</h1>
            <p>No hay una interpretación correcta. Observa qué notas tú antes de leer las pistas.</p>
          </section>

          <section aria-label="Comparación de dibujos" className="comparison-grid">
            <figure className="comparison-art">
              <figcaption><span><i className="art-index">01</i> Antes de respirar</span><span>{describePalette(firstProfile)}</span></figcaption>
              <div className="art-image-wrap"><img alt="Tu dibujo antes del ejercicio de respiración" src={firstDrawing ?? ""} /></div>
              <div className="art-colors" aria-label="Muestra de colores del primer dibujo">
                {(firstProfile?.colors.length ? firstProfile.colors : COLORS.slice(0, 3)).map((color, index) => <i key={`${color}-${index}`} style={{ backgroundColor: color }} />)}
              </div>
            </figure>
            <figure className="comparison-art">
              <figcaption><span><i className="art-index">02</i> Después de respirar</span><span>{describePalette(lastProfile)}</span></figcaption>
              <div className="art-image-wrap"><img alt="Tu dibujo después del ejercicio de respiración" src={lastDrawing ?? ""} /></div>
              <div className="art-colors" aria-label="Muestra de colores del segundo dibujo">
                {(lastProfile?.colors.length ? lastProfile.colors : COLORS.slice(1, 4)).map((color, index) => <i key={`${color}-${index}`} style={{ backgroundColor: color }} />)}
              </div>
            </figure>
          </section>

          <section className="reading-section">
            <div className="reading-title">
              <span className="eyebrow"><i /> UNA LECTURA ABIERTA</span>
              <h2>El color y el espacio dan pistas, no respuestas.</h2>
            </div>
            <div className="reading-copy">
              <p>{reflectionCopy}</p>
              <p className="reading-disclaimer">La psicología del color y la semiótica ofrecen asociaciones culturales, no una traducción universal de tus emociones. Esto no es un diagnóstico. Tu propia lectura tiene la última palabra.</p>
            </div>
          </section>

          <section className="personal-reflection">
            <label htmlFor="reflection-note">¿Con qué sensación llegaste y con cuál te vas?</label>
            <textarea id="reflection-note" onChange={(event) => setReflection(event.target.value)} placeholder="Al inicio me sentía... Ahora noto..." value={reflection} />
            <div className="share-line">
              <div>
                <button className="primary-button" onClick={shareExperience} type="button"><Icon name="share" size={17} /> Compartir mi experiencia</button>
                <span aria-live="polite" className="share-message">{shareMessage}</span>
              </div>
              <button className="text-button" onClick={startOver} type="button">Empezar de nuevo <Icon name="arrow" size={16} /></button>
            </div>
          </section>

          <section className="video-section">
            <div className="video-heading">
              <span className="eyebrow"><i /> SI QUIERES SEGUIR</span>
              <h2>Un poco más de calma.</h2>
              <a className="channel-link" href="https://www.youtube.com/@headspace/videos" rel="noreferrer" target="_blank">Explorar canal de Headspace <Icon name="external" size={15} /></a>
            </div>
            <div className="video-list">
              <a href="https://www.youtube.com/results?search_query=meditaci%C3%B3n+guiada+respiraci%C3%B3n+consciente+espa%C3%B1ol" rel="noreferrer" target="_blank">
                <span className="video-play"><Icon name="play" size={14} /></span><span><small>RESPIRACIÓN</small><strong>Una pausa para volver al presente</strong></span><Icon name="external" size={16} />
              </a>
              <a href="https://www.youtube.com/results?search_query=meditaci%C3%B3n+guiada+para+dormir+espa%C3%B1ol" rel="noreferrer" target="_blank">
                <span className="video-play"><Icon name="play" size={14} /></span><span><small>DESCANSO</small><strong>Soltar el día, poco a poco</strong></span><Icon name="external" size={16} />
              </a>
              <a href="https://www.youtube.com/results?search_query=escaneo+corporal+meditaci%C3%B3n+guiada+espa%C3%B1ol" rel="noreferrer" target="_blank">
                <span className="video-play"><Icon name="play" size={14} /></span><span><small>CUERPO</small><strong>Escuchar el cuerpo con amabilidad</strong></span><Icon name="external" size={16} />
              </a>
            </div>
          </section>
          <footer className="page-footer"><span>trazo adentro</span><span>Una práctica creativa, no clínica.</span></footer>
        </main>
      )}

      {showPrompt && <PromptModal onClose={() => setShowPrompt(false)} />}
      <span className="screen-reader-only" aria-live="polite">Etapa {stepIndex + 1} de 4: {JOURNEY[stepIndex]?.label}</span>
    </div>
  );
}