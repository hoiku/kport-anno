const image = document.getElementById('image');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('infoPanel');
const modal = document.getElementById('modal');
const form = document.getElementById('annotationForm');
const cancelBtn = document.getElementById('cancelBtn');
const tooltip = document.getElementById('tooltip');
const downloadBtn = document.getElementById('downloadBtn');

let annotations = [];
let paths = [];
let currentPolygon = [];

fetch('annotations.json')
  .then(res => res.json())
  .then(data => {
    annotations = data;
    rebuildPaths();
    draw();
  });

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  rebuildPaths();
  draw();
};

function rebuildPaths() {
  paths = annotations.map(ann => {
    const path = new Path2D();
    ann.points.forEach((pt, i) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (i === 0) path.moveTo(x, y); else path.lineTo(x, y);
    });
    path.closePath();
    return path;
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  annotations.forEach((ann, i) => {
    ctx.beginPath();
    ann.points.forEach((pt, j) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  drawCurrent();
}

function drawCurrent() {
  if (currentPolygon.length === 0) return;
  ctx.beginPath();
  currentPolygon.forEach((pt, i) => {
    const x = pt[0] * canvas.width;
    const y = pt[1] * canvas.height;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 1;
  ctx.stroke();
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const idx = paths.findIndex(p => ctx.isPointInPath(p, x, y));
  if (idx !== -1) {
    const ann = annotations[idx];
    tooltip.textContent = `${ann.object} - ${ann.author}`;
    tooltip.style.left = `${e.clientX + 10}px`;
    tooltip.style.top = `${e.clientY + 10}px`;
    tooltip.classList.remove('hidden');
  } else {
    tooltip.classList.add('hidden');
  }
});

canvas.addEventListener('mouseleave', () => {
  tooltip.classList.add('hidden');
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;
  if (currentPolygon.length === 0) {
    const idx = paths.findIndex(p => ctx.isPointInPath(p, px, py));
    if (idx !== -1) {
      showInfo(idx);
      return;
    }
  }
  const x = px / canvas.width;
  const y = py / canvas.height;
  currentPolygon.push([x, y]);
  draw();
});

canvas.addEventListener('dblclick', e => {
  if (currentPolygon.length > 2) {
    form.reset();
    modal.classList.remove('hidden');
  }
  e.preventDefault();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const ann = {
    author: form.author.value,
    object: form.object.value,
    description: form.description.value,
    material: form.material.value,
    style: form.style.value,
    layer: form.layer.value,
    points: currentPolygon
  };
  annotations.push(ann);
  currentPolygon = [];
  modal.classList.add('hidden');
  rebuildPaths();
  draw();
});

cancelBtn.addEventListener('click', () => {
  currentPolygon = [];
  modal.classList.add('hidden');
  draw();
});

downloadBtn.addEventListener('click', () => {
  const dataStr = 'data:text/json;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(annotations, null, 2));
  const a = document.createElement('a');
  a.href = dataStr;
  a.download = 'annotations.json';
  a.click();
});

function showInfo(index) {
  const ann = annotations[index];
  infoPanel.innerHTML =
    `<h2>Annotation</h2>` +
    `<p><strong>Author:</strong> ${ann.author}</p>` +
    `<p><strong>Object:</strong> ${ann.object}</p>` +
    `<p><strong>Description:</strong> ${ann.description || ''}</p>` +
    `<p><strong>Material:</strong> ${ann.material || ''}</p>` +
    `<p><strong>Style:</strong> ${ann.style || ''}</p>` +
    `<p><strong>Layer:</strong> ${ann.layer || ''}</p>`;
}
