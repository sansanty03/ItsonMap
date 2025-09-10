
var lineasLayer = L.layerGroup().addTo(map);

function cerrarPoligono(coords) {
    const sonIguales = (a, b, tolerancia = 1e-9) =>
        Math.abs(a.lat - b.lat) < tolerancia && Math.abs(a.lng - b.lng) < tolerancia;

    if (coords.length > 0 && !sonIguales(coords[0], coords[coords.length - 1])) {
        return [...coords, coords[0]];
    }
    return coords;
}


function crearMatrizDesdePoligonos(poligonos, anchoGrid = 100, altoGrid = 100, excluirPoligono = null) {
   const bounds = boundsFijos; // siempre el campus
    const matriz = Array.from({ length: altoGrid }, () => Array.from({ length: anchoGrid }, () => 0));

    poligonos.forEach(poligono => {
        if (poligono === excluirPoligono) return;

        let coords = cerrarPoligono(poligono.getLatLngs()[0]);

        try {
            const polygon = turf.polygon([coords.map(c => [c.lng, c.lat])]);

            for (let y = 0; y < altoGrid; y++) {
                for (let x = 0; x < anchoGrid; x++) {
                    const lng = bounds.getWest() + (x / anchoGrid) * (bounds.getEast() - bounds.getWest());
                    const lat = bounds.getSouth() + (y / altoGrid) * (bounds.getNorth() - bounds.getSouth());

                    if (turf.booleanPointInPolygon(turf.point([lng, lat]), polygon)) {
                        matriz[y][x] = 1;
                    }
                }
            }
        } catch (e) {
            console.error("Error procesando polígono:", e, poligono);
        }
    });

    return matriz;
}


function obtenerPoligonoContenedor(lat, lng, listaPoligonos) {
    const punto = turf.point([lng, lat]);

    for (const poligono of listaPoligonos) {
        try {
            const coords = poligono.getLatLngs()[0];
            const coordsCerrados = [...coords, coords[0]]; 
            const turfPoligono = turf.polygon([[...coordsCerrados.map(c => [c.lng, c.lat])]]);

            if (turf.booleanPointInPolygon(punto, turfPoligono)) {
                return poligono;
            }
        } catch (e) {
            console.error("Error verificando polígono:", e);
        }
    }

    return null; 
}


function rutas(latInicio, lonInicio, latFin, lonFin){
  const poligonoDestino = obtenerPoligonoContenedor(latFin, lonFin, ListPoligon);

  if (poligonoDestino !== null) {
      rutasEdificio(latInicio, lonInicio, latFin, lonFin, poligonoDestino);
  } else {
      rutasEdificio(latInicio, lonInicio, latFin, lonFin);
  }

}

function rutasEdificio(latInicio, lonInicio, latFin, lonFin, poligonoDestino = null) {
    lineasLayer.clearLayers();

    try {
        const bounds = map.getBounds();
        const anchoGrid = 100;
        const altoGrid = 100;

        const gridMatrix = crearMatrizDesdePoligonos(ListPoligon, anchoGrid, altoGrid, poligonoDestino);
        const grid = new PF.Grid(gridMatrix);

        function convertirLngACol(lng, bounds, ancho) {
            return Math.max(0, Math.min(ancho - 1,
                Math.floor(((lng - bounds.getWest()) / (bounds.getEast() - bounds.getWest())) * ancho)));
        }

        function convertirLatAFila(lat, bounds, alto) {
            return Math.max(0, Math.min(alto - 1,
                Math.floor(((lat - bounds.getSouth()) / (bounds.getNorth() - bounds.getSouth())) * alto)));
        }

        const inicioX = convertirLngACol(lonInicio, bounds, anchoGrid);
        const inicioY = convertirLatAFila(latInicio, bounds, altoGrid);
        const finX = convertirLngACol(lonFin, bounds, anchoGrid);
        const finY = convertirLatAFila(latFin, bounds, altoGrid);

        const finder = new PF.AStarFinder({
            diagonalMovement: PF.DiagonalMovement.Never,
            heuristic: PF.Heuristic.euclidean
        });

        const path = finder.findPath(inicioX, inicioY, finX, finY, grid.clone());

        if (!path || path.length === 0) {
            throw new Error("No se encontró ruta válida entre los puntos");
        }

        const rutaCoords = path.map(pos => {
            const y = pos[1];
            const x = pos[0];
            const lat = bounds.getSouth() + (y / altoGrid) * (bounds.getNorth() - bounds.getSouth());
            const lng = bounds.getWest() + (x / anchoGrid) * (bounds.getEast() - bounds.getWest());
            return [lat, lng];
        });

        const lineString = turf.lineString(rutaCoords.map(coord => [coord[1], coord[0]]));
        const smoothed = turf.bezierSpline(lineString, { resolution: 300, sharpness: 0.5 });

        L.geoJSON(smoothed, {
            style: {
                color: '#4285F4',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round'
            }
        }).addTo(lineasLayer);

        L.marker(rutaCoords[0], {
            icon: L.divIcon({
                className: 'start-marker',
                html: '<div class="marker-circle start"></div>',
                iconSize: [20, 20]
            })
        }).addTo(lineasLayer);

        L.marker(rutaCoords[rutaCoords.length - 1], {
            icon: L.divIcon({
                className: 'end-marker',
                html: '<div class="marker-circle end"></div>',
                iconSize: [20, 20]
            })
        }).addTo(lineasLayer);

    } catch (error) {
        console.error("Error en rutas():", error);
        alert("Error: " + error.message);
    }
}


function calcularDistancia(lat1, lon1, lat2, lon2) {
    const radioTierraKm = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanciaKm = radioTierraKm * c;
    const distanciaMetros = distanciaKm * 1000;
    return distanciaMetros;
}

function deg2rad(grados) {
    return grados * (Math.PI / 180);
}

const toRadians = (degrees) => degrees * (Math.PI / 180);
const toDegrees = (radians) => radians * (180 / Math.PI);
const degreesToRadians = (degrees) => degrees * (Math.PI / 180);




