export type Node = {
  id: string;
  name: string;
  x: number;
  y: number;
  inputs: Array<string | null>;
  outputs: Array<string | null>;
};

export type MouseDownValues = {
  mouseX: number;
  mouseY: number;
  originalX: number;
  originalY: number;
};
