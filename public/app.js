const API_URL = '/api/catalogo';
let currentData = [];
let currentType = '';

const btnPeliculas = document.getElementById('btnPeliculas');
const btnSeries = document.getElementById('btnSeries');
const resultados = document.getElementById('resultados');
const sortControls = document.getElementById('sortControls');
const sortSelect = document.getElementById('sortSelect');
const formPelicula = document.getElementById('formPelicula');
const formSerie = document.getElementById('formSerie');

btnPeliculas.addEventListener('click', () => fetchData('peliculas'));
btnSeries.addEventListener('click', () => fetchData('series'));
sortSelect.addEventListener('change', sortData);

formPelicula.addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('peliculas', {
        nombre: document.getElementById('pNombre').value,
        extra: document.getElementById('pDirector').value,
        anio: document.getElementById('pAnio').value
    });
    formPelicula.reset();
});

formSerie.addEventListener('submit', async (e) => {
    e.preventDefault();
    await postData('series', {
        nombre: document.getElementById('sNombre').value,
        extra: document.getElementById('sTemporadas').value,
        anio: document.getElementById('sAnio').value
    });
    formSerie.reset();
});

async function fetchData(tipo) {
    currentType = tipo;
    try {
        const response = await fetch(`${API_URL}?tipo=${tipo}`);
        currentData = await response.json();
        setupSorting(tipo);
        renderData();
    } catch (error) {
        console.error(error);
    }
}

async function postData(tipo, data) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo, ...data })
        });
        if (response.ok) {
            if (currentType === tipo) fetchData(tipo);
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteData(tipo, nombre) {
    try {
        const response = await fetch(`${API_URL}?tipo=${tipo}&nombre=${encodeURIComponent(nombre)}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            fetchData(tipo);
        }
    } catch (error) {
        console.error(error);
    }
}

function setupSorting(tipo) {
    sortControls.classList.remove('hidden');
    sortSelect.innerHTML = '<option value="nombre">Nombre</option><option value="anio">Año</option>';
    if (tipo === 'peliculas') {
        sortSelect.innerHTML += '<option value="director">Director</option>';
    } else {
        sortSelect.innerHTML += '<option value="temporadas">Temporadas</option>';
    }
}

function sortData() {
    const sortBy = sortSelect.value;
    currentData.sort((a, b) => {
        if (typeof a[sortBy] === 'string') {
            return a[sortBy].localeCompare(b[sortBy]);
        }
        return a[sortBy] - b[sortBy];
    });
    renderData();
}

function renderData() {
    resultados.innerHTML = '';
    currentData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        
        let content = `<h4>${item.nombre} (${item.anio})</h4>`;
        if (currentType === 'peliculas') {
            content += `<p>Director: ${item.director}</p>`;
        } else {
            content += `<p>Temporadas: ${item.temporadas}</p>`;
        }
        
        content += `<button onclick="deleteData('${currentType}', '${item.nombre}')" class="btn-danger">Eliminar</button>`;
        div.innerHTML = content;
        resultados.appendChild(div);
    });
}