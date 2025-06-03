const image = document.getElementById('image');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('infoPanel');
const modal = document.getElementById('modal');
const form = document.getElementById('annotationForm');
const cancelBtn = document.getElementById('cancelBtn');
const tooltip = document.getElementById('tooltip');
const downloadBtn = document.getElementById('downloadBtn');
const authorFilter = document.getElementById('authorFilter');
const objectFilter = document.getElementById('objectFilter');

let annotations = [];
let displayedAnnotations = [];
let paths = [];
let currentPolygon = [];

fetch('annotations.json')
  .then(r => r.json())
  .then(data => {
    annotations = data;
    updateFilterOptions();
    applyFilters();
  });

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  applyFilters();
};

authorFilter.addEventListener('change', applyFilters);
objectFilter.addEventListener('change', applyFilters);

function updateFilterOptions() {
  const authors = [...new Set(annotations.map(a => a.author))];
  const objects = [...new Set(annotations.map(a => a.object))];
  authorFilter.innerHTML = '<option value="">All</option>' +
    authors.map(a => `<option value="${a}">${a}</option>`).join('');
  objectFilter.innerHTML = '<option value="">All</option>' +
    objects.map(o => `<option value="${o}">${o}</option>`).join('');
}

function applyFilters() {
  displayedAnnotations = annotations.filter(a => {
    const authorOk = !authorFilter.value || a.author === authorFilter.value;
    const objectOk = !objectFilter.value || a.object === objectFilter.value;
    return authorOk && objectOk;
  });
  rebuildPaths();
  draw();
}

function rebuildPaths() {
  paths = displayedAnnotations.map(ann => {
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
  displayedAnnotations.forEach(ann => {
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
    const ann = displayedAnnotations[idx];
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
  // Double-click now simply clears the current polygon without
  // showing the annotation modal.
  currentPolygon = [];
  draw();
  e.preventDefault();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const ann = {
    author: form.author.value,
    object: form.object.value,
    description: form.description.value,
    tags: form.tags.value.split(',').map(t => t.trim()).filter(t => t),
    points: currentPolygon
  };
  annotations.push(ann);
  currentPolygon = [];
  modal.classList.add('hidden');
  updateFilterOptions();
  applyFilters();
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
  const ann = displayedAnnotations[index];
  infoPanel.innerHTML =
    `<h2>Annotation</h2>` +
    `<p><strong>Author:</strong> ${ann.author}</p>` +
    `<p><strong>Object:</strong> ${ann.object}</p>` +
    `<p><strong>Description:</strong> ${ann.description || ''}</p>` +
    `<p><strong>Tags:</strong> ${(ann.tags || []).join(', ')}</p>`;
}
