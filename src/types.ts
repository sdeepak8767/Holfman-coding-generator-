export interface HuffmanNode {
  char?: string;
  freq: number;
  left?: HuffmanNode;
  right?: HuffmanNode;
}

export interface HuffmanResult {
  tree: HuffmanNode;
  codes: Record<string, string>;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  frequencies: Record<string, number>;
}
