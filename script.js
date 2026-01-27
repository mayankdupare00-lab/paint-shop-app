window.onload = function () {

  // Create canvas
  var canvas = new fabric.Canvas('canvas');
  let currentMode = "wall";
  let history = [];

  // Save state for undo
  function saveState() {
    history.push(JSON.stringify(canvas));
    if (history.length > 20) history.shift();
  }

  // Upload image
  document.getElementById('imageUpload').addEventListener('change', function (e) {
    var reader = new FileReader();

    reader.onload = function (event) {
      fabric.Image.fromURL(event.target.result, function (img) {

        // Clear old canvas
        canvas.clear();

        // Resize image to fit canvas
        img.scaleToWidth(canvas.width);
        img.scaleToHeight(canvas.height);

        // Lock image (background)
        img.selectable = false;
        img.evented = false;

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));

      });
    };

    reader.readAsDataURL(e.target.files[0]);
  });

  // Mode selection
  window.setMode = function (mode) {
    currentMode = mode;
    alert("Mode selected: " + mode);
  };

  // Apply color
  window.applyColor = function () {
    var colorCode = document.getElementById("colorCode").value;
    if (!colorCode) {
      alert("Enter color code first");
      return;
    }

    var rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 150,
      fill: "rgba(255,0,0,0.4)",
      selectable: true
    });

    canvas.add(rect);
    saveState();

    // Show used color
    var used = document.getElementById("usedColors");
    var tag = document.createElement("span");
    tag.innerText = colorCode + " ";
    used.appendChild(tag);
  };

  // Undo
  window.undo = function () {
    if (history.length > 0) {
      canvas.loadFromJSON(history.pop(), canvas.renderAll.bind(canvas));
    }
  };

  // Reset
  window.resetCanvas = function () {
    canvas.clear();
  };

  // Download
  window.downloadImage = function () {
    var link = document.createElement("a");
    link.download = "paint-result.png";
    link.href = canvas.toDataURL();
    link.click();
  };

};
