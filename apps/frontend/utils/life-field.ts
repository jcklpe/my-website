const CELL_SIZE = 8;
const DENSITY = 0.28;
const STAMP_RADIUS = 15;
const STAMP_DENSITY = 0.6;

// A route handoff transfers the simulation and its phosphor bitmap, not a newly seeded approximation of the outgoing image.
export class LifeField {
  readonly canvas: HTMLCanvasElement;
  cols: number;
  rows: number;
  private readonly context: CanvasRenderingContext2D;
  private grid: Uint8Array;
  private nextGrid: Uint8Array;

  constructor(
    width: number,
    height: number,
    private readonly color: string,
  ) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.cols = Math.max(1, Math.ceil(width / CELL_SIZE));
    this.rows = Math.max(1, Math.ceil(height / CELL_SIZE));
    this.canvas.width = this.cols * CELL_SIZE;
    this.canvas.height = this.rows * CELL_SIZE;
    this.grid = new Uint8Array(this.rows * this.cols);
    this.nextGrid = new Uint8Array(this.grid.length);
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = Math.random() < DENSITY ? 1 : 0;
    }
    this.paint(false);
  }

  // Reveal additional cells around the existing board without scaling, reseeding, or shifting its center. Grow by pairs of cells so the center never moves by half a cell.
  ensureSize(width: number, height: number) {
    const extraCols = Math.max(0, Math.ceil(width / CELL_SIZE) - this.cols);
    const extraRows = Math.max(0, Math.ceil(height / CELL_SIZE) - this.rows);
    if (!extraCols && !extraRows) return;
    const cols = this.cols + Math.ceil(extraCols / 2) * 2;
    const rows = this.rows + Math.ceil(extraRows / 2) * 2;
    const offsetCol = (cols - this.cols) / 2;
    const offsetRow = (rows - this.rows) / 2;
    const bitmap = document.createElement('canvas');
    bitmap.width = this.canvas.width;
    bitmap.height = this.canvas.height;
    bitmap.getContext('2d')!.drawImage(this.canvas, 0, 0);
    const grid = new Uint8Array(rows * cols);
    for (let i = 0; i < grid.length; i++) {
      grid[i] = Math.random() < DENSITY ? 1 : 0;
    }
    for (let r = 0; r < this.rows; r++) {
      const row = this.grid.subarray(r * this.cols, (r + 1) * this.cols);
      grid.set(row, (r + offsetRow) * cols + offsetCol);
    }
    this.cols = cols;
    this.rows = rows;
    this.grid = grid;
    this.nextGrid = new Uint8Array(grid.length);
    this.canvas.width = cols * CELL_SIZE;
    this.canvas.height = rows * CELL_SIZE;
    this.paint(false);
    const x = offsetCol * CELL_SIZE;
    const y = offsetRow * CELL_SIZE;
    this.context.clearRect(x, y, bitmap.width, bitmap.height);
    this.context.drawImage(bitmap, x, y);
  }

  // Toroidal B3/S23, swapping buffers instead of allocating each generation.
  step() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        let neighbors = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + this.rows) % this.rows;
            const nc = (c + dc + this.cols) % this.cols;
            neighbors += this.grid[nr * this.cols + nc];
          }
        }
        const index = r * this.cols + c;
        this.nextGrid[index] = this.grid[index]
          ? Number(neighbors === 2 || neighbors === 3)
          : Number(neighbors === 3);
      }
    }
    const previous = this.grid;
    this.grid = this.nextGrid;
    this.nextGrid = previous;
  }

  stamp(row: number, col: number) {
    if (row < 0 || col < 0) return;
    for (let dr = -STAMP_RADIUS; dr <= STAMP_RADIUS; dr++) {
      for (let dc = -STAMP_RADIUS; dc <= STAMP_RADIUS; dc++) {
        const distance = Math.hypot(dr, dc);
        if (distance > STAMP_RADIUS) continue;
        const chance = STAMP_DENSITY * (1 - distance / STAMP_RADIUS);
        if (Math.random() > chance) continue;
        const nr = (row + dr + this.rows) % this.rows;
        const nc = (col + dc + this.cols) % this.cols;
        this.grid[nr * this.cols + nc] = 1;
      }
    }
  }

  paint(trails: boolean) {
    const ctx = this.context;
    if (trails) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    } else ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = this.color;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r * this.cols + c]) {
          ctx.fillRect(
            c * CELL_SIZE,
            r * CELL_SIZE,
            CELL_SIZE - 1,
            CELL_SIZE - 1,
          );
        }
      }
    }
  }
}

const fields = new WeakMap<HTMLCanvasElement, LifeField>();
let handoff: LifeField | null = null;

export function registerLifeField(canvas: HTMLCanvasElement, field: LifeField) {
  fields.set(canvas, field);
}

export function prepareLifeFieldHandoff(canvas: HTMLCanvasElement | null) {
  handoff = canvas ? (fields.get(canvas) ?? null) : null;
}

export function takeLifeFieldHandoff() {
  const field = handoff;
  handoff = null;
  return field;
}
