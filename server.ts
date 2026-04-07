import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { HuffmanNode, HuffmanResult } from "./src/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Huffman Coding Logic
  app.post("/api/huffman", (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Invalid input text" });
    }

    // 1. Calculate frequencies
    const frequencies: Record<string, number> = {};
    for (const char of text) {
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    // 2. Build Huffman Tree
    const nodes: HuffmanNode[] = Object.entries(frequencies).map(([char, freq]) => ({
      char,
      freq,
    }));

    while (nodes.length > 1) {
      nodes.sort((a, b) => a.freq - b.freq);
      const left = nodes.shift()!;
      const right = nodes.shift()!;
      const parent: HuffmanNode = {
        freq: left.freq + right.freq,
        left,
        right,
      };
      nodes.push(parent);
    }

    const tree = nodes[0];

    // 3. Generate Codes
    const codes: Record<string, string> = {};
    const generateCodes = (node: HuffmanNode, currentCode: string) => {
      if (node.char !== undefined) {
        codes[node.char] = currentCode || "0"; // Handle single char case
        return;
      }
      if (node.left) generateCodes(node.left, currentCode + "0");
      if (node.right) generateCodes(node.right, currentCode + "1");
    };
    generateCodes(tree, "");

    // 4. Calculate Stats
    const originalSize = text.length * 8; // Assuming 8 bits per char
    let compressedSize = 0;
    for (const char of text) {
      compressedSize += codes[char].length;
    }
    const compressionRatio = originalSize / compressedSize;

    const result: HuffmanResult = {
      tree,
      codes,
      originalSize,
      compressedSize,
      compressionRatio,
      frequencies,
    };

    res.json(result);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
