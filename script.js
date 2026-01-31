window.addEventListener("DOMContentLoaded", () => {

  const canvas = new fabric.Canvas("canvas", {
    selection: false,
    preserveObjectStacking: true
  });

  let paintLayers = [];
  let colorHistory = [];

  // ===============================
  // IMAGE UPLOAD
  // ===============================
  document.getElementById("imageUpload").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {

        canvas.clear();
        paintLayers = [];
        colorHistory = [];
        updateHistoryUI();

        canvas.setWidth(900);
        canvas.setHeight(550);

        const scale = Math.min(
          canvas.width / img.width,
          canvas.height / img.height
        );

        img.set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          selectable: false,
          evented: false
        });

        canvas.add(img);
        canvas.sendToBack(img);
        canvas.renderAll();
      });
    };

    reader.readAsDataURL(file);
  });

  // ===============================
  // APPLY COLOR (CLICK TO PAINT)
  // ===============================
  function applyColor() {
    const code = document.getElementById("colorCode").value.trim().toUpperCase();
    if (!code) {
      alert("Enter color code");
      return;
    }

    const colorMap = {
      "AP101": "rgba(180,60,50,0.95)",
      "AP102": "rgba(60,130,70,0.95)",
      "AP103": "rgba(60,80,160,0.95)",
      "AP104": "rgba(120,80,40,0.95)"
    };

    const color = colorMap[code] || "rgba(120,120,120,0.95)";

    canvas.once("mouse:down", function (opt) {
      const pointer = canvas.getPointer(opt.e);

      const paint = new fabric.Circle({
        left: pointer.x - 40,
        top: pointer.y - 40,
        radius: 60,
        fill: color,
        selectable: false,
        evented: false,
        globalCompositeOperation: "multiply"
      });

      canvas.add(paint);
      paintLayers.push(paint);

      if (!colorHistory.includes(code)) {
        colorHistory.push(code);
        addHistoryItem(code, color);
      }

      canvas.renderAll();
    });
  }

  // ===============================
  // HISTORY UI
  // ===============================
  function addHistoryItem(code, color) {
    const div = document.createElement("div");
    div.className = "history-item";
    div.style.background = color;
    div.innerText = code;
    document.getElementById("historyList").appendChild(div);
  }

  function updateHistoryUI() {
    document.getElementById("historyList").innerHTML = "";
  }

  // ===============================
  // UNDO / RESET / DOWNLOAD
  // ===============================
  function undo() {
    const last = paintLayers.pop();
    if (last) {
      canvas.remove(last);
      canvas.renderAll();
    }
  }

  function resetCanvas() {
    canvas.clear();
    paintLayers = [];
    colorHistory = [];
    updateHistoryUI();
  }

  function downloadImage() {
    const link = document.createElement("a");
    link.download = "paint-preview.png";
    link.href = canvas.toDataURL({
      format: "png",
      quality: 1
    });
    link.click();
  }

  // expose functions to HTML
  window.applyColor = applyColor;
  window.undo = undo;
  window.resetCanvas = resetCanvas;
  window.downloadImage = downloadImage;

});
