/**
 * PDF to Image Conversion Module
 * Handles local worker setup for pdfjs-dist v5+ in Vite
 * Converts first page of PDF to PNG image with canvas rendering
 */

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

/**
 * Dynamically loads pdfjs-dist with local worker support
 * Uses /pdf.worker.min.mjs from public folder (Vite serves from root)
 * Ensures version compatibility between API and worker
 */
async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      // Import pdfjs-dist v5+ with proper legacy build path
      const lib = await import("pdfjs-dist/legacy/build/pdf.mjs");

      // Configure local worker - Vite serves public/ files from root
      // This eliminates 404 errors and version mismatch issues
      lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      pdfjsLib = lib;
      return lib;
    } catch (error) {
      // Reset promise on error to allow retry on next call
      loadPromise = null;
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load PDF.js: ${errorMsg}`);
    }
  })();

  return loadPromise;
}

/**
 * Converts the first page of a PDF file to a PNG image
 * @param file - PDF File object
 * @returns Object containing imageUrl (blob URL), file (File object), and optional error
 */
export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    // Load PDF.js library with local worker configuration
    const lib = await loadPdfJs();

    // Convert file to ArrayBuffer for PDF.js processing
    const arrayBuffer = await file.arrayBuffer();

    // Load and parse PDF document
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;

    // Extract first page
    const page = await pdf.getPage(1);

    // Get viewport with 2x scale for higher quality output
    const viewport = page.getViewport({ scale: 2 });

    // Create canvas for rendering
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Canvas context not available",
      };
    }

    // Set canvas dimensions
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Enable high-quality rendering
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    // Render PDF page onto canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert canvas to PNG blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
            return;
          }

          // Create File object with original filename
          const originalName = file.name.replace(/\.pdf$/i, "");
          const imageFile = new File([blob], `${originalName}.png`, {
            type: "image/png",
          });

          // Return both blob URL for display and File object for upload
          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png",
        1.0
      );
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("PDF conversion failed:", errorMsg);

    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${errorMsg}`,
    };
  }
}