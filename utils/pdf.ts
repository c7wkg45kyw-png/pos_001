import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PAGE_MARGIN_MM = 10;

function sanitizeFileName(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "quotation-preview";
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete) {
        return;
      }
      if (typeof image.decode === "function") {
        try {
          await image.decode();
          return;
        } catch {
          return;
        }
      }
      await new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      });
    })
  );
}

async function renderElementToCanvas(element: HTMLElement) {
  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false
  });
}

export async function downloadElementAsPdf(element: HTMLElement, fileName: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await waitForImages(element);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - PAGE_MARGIN_MM * 2;
  const contentHeight = pageHeight - PAGE_MARGIN_MM * 2;

  const sheetNodes = element.matches(".print-sheet")
    ? [element]
    : Array.from(element.querySelectorAll<HTMLElement>(".print-sheet"));

  if (sheetNodes.length > 0) {
    for (const [index, sheet] of sheetNodes.entries()) {
      const canvas = await renderElementToCanvas(sheet);
      const renderedHeight = (canvas.height * contentWidth) / canvas.width;
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", PAGE_MARGIN_MM, PAGE_MARGIN_MM, contentWidth, Math.min(contentHeight, renderedHeight), undefined, "FAST");
    }
    pdf.save(`${sanitizeFileName(fileName)}.pdf`);
    return;
  }

  const canvas = await renderElementToCanvas(element);
  const sliceHeightPx = Math.floor((contentHeight * canvas.width) / contentWidth);
  let offsetY = 0;
  let firstPage = true;
  while (offsetY < canvas.height) {
    const currentSliceHeight = Math.min(sliceHeightPx, canvas.height - offsetY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentSliceHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) {
      throw new Error("Could not prepare PDF canvas.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, offsetY, canvas.width, currentSliceHeight, 0, 0, canvas.width, currentSliceHeight);

    if (!firstPage) {
      pdf.addPage();
    }
    pdf.addImage(pageCanvas.toDataURL("image/png"), "PNG", PAGE_MARGIN_MM, PAGE_MARGIN_MM, contentWidth, (currentSliceHeight * contentWidth) / canvas.width, undefined, "FAST");
    offsetY += currentSliceHeight;
    firstPage = false;
  }
  pdf.save(`${sanitizeFileName(fileName)}.pdf`);
}
