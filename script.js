window.onload = function () {

  const canvas = new fabric.Canvas('canvas');
  let currentMode = "wall";
  let history = [];

  // MODE SELECTION
  function setMode(mode) {
    currentMode = mode;
    alert("Selected: " + mode);
  }
  window.setMode = setMode;

  // IMAGE UPLOAD
  document.getElementById("imageUpload").addEventListener("change", function (e) {
    const reader = new FileReader();

    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {
        canvas.clear();
        img.scaleToWidth(700);
        canvas.add(img);
        canvas.sendToBack(img);
        saveState();
      });
    };

    reader.readAsDataURL(e.target.files[0]);
  });

  // APPLY COLOR
  function applyColor() {
    const colorCode = document.getElementById("colorCode").value;

    const colorBox = new fabric.Rect({
      left: 100,
      top: 100,
      width: 300,
      height: 200,
      fill: getColorFromCode(colorCode),
      opacity: 0.4,
      selectable: true
    });

    canvas.add(colorBox);
    saveState();
  }
  window.applyColor = applyColor;

  // SIMPLE COLOR DATABASE
  function getColorFromCode(code) {
    const colors = {
      "AP101": "#f5e6cc",
      "AP102": "#d9c2a3",
      "AP103": "#cfa57a",
      "AP201": "#c2d6e8",
      "AP202": "#8fb3d9",
      "AP301": "#d8e6c2"
    };

    return colors[code] || "#cccccc";
  }

  // UNDO
  function undo() {
    if (history.length > 1) {
      history.pop();
      canvas.loadFromJSON(history[history.length - 1], canvas.renderAll.bind(canvas));
    }
  }
  window.undo = undo;

  // RESET
  function resetCanvas() {
    canvas.clear();
    history = [];
  }
  window.resetCanvas = resetCanvas;

  // SAVE STATE
  function saveState() {
    history.push(JSON.stringify(canvas));
  }

  // DOWNLOAD
  function downloadImage() {
    const link = document.createElement("a");
    link.download = "paint-preview.png";
    link.href = canvas.toDataURL();
    link.click();
  }
  window.downloadImage = downloadImage;

};
