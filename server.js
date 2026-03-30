const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const getFilePath = (tipo) => path.join(__dirname, `${tipo}.txt`);

app.get('/api/catalogo', async (req, res) => {
    const { tipo } = req.query;
    if (tipo !== 'peliculas' && tipo !== 'series') {
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    try {
        const data = await fs.readFile(getFilePath(tipo), 'utf-8');
        const lineas = data.split('\n').filter(line => line.trim() !== '');
        
        const resultados = lineas.map(linea => {
            const partes = linea.split(',').map(p => p.trim());
            if (tipo === 'peliculas') {
                return { nombre: partes[0], director: partes[1], anio: Number(partes[2]) };
            } else {
                return { nombre: partes[0], anio: Number(partes[1]), temporadas: Number(partes[2]) };
            }
        });

        res.json(resultados);
    } catch (error) {
        res.status(500).json({ error: 'Error al leer los datos' });
    }
});

app.post('/api/catalogo', async (req, res) => {
    const { tipo, nombre, anio, extra } = req.body;
    
    if (tipo !== 'peliculas' && tipo !== 'series') {
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    try {
        const nuevaLinea = `\n${nombre}, ${extra}, ${anio}`;
        await fs.appendFile(getFilePath(tipo), nuevaLinea, 'utf-8');
        res.status(201).json({ message: 'Registro agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar los datos' });
    }
});

app.delete('/api/catalogo', async (req, res) => {
    const { tipo, nombre } = req.query;

    if (tipo !== 'peliculas' && tipo !== 'series') {
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    try {
        const filePath = getFilePath(tipo);
        const data = await fs.readFile(filePath, 'utf-8');
        const lineas = data.split('\n').filter(line => line.trim() !== '');
        
        const nuevasLineas = lineas.filter(linea => !linea.toLowerCase().startsWith(nombre.toLowerCase() + ','));
        
        if (lineas.length === nuevasLineas.length) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        await fs.writeFile(filePath, nuevasLineas.join('\n'), 'utf-8');
        res.json({ message: 'Registro eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al procesar la eliminación' });
    }
});

app.all('/api/catalogo', (req, res) => {
    res.status(405).json({ error: 'Método no permitido' });
});

app.listen(PORT, () => {
    console.log(`Servidor activo en http://localhost:${PORT}`);
});