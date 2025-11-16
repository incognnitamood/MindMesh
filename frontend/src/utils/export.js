// Export utilities for PNG and PDF

export const exportAsPNG = (svgElement, filename = 'cognitive-map.png') => {
  if (!svgElement) return;

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.download = filename;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    });
  };

  img.src = url;
};

export const exportAsPDF = (mapData, reasoningTrail, filename = 'cognitive-map.pdf') => {
  // Simple PDF export using browser print
  const printWindow = window.open('', '_blank');
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Cognitive Map: ${mapData.topic}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1f2937; }
          h2 { color: #374151; margin-top: 20px; }
          .reasoning { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .node-list { margin: 10px 0; }
          .node-item { margin: 5px 0; padding: 8px; background: #f9fafb; border-left: 3px solid #3b82f6; }
        </style>
      </head>
      <body>
        <h1>Cognitive Map: ${mapData.topic}</h1>
        <div class="reasoning">
          <h2>Reasoning Trail</h2>
          <p>${reasoningTrail || 'No reasoning trail available.'}</p>
        </div>
        <h2>Core Idea</h2>
        <p>${mapData.core_idea}</p>
        <h2>Sub-ideas</h2>
        <ul>
          ${mapData.sub_ideas.map(idea => `<li>${idea}</li>`).join('')}
        </ul>
        <h2>Contradictions</h2>
        <ul>
          ${mapData.contradictions.map(cont => `<li>${cont}</li>`).join('')}
        </ul>
        <h2>Adjacent Fields</h2>
        <ul>
          ${mapData.adjacent_fields.map(field => `<li>${field}</li>`).join('')}
        </ul>
        <h2>Real-world Examples</h2>
        <ul>
          ${mapData.real_world_examples.map(ex => `<li>${ex}</li>`).join('')}
        </ul>
      </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.print();
};

