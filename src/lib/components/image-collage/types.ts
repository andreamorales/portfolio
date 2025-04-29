export interface CollageImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  zIndex: number;
  rotation: number;
  scale: number;
  area?: number;
  isSpecialImage?: boolean;
  specialImageType?: string;
  positioned?: boolean;
  processed?: boolean;
  aspectRatio?: string;
  flexShrink?: number;
  contentOffsets?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface Cursor {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  isDragging: boolean;
  isMovingToTarget: boolean;
  targetImage: number | null;
  targetX: number;
  targetY: number;
  destinationX: number;
  destinationY: number;
  delayCount: number;
  curveOffsetX: number;
  curveOffsetY: number;
  timeFactor: number;
  randomOffset: { x: number; y: number };
  offsetX: number;
  offsetY: number;
  rotation: number;
  originX: number;
  originY: number;
  holdDuration: number;
  grabOffsetX: number;
  grabOffsetY: number;
  lastActiveTime: number;
  isStatic: boolean;
  restingPeriod: number;
  lifespan: number;
} 