export type NodeKind = "person" | "team" | "project" | "ticket" | "server" | "process" | string;
export type NodeShape = "circle" | "square";
export type NodeVariant =
  | "plain"
  | "circle.statusRing"
  | "circle.kpiSegments"
  | "circle.person"
  | "square.header"
  | "square.accentProgress"
  | "square.cornerTag"
  | string;

export interface NodeUI {
  header?: { enabled?: boolean; color?: string; textColor?: string };
  accent?: { leftColor?: string };
  progress?: number;
  ring?: { segments?: Array<{ value: number; color: string }>; progress?: number; color?: string };
  badges?: Array<{ pos: "NE" | "NW" | "SE" | "SW"; color: string; text?: string }>;
  tag?: { text: string; color: string; textColor?: string };
  presence?: "online" | "away" | "offline";
  ports?: Array<"N" | "S" | "E" | "W">;
  iconText?: string;
  emoji?: string;
}

export interface GraphNodeAttrs {
  key: string;
  label?: string;
  kind?: NodeKind;
  shape?: NodeShape;
  variant?: NodeVariant;
  ui?: NodeUI;
  x: number;
  y: number;
  size?: number;
  status?: string;
  team?: string;
  domain?: string;
  tags?: string[];
}
