import jsPDF from "jspdf";

function sanitizeFilename(title) {
  return (title || "chat").replace(/[^a-z0-9]/gi, "_").slice(0, 50);
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAsMarkdown(chatTitle, messages) {
  const lines = [`# ${chatTitle || "Chat"}`, ""];

  messages.forEach((msg) => {
    const label = msg.role === "user" ? "**You**" : "**AI**";
    lines.push(`${label}:`);
    lines.push(msg.content || "");
    lines.push("");
  });

  downloadBlob(lines.join("\n"), `${sanitizeFilename(chatTitle)}.md`, "text/markdown");
}

export function exportAsPDF(chatTitle, messages) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (neededHeight) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text(chatTitle || "Chat", margin, y);
  y += 28;

  messages.forEach((msg) => {
    const label = msg.role === "user" ? "You" : "AI";
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    addPageIfNeeded(16);
    doc.text(label, margin, y);
    y += 14;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    const lines = doc.splitTextToSize(msg.content || "", maxWidth);

    lines.forEach((line) => {
      addPageIfNeeded(14);
      doc.text(line, margin, y);
      y += 14;
    });

    y += 12; // spacing between messages
  });

  doc.save(`${sanitizeFilename(chatTitle)}.pdf`);
}