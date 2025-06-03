const image = document.getElementById('image');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const authorSelect = document.getElementById('authorSelect');
const objectSelect = document.getElementById('objectSelect');
const downloadBtn = document.getElementById('downloadBtn');
let annotations = [];
let currentPolygon = [];

fetch('annotations.json')
    .then(res => res.json())
    .then(data => {
        annotations = data;
        populateFilters();
        draw();
    });

function populateFilters() {
    const authors = [...new Set(annotations.map(a => a.author))];
    const objects = [...new Set(annotations.map(a => a.object))];
    authorSelect.innerHTML = '<option value="all">All</option>' + authors.map(a => `<option value="${a}">${a}</option>`).join('');
    objectSelect.innerHTML = '<option value="all">All</option>' + objects.map(o => `<option value="${o}">${o}</option>`).join('');
}

function draw() {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const authorFilter = authorSelect.value;
    const objectFilter = objectSelect.value;
    annotations
        .filter(a => (authorFilter === 'all' || a.author === authorFilter))
        .filter(a => (objectFilter === 'all' || a.object === objectFilter))
        .forEach(a => {
            ctx.beginPath();
            a.points.forEach((p, i) => {
                const x = p[0] * canvas.width;
                const y = p[1] * canvas.height;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
}

authorSelect.addEventListener('change', draw);
objectSelect.addEventListener('change', draw);
image.onload = draw;

canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;
    currentPolygon.push([x, y]);
    draw();
    drawCurrent();
});

canvas.addEventListener('dblclick', () => {
    if (currentPolygon.length > 2) {
        const author = prompt('Author?') || 'unknown';
        const object = prompt('Object?') || 'object';
        annotations.push({ author, object, points: currentPolygon });
        populateFilters();
    }
    currentPolygon = [];
    draw();
});

function drawCurrent() {
    if (currentPolygon.length === 0) return;
    ctx.beginPath();
    currentPolygon.forEach((p, i) => {
        const x = p[0] * canvas.width;
        const y = p[1] * canvas.height;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 1;
    ctx.stroke();
}

downloadBtn.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(annotations, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = 'annotations.json';
    a.click();
});
