function px(n: number) { return n; }

function drawBadge(ctx: CanvasRenderingContext2D, x: number, y: number, text: string | undefined, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, px(6), 0, Math.PI * 2);
  ctx.fill();
  if (text) {
    ctx.fillStyle = "#fff";
    ctx.font = "8px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 0.5);
  }
  ctx.restore();
}

export function drawCircleStatusRing(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, ui = {} } = d;
  const r = size + 6;
  const prog = Math.max(0, Math.min(1, ui.ring?.progress ?? ui.progress ?? 0.7));
  const bg = "#e5e7eb";
  const fg = ui.ring?.color || "#10b981";

  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = bg;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.strokeStyle = fg;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * prog);
  ctx.stroke();
  if (ui.iconText) {
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, size - 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = "#10b981";
    ctx.font = "12px Inter";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(ui.iconText, x, y);
  }
  (ui.badges || []).forEach((b: any) => {
    const dx = b.pos.includes("E") ? size + 10 : b.pos.includes("W") ? -(size + 10) : 0;
    const dy = b.pos.includes("S") ? size + 10 : b.pos.includes("N") ? -(size + 10) : 0;
    drawBadge(ctx, x + dx, y + dy, b.text, b.color);
  });
  ctx.restore();
}

export function drawCircleKpiSegments(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, ui = {} } = d;
  const r = size + 6;
  const segs = ui.ring?.segments || [
    { value: 0.4, color: "#f59e0b" },
    { value: 0.2, color: "#ef4444" },
    { value: 0.3, color: "#10b981" },
  ];
  ctx.save();
  ctx.lineWidth = 6;
  let ang = -Math.PI / 2;
  segs.forEach((s: any) => {
    const len = 2 * Math.PI * Math.max(0, Math.min(1, s.value));
    ctx.strokeStyle = s.color;
    ctx.beginPath();
    ctx.arc(x, y, r, ang, ang + len);
    ctx.stroke();
    ang += len + 0.15;
  });
  ctx.restore();
}

export function drawCirclePersonPresence(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, ui = {} } = d;
  const dot = ui.presence === "offline" ? "#9ca3af" : ui.presence === "away" ? "#f59e0b" : "#10b981";
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x, y, size + 8, 0, 2 * Math.PI);
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = dot;
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + size * 0.7, y - size * 0.7, 5, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function drawSquareHeader(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, label, ui = {} } = d;
  const w = size * 3,
    h = size * 2;
  const left = x - w / 2,
    top = y - h / 2;
  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.strokeRect(left, top, w, h);
  const headerH = Math.max(18, size * 0.9);
  ctx.fillStyle = ui.header?.color || "#4f46e5";
  ctx.fillRect(left, top, w, headerH);
  ctx.fillStyle = ui.header?.textColor || "#fff";
  ctx.font = "12px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label || "", x, top + headerH / 2);
  ctx.restore();
}

export function drawSquareAccentProgress(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, ui = {} } = d;
  const w = size * 3,
    h = size * 2;
  const left = x - w / 2,
    top = y - h / 2;
  const accent = ui.accent?.leftColor || "#10b981";
  const prog = Math.max(0, Math.min(1, ui.progress ?? 0.6));
  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.strokeRect(left, top, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(left, top, 6, h);
  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(left + 10, top + h - 10, w - 20, 6);
  ctx.fillStyle = accent;
  ctx.fillRect(left + 10, top + h - 10, (w - 20) * prog, 6);
  ctx.restore();
}

export function drawSquareCornerTag(ctx: CanvasRenderingContext2D, d: any) {
  const { x, y, size, ui = {} } = d;
  const w = size * 3,
    h = size * 2;
  const left = x - w / 2,
    top = y - h / 2;
  const tag = ui.tag || { text: "TAG", color: "#f59e0b", textColor: "#fff" };
  ctx.save();
  ctx.strokeStyle = "#e5e7eb";
  ctx.strokeRect(left, top, w, h);
  ctx.fillStyle = tag.color;
  ctx.beginPath();
  ctx.moveTo(left + w, top);
  ctx.lineTo(left + w - 20, top);
  ctx.lineTo(left + w, top + 20);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = tag.textColor || "#fff";
  ctx.font = "10px Inter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tag.text || "", left + w - 12, top + 10);
  ctx.restore();
}
