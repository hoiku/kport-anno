import { createClient } from '@supabase/supabase-js';

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
const editShapeBtn = document.getElementById('editShapeBtn');
const vertexMenu = document.getElementById('vertexMenu');
const vertexDeleteBtn = document.getElementById('vertexDeleteBtn');
const vertexMoveBtn = document.getElementById('vertexMoveBtn');
const startPolygonBtn = document.getElementById('startPolygonBtn');
const authorFilter = document.getElementById('authorFilter');
const objectFilter = document.getElementById('objectFilter');

// Supabase client configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

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
let shapeEditMode = false;
let editingPolygon = null;
let editingType = null;
let editingIdx = null;
let selectedVertex = null;
let movingVertex = false;
let isDraggingVertex = false;

function updateVertexMenuPosition() {
  if (selectedVertex === null || !editingPolygon) return;
  const rect = canvas.getBoundingClientRect();
  const pt = editingPolygon[selectedVertex];
  const x = rect.left + pt[0] * canvas.width;
  const y = rect.top + pt[1] * canvas.height;
  vertexMenu.style.left = `${x - vertexMenu.offsetWidth / 2}px`;
  vertexMenu.style.top = `${y - vertexMenu.offsetHeight - 5}px`;
}

async function fetchAnnotations() {
  const { data, error } = await sb.from('annotations').select('*');
  if (error) {
    console.error('Failed to load annotations', error);
    return [];
  }
  return data || [];
}

async function addAnnotation(ann) {
  const { data, error } = await sb.from('annotations').insert([ann]).select();
  if (error) {
    console.error('Failed to add annotation', error);
    return null;
  }
  return data[0];
}

async function updateAnnotation(ann) {
  const { error } = await sb
    .from('annotations')
    .update({
      author: ann.author,
      object: ann.object,
      description: ann.description,
      tags: ann.tags,
      points: ann.points,
    })
    .eq('id', ann.id);
  if (error) {
    console.error('Failed to update annotation', error);
  }
}

async function deleteAnnotation(id) {
  const { error } = await sb.from('annotations').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete annotation', error);
  }
}

(async () => {
  annotations = await fetchAnnotations();
  updateFilterOptions();
  applyFilters();
  updateButtonStates();
})();

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
deleteBtn.addEventListener('click', async () => {
  if (!selected) return;
  if (selected.type === 'pending') {
    pendingPolygons.splice(selected.index, 1);
  } else if (selected.type === 'annotation') {
    const ann = displayedAnnotations[selected.index];
    const idx = annotations.indexOf(ann);
    if (idx !== -1) {
      annotations.splice(idx, 1);
      await deleteAnnotation(ann.id);
    }
  }
  selected = null;
  updateFilterOptions();
  applyFilters();
  updateButtonStates();
});

editShapeBtn.addEventListener('click', async () => {
  if (!selected && !shapeEditMode) return;
  if (!shapeEditMode) {
    shapeEditMode = true;
    editingType = selected.type;
    editingIdx = selected.index;
    editingPolygon = (selected.type === 'annotation')
      ? displayedAnnotations[selected.index].points
      : pendingPolygons[selected.index];
    vertexMoveBtn.textContent = 'Move';
  } else {
    shapeEditMode = false;
    vertexMenu.classList.add('hidden');
    selectedVertex = null;
    movingVertex = false;
    isDraggingVertex = false;
    vertexMoveBtn.textContent = 'Move';
    if (editingType === 'annotation') {
      await updateAnnotation(displayedAnnotations[editingIdx]);
    }
    rebuildPaths();
    draw();
  }
  updateButtonStates();
});

vertexDeleteBtn.addEventListener('click', async () => {
  if (editingPolygon && selectedVertex !== null) {
    editingPolygon.splice(selectedVertex, 1);
    selectedVertex = null;
    vertexMenu.classList.add('hidden');
    if (editingType === 'annotation') {
      await updateAnnotation(displayedAnnotations[editingIdx]);
    }
    rebuildPaths();
    draw();
  }
});

vertexMoveBtn.addEventListener('click', async () => {
  if (editingPolygon && selectedVertex !== null) {
    if (!movingVertex) {
      movingVertex = true;
      isDraggingVertex = false;
      vertexMoveBtn.textContent = 'Finish Move';
    } else {
      movingVertex = false;
      isDraggingVertex = false;
      vertexMoveBtn.textContent = 'Move';
      if (editingType === 'annotation') {
        await updateAnnotation(displayedAnnotations[editingIdx]);
      }
      rebuildPaths();
      draw();
    }
    updateVertexMenuPosition();
  }
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
  if (shapeEditMode && editingPolygon) drawHandles();
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

function drawHandles() {
  editingPolygon.forEach((pt, i) => {
    const x = pt[0] * canvas.width - 3;
    const y = pt[1] * canvas.height - 3;
    ctx.fillStyle = 'yellow';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, 6, 6);
    ctx.strokeRect(x, y, 6, 6);
  });
}

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (shapeEditMode) {
    if (movingVertex && isDraggingVertex && editingPolygon && selectedVertex !== null) {
      editingPolygon[selectedVertex] = [x / canvas.width, y / canvas.height];
      rebuildPaths();
      draw();
    }
    updateVertexMenuPosition();
    return;
  }
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
  if (shapeEditMode) {
    movingVertex = false;
    isDraggingVertex = false;
    updateVertexMenuPosition();
  }
});

canvas.addEventListener('mousedown', e => {
  if (shapeEditMode) {
    if (movingVertex) {
      isDraggingVertex = true;
    }
    return;
  }
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

canvas.addEventListener('mouseup', async () => {
  if (shapeEditMode) {
    if (isDraggingVertex) {
      isDraggingVertex = false;
      updateVertexMenuPosition();
    }
    return;
  }
  if (isDragging && selected && selected.type === 'annotation') {
    await updateAnnotation(displayedAnnotations[selected.index]);
  }
  isDragging = false;
});

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  if (shapeEditMode) {
    if (editingPolygon) {
      const threshold = 6;
      let found = -1;
      editingPolygon.forEach((pt, i) => {
        const vx = pt[0] * canvas.width;
        const vy = pt[1] * canvas.height;
        if (Math.abs(px - vx) <= threshold && Math.abs(py - vy) <= threshold) {
          found = i;
        }
      });
      if (found !== -1) {
        selectedVertex = found;
        vertexMenu.classList.remove('hidden');
        updateVertexMenuPosition();
      } else {
        vertexMenu.classList.add('hidden');
        selectedVertex = null;
      }
    }
    return;
  }

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
  if (shapeEditMode) return;
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

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (editingIndex !== null) {
    const ann = annotations[editingIndex];
    ann.author = form.author.value;
    ann.object = form.object.value;
    ann.description = form.description.value;
    ann.tags = form.tags.value.split(',').map(t => t.trim()).filter(t => t);
    await updateAnnotation(ann);
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
    const inserted = await addAnnotation(ann);
    if (inserted) {
      annotations.push(inserted);
    }
    pendingPolygons.splice(selected.index, 1);
    selected = null;
  } else {
    return;
  }
  modal.classList.add('hidden');
  form.reset();
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
  addBtn.disabled = !(selected && selected.type === 'pending') || shapeEditMode;
  editBtn.disabled = !(selected && selected.type === 'annotation') || shapeEditMode;
  deleteBtn.disabled = !selected || shapeEditMode;
  startPolygonBtn.disabled = drawingMode || shapeEditMode;
  editShapeBtn.disabled = !selected;
  editShapeBtn.textContent = shapeEditMode ? 'Save Polygon' : 'Edit Polygon';
}
