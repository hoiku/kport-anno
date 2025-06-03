const image = document.getElementById('image');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('infoPanel');
const modal = document.getElementById('modal');
const form = document.getElementById('annotationForm');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const tooltip = document.getElementById('tooltip');
const downloadBtn = document.getElementById('downloadBtn');
const addBtn = document.getElementById('addBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const startPolygonBtn = document.getElementById('startPolygonBtn');
const authorFilter = document.getElementById('authorFilter');
const objectFilter = document.getElementById('objectFilter');

let annotations = [];
let displayedAnnotations = [];
let pendingPolygons = [];
let paths = [];
let pendingPaths = [];
let currentPolygon = [];
let selected = null;
let editingIndex = null;
let isDragging = false;
let dragStart = null;
let drawingMode = false;

function saveAnnotations() {
  localStorage.setItem('annotations', JSON.stringify(annotations));
}

function loadAnnotations() {
  const data = localStorage.getItem('annotations');
  return data ? JSON.parse(data) : null;
}

const stored = loadAnnotations();
if (stored) {
  annotations = stored;
  updateFilterOptions();
  applyFilters();
  updateButtonStates();
} else {
  fetch('annotations.json')
    .then(r => r.json())
    .then(data => {
      annotations = data;
      updateFilterOptions();
      applyFilters();
      updateButtonStates();
    });
}

function setCanvasSize() {
  canvas.width = image.clientWidth;
  canvas.height = image.clientHeight;
}

image.onload = () => {
  setCanvasSize();
  applyFilters();
};

window.addEventListener('resize', () => {
  setCanvasSize();
  rebuildPaths();
  draw();
});

authorFilter.addEventListener('change', applyFilters);
objectFilter.addEventListener('change', applyFilters);
startPolygonBtn.addEventListener('click', () => {
  drawingMode = true;
  selected = null;
  currentPolygon = [];
  updateButtonStates();
  draw();
});
addBtn.addEventListener('click', () => {
  if (selected && selected.type === 'pending') {
    form.reset();
    modalTitle.textContent = 'New Annotation';
    modal.classList.remove('hidden');
  }
});
editBtn.addEventListener('click', () => {
  if (!(selected && selected.type === 'annotation')) return;
  const ann = displayedAnnotations[selected.index];
  editingIndex = annotations.indexOf(ann);
  if (editingIndex === -1) return;
  form.author.value = ann.author;
  form.object.value = ann.object;
  form.description.value = ann.description || '';
  form.tags.value = (ann.tags || []).join(', ');
  modalTitle.textContent = 'Edit Annotation';
  modal.classList.remove('hidden');
});
deleteBtn.addEventListener('click', () => {
  if (!selected) return;
  if (selected.type === 'pending') {
    pendingPolygons.splice(selected.index, 1);
  } else if (selected.type === 'annotation') {
    const ann = displayedAnnotations[selected.index];
    const idx = annotations.indexOf(ann);
    if (idx !== -1) annotations.splice(idx, 1);
  }
  selected = null;
  saveAnnotations();
  updateFilterOptions();
  applyFilters();
  updateButtonStates();
});

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
  pendingPaths = pendingPolygons.map(poly => {
    const path = new Path2D();
    poly.forEach((pt, i) => {
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
  displayedAnnotations.forEach((ann, i) => {
    ctx.beginPath();
    ann.points.forEach((pt, j) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    if (selected && selected.type === 'annotation' && selected.index === i) {
      ctx.strokeStyle = 'green';
    } else {
      ctx.strokeStyle = 'red';
    }
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  pendingPolygons.forEach((poly, i) => {
    ctx.beginPath();
    poly.forEach((pt, j) => {
      const x = pt[0] * canvas.width;
      const y = pt[1] * canvas.height;
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = (selected && selected.type === 'pending' && selected.index === i) ? 'green' : 'blue';
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
  if (isDragging && selected) {
    const dx = (x - dragStart.x) / canvas.width;
    const dy = (y - dragStart.y) / canvas.height;
    dragStart = { x, y };
    let poly;
    if (selected.type === 'annotation') {
      poly = displayedAnnotations[selected.index].points;
    } else {
      poly = pendingPolygons[selected.index];
    }
    poly.forEach(pt => { pt[0] += dx; pt[1] += dy; });
    rebuildPaths();
    draw();
    return;
  }
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
  isDragging = false;
});

canvas.addEventListener('mousedown', e => {
  if (!selected) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  let path;
  if (selected.type === 'annotation') path = paths[selected.index];
  else path = pendingPaths[selected.index];
  if (ctx.isPointInPath(path, x, y)) {
    isDragging = true;
    dragStart = { x, y };
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDragging && selected && selected.type === 'annotation') {
    saveAnnotations();
  }
  isDragging = false;
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  if (drawingMode) {
    const x = px / canvas.width;
    const y = py / canvas.height;
    currentPolygon.push([x, y]);
    draw();
    return;
  }

  let idx = pendingPaths.findIndex(p => ctx.isPointInPath(p, px, py));
  if (idx !== -1) {
    selected = { type: 'pending', index: idx };
    updateButtonStates();
    draw();
    return;
  }
  idx = paths.findIndex(p => ctx.isPointInPath(p, px, py));
  if (idx !== -1) {
    selected = { type: 'annotation', index: idx };
    showInfo(idx);
    updateButtonStates();
    draw();
    return;
  }

  selected = null;
  updateButtonStates();
  draw();
});

canvas.addEventListener('dblclick', e => {
  if (drawingMode && currentPolygon.length > 2) {
    pendingPolygons.push(currentPolygon);
    currentPolygon = [];
    drawingMode = false;
    rebuildPaths();
    selected = { type: 'pending', index: pendingPolygons.length - 1 };
    updateButtonStates();
    draw();
  }
  e.preventDefault();
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (editingIndex !== null) {
    const ann = annotations[editingIndex];
    ann.author = form.author.value;
    ann.object = form.object.value;
    ann.description = form.description.value;
    ann.tags = form.tags.value.split(',').map(t => t.trim()).filter(t => t);
    editingIndex = null;
    selected = null;
  } else if (selected && selected.type === 'pending') {
    const ann = {
      author: form.author.value,
      object: form.object.value,
      description: form.description.value,
      tags: form.tags.value.split(',').map(t => t.trim()).filter(t => t),
      points: pendingPolygons[selected.index]
    };
    annotations.push(ann);
    pendingPolygons.splice(selected.index, 1);
    selected = null;
  } else {
    return;
  }
  modal.classList.add('hidden');
  form.reset();
  saveAnnotations();
  updateFilterOptions();
  applyFilters();
  updateButtonStates();
});

cancelBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
  editingIndex = null;
  modalTitle.textContent = 'New Annotation';
  form.reset();
  updateButtonStates();
});

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    editingIndex = null;
    modalTitle.textContent = 'New Annotation';
    form.reset();
    updateButtonStates();
  }
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

function updateButtonStates() {
  addBtn.disabled = !(selected && selected.type === 'pending');
  editBtn.disabled = !(selected && selected.type === 'annotation');
  deleteBtn.disabled = !selected;
  startPolygonBtn.disabled = drawingMode;
}
