import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs/promises";
import os from "os";
import path from "path";

// Only handles PDFs on Server
export async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileName = file.name.toLowerCase();

  // Basic validation
  if (!fileName.endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("Server only handles PDFs.");
  }

  const tempDir = os.tmpdir();
  // Sanitize filename to prevent directory traversal or weird chars
  const safeName = fileName.replace(/[^a-z0-9.]/gi, "_");
  const randomSuffix = Math.random().toString(36).substring(7);
  const tempFilePath = path.join(tempDir, `upload-${Date.now()}-${randomSuffix}-${safeName}`);

  try {
    await fs.writeFile(tempFilePath, buffer);
    // splitPages: false means we get one document with all text, which is usually fine for statements
    const loader = new PDFLoader(tempFilePath, { splitPages: false });
    const docs = await loader.load();
    const fullText = docs.map((doc) => doc.pageContent).join("\n\n");

    if (!fullText.trim() || fullText.length < 50) {
      throw new Error("PDF text is empty. It might be a scanned image PDF.");
    }
    return fullText;
  } catch (error) {
    console.error("PDF Extraction failed:", error);
    throw error;
  } finally {
    // Clean up temp file
    try { await fs.unlink(tempFilePath); } catch (e) { }
  }
}
