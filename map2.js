let map = L.map('map').setView([27.492363475345755, -109.97045313367545],30)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var popup = L.popup();

const plantel = "ITSON_NAINARI";

var bebe = false;
var banioBool = false;
var bebederos = document.getElementById('BebederosBtn');
var baniosB = document.getElementById('BañosBtn');
var rutaBtn = document.getElementById('RutasBtn');
var LocalizarBtn = document.getElementById('LocalizarBtn');
var EtiquetasLugares = document.getElementsByClassName("label-tooltip");
var ubiBtn = document.getElementById("UbicacionBtn");

var footer = document.querySelector('footer');

var prom = [];

var caso = 0;  

let PosLocalizada = false;
let enItson = false;
let PosActual=[];

var ListPoligon = [];
const Bebederos = [];    
const BebederosPos = [];    
var baniosHombres = [];
var baniosMujeres = [];
var baniosHomMuje = [];
var baniosHomMujePos = [];
var entradasLugares = [];
const Aulas = []; 
const AulasPorNombre = new Map();


const poligonosPorNombre = new Map(); 
const estadoOriginal = new Map();     
const poligonosPorId = new Map();     


function obtenerPosicion() {
    map.locate({ setView: true, maxZoom: 30 });
}

function obtenerPosicionAsync() {
    return new Promise((resolve, reject) => {
        function onLocationFound(e) {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);

            if (markerPos) markerPos.remove();
            markerPos = L.marker(e.latlng).addTo(map);
            PosActual = [e.latlng.lat, e.latlng.lng];
            dentroItson(e.latlng.lat, e.latlng.lng);
            markerPos.bindPopup("Tu posición actual").openPopup();
            PosLocalizada = true;
            resolve(); 
        }

        function onLocationError(e) {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);

            PosLocalizada = false;
            enItson = false;
            reject(); 
        }

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        map.locate({ setView: true, maxZoom: 30 });
    });
}

function obtenerEdificioDeAula(nombreAula) {
  const aula = AulasPorNombre.get(nombreAula.toLowerCase());
  if (aula) {
    return aula.edificio;
  } else {
    console.warn(`No se encontró el aula ${nombreAula}`);
    return null;
  }
}

function obtenerLatLonDeAula(nombreAula) {
  const aula = AulasPorNombre.get(nombreAula.toLowerCase());
  if (aula) {
    return { lat: aula.lat, lng: aula.lng };
  } else {
    console.warn(`No se encontró el aula ${nombreAula}`);
    return null;
  }
}

function onLocationFound(e) {
    markerPos.remove();
    markerPos = L.marker(e.latlng).addTo(map);
    PosActual = [e.latlng.lat, e.latlng.lng];
    dentroItson(e.latlng.lat, e.latlng.lng);
    markerPos.bindPopup("Tu posición actual").openPopup();
    PosLocalizada = true;
}

function onLocationError(e) {
    PosLocalizada = false;
    enItson = false;
}

function dentroItson(lat, lon){
    var pointT = turf.point([lat, lon]);  
    var polygon = turf.polygon([coordItson]);
    enItson = turf.booleanPointInPolygon(pointT, polygon);

}

function quitarAcentos(text) {
    return text
        .replace(/[áäàâ]/g, 'a')
        .replace(/[éëèê]/g, 'e')
        .replace(/[íïìî]/g, 'i')
        .replace(/[óöòô]/g, 'o')
        .replace(/[úüùû]/g, 'u')
        .replace(/[ni]/g, 'n');
}

function transformarTexto(texto) {
    const textoSinAcento = quitarAcentos(texto);
    
    const textoTransformado = textoSinAcento.toLowerCase().replace(/\s/, '');
    return textoTransformado;
}

function generarAlias(nombre) {
  const base = transformarTexto(nombre);
  const palabras = base.split(' ');

  const combinaciones = new Set();

  combinaciones.add(base);                 
  combinaciones.add(palabras.join(''));        
  combinaciones.add(palabras.reverse().join('')); 
  combinaciones.add(palabras.join(' '));      

  return Array.from(combinaciones);
}

function colorOriginal() {
  for (let [nombre, poligono] of poligonosPorNombre.entries()) {
    if (estadoOriginal.has(nombre)) {
      poligono.setStyle({ fillColor: estadoOriginal.get(nombre) });
    }
  }
}

function ocultarEtiquetas(){
    ListPoligon.forEach(p => {
    if (p.closeTooltip) p.closeTooltip();
  });

  colorOriginal(); 
}

function mostrarEtiquetas() {
  ListPoligon.forEach(p => {
    if (p.openTooltip) p.openTooltip();
  });
}


map.on('locationfound', onLocationFound);

map.on('locationerror', onLocationError);


document.addEventListener("DOMContentLoaded", function() {

function edificio(nombreEdifcio) {
  const Busqueda = nombreEdifcio;
  const inputBusqueda = transformarTexto(Busqueda);

  ocultarEtiquetas();

  if (poligonosPorNombre.has(inputBusqueda)) {
    const poligono = poligonosPorNombre.get(inputBusqueda);
    poligono.setStyle({ fillColor: 'green' });

    const coordenadasPoligono = poligono.getLatLngs()[0];

    let sumaLat = 0, sumaLng = 0;
    for (const coord of coordenadasPoligono) {
      sumaLat += coord.lat;
      sumaLng += coord.lng;
    }

    const latitud = sumaLat / coordenadasPoligono.length;
    const longitud = sumaLng / coordenadasPoligono.length;
    prom = [latitud, longitud];
    caso = 1;

    map.flyTo([latitud, longitud], 18);

    // Mostrar solo el tooltip del polígono buscado
    poligono.openTooltip();
    setTimeout(() => {
     mostrarEtiquetas();
    }, 7000);
  }
}

function aulaBusqueda(nombreAula){
    const edificio = obtenerEdificioDeAula(nombreAula);
    const coords = obtenerLatLonDeAula(nombreAula);
    edificio(edificio);
    prom = [coords.lat, coords.lng];
    caso = 1;
    map.flyTo([coords.lat, coords.lng], 18);
    rutaBtn.style.visibility = 'visible';

}

inputBusqueda.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
       // event.preventDefault(); 
        var nombreEdifcio = document.getElementById("inputBusqueda").value;
        edificio(nombreEdifcio);
        rutaBtn.style.visibility = 'visible';
    }
});

bebederos.addEventListener('click', function () {
   mostrarBebederos();
});

function mostrarBebederos(){
    if(!bebe){
        var i = 0;
    for (var bebedero in Bebederos) {
        mark = Bebederos[i];
        mark.setOpacity(1);
        i++;
    }
    bebe = !bebe;
    rutaBtn.style.visibility = 'visible';
    ocultarEtiquetas();
    caso = 2;
    } 
    else if(bebe){
        var i = 0;
        for (var bebedero in Bebederos) {
            mark = Bebederos[i];
            mark.setOpacity(0);
            i++;
        }
        bebe = !bebe;
        ocultarBebederos();

    }
}

function ocultarBebederos() {
    if(!bebe && !banioBool ){
        rutaBtn.style.visibility = 'hidden';
        mostrarEtiquetas()
    }
}

baniosB.addEventListener('click', function () {

    //obtenerPosicion();
    mostrarBanios();

});

function mostrarBanios(){
    if(!banioBool){
        var i = 0;
    for (var banio in baniosHombres) {
        mark = baniosHombres[i];
        mark.setOpacity(1);
        i++;
    }
    var i = 0;
    for (var banio in baniosMujeres) {
        mark = baniosMujeres[i];
        mark.setOpacity(1);
        i++;
    }
    var i = 0;
    for (var banio in baniosHomMuje) {
        mark = baniosHomMuje[i];
        mark.setOpacity(1);
        i++;
    }

    banioBool = !banioBool;
    rutaBtn.style.visibility = 'visible';
    ocultarEtiquetas();
    caso = 3;
    } 
    else if(banioBool){
        var i = 0;
        for (var banio in baniosHombres) {
            mark = baniosHombres[i];
            mark.setOpacity(0);
            i++;
        }
        var i = 0;
        for (var banio in baniosMujeres) {
        mark = baniosMujeres[i];
        mark.setOpacity(0);
        i++;
        }
        var i = 0;
        for (var banio in baniosHomMuje) {
        mark = baniosHomMuje[i];
        mark.setOpacity(0);
        i++;
        }
        banioBool = !banioBool;
        ocultarBebederos();
    }

}

rutaBtn.addEventListener('click', async function () {
    try {
        await obtenerPosicionAsync(); 
        if(enItson){
        if (caso == 2) {
            bebedeRut();
        } else if (caso == 3) {
            baniosRut();
        } else if (caso == 1) {
            rutas(PosActual[0], PosActual[1], prom[0], prom[1]);
        }
        }
        else{
             
        }
    } catch (e) {
        console.log("No se pudo obtener la ubicación.");
        
    }
});

function bebedeRut(){
    var BebederoPun;
    var distancias= [];
    for (let g = 0; g < BebederosPos.length; g++) {
      var distan = calcularDistancia(BebederosPos[g][0], BebederosPos[g][1]  ,PosActual[0],PosActual[1]);
      distancias.push(distan);
     

    }

    var distanMinima = Infinity;
    for (let g = 0; g < BebederosPos.length; g++) {
      if (distancias[g] <= distanMinima) {
        BebederoPun = g; 
        distanMinima = distancias[g];
      }

    }
    rutas(PosActual[0],PosActual[1],BebederosPos[BebederoPun][0], BebederosPos[BebederoPun][1]);

}

function baniosRut() {
    var BaniosPun;
    var distancias= [];
    for (let g = 0; g < baniosHomMujePos.length; g++) {
      var distan = calcularDistancia(baniosHomMujePos[g][0], baniosHomMujePos[g][1]  ,PosActual[0],PosActual[1]);
      distancias.push(distan);
    }
    var distanMinima = Infinity;
    for (let g = 0; g < baniosHomMujePos.length; g++) {
      if (distancias[g] <= distanMinima) {
        BaniosPun = g; 
        distanMinima = distancias[g];
      }
    }
    rutas(PosActual[0],PosActual[1],baniosHomMujePos[BaniosPun][0], baniosHomMujePos[BaniosPun][1]);
}

ubiBtn.addEventListener('click', function () {

    obtenerPosicionAsync();

});

map.on('zoomend', function() {
    var currentZoom = map.getZoom();
    if (bebe) {
        Bebederos.forEach(function(marker) {
            if (currentZoom < 15) {
                marker.setOpacity(0); 
            } else {
                marker.setOpacity(1); 
                var scaleFactor = Math.pow(1.5, currentZoom - 12); 
        
                var iconSize = [5 * scaleFactor, 5* scaleFactor];
                marker.setIcon(L.icon({
                    iconUrl: 'imagenes/ImgBebede.png',
                    
                    iconSize: iconSize,
                    iconAnchor: [iconSize[0] / 2, iconSize[1]],
                    popupAnchor: [0, -iconSize[1] / 2]
                    
                }));
            }
        });
    }
    if(banioBool){
            baniosHombres.forEach(function(marker) {
                if (currentZoom < 15) {
                    marker.setOpacity(0);
                } else {
                    marker.setOpacity(1); 
                    var scaleFactor = Math.pow(1.5, currentZoom - 12); 
            
                    var iconSize = [5 * scaleFactor, 5* scaleFactor];
                    marker.setIcon(L.icon({
                        iconUrl: 'imagenes/baniosHombres.png',
                        
                        iconSize: iconSize,
                        iconAnchor: [iconSize[0] / 2, iconSize[1]],
                        popupAnchor: [0, -iconSize[1] / 2]
                        
                    }));
                    
                }
            });

            baniosMujeres.forEach(function(marker) {
                if (currentZoom < 15) {
                    marker.setOpacity(0); 
                } else {
                    marker.setOpacity(1); 
                    var scaleFactor = Math.pow(1.5, currentZoom - 12); 
            
                    var iconSize = [5 * scaleFactor, 5* scaleFactor];
                    marker.setIcon(L.icon({
                        iconUrl: 'imagenes/baniosMujeres.png',
                        
                        iconSize: iconSize,
                        iconAnchor: [iconSize[0] / 2, iconSize[1]],
                        popupAnchor: [0, -iconSize[1] / 2]
                        
                    }));
                    
                }
            });

            baniosHomMuje.forEach(function(marker) {
                if (currentZoom < 15) {
                    marker.setOpacity(0);
                } else {
                    marker.setOpacity(1); 
                    var scaleFactor = Math.pow(1.5, currentZoom - 12);
            
                    var iconSize = [5 * scaleFactor, 5* scaleFactor];
                    marker.setIcon(L.icon({
                        iconUrl: 'imagenes/baniosHombresMujeres.png',
                        
                        iconSize: iconSize,
                        iconAnchor: [iconSize[0] / 2, iconSize[1]],
                        popupAnchor: [0, -iconSize[1] / 2]
                        
                    }));
                    
                }
            });

    }
    if(!enItson){
    entradasLugares.forEach(function(marker) {
        if (currentZoom < 15) {
            marker.setOpacity(0);
        } else {
            marker.setOpacity(1); 
            var scaleFactor = Math.pow(1.5, currentZoom - 12);

            var iconSize = [5 * scaleFactor, 5* scaleFactor];
            marker.setIcon(L.icon({
                iconUrl: 'imagenes/entradas.png',
                
                iconSize: iconSize,
                iconAnchor: [iconSize[0] / 2, iconSize[1]],
                popupAnchor: [0, -iconSize[1] / 2]
                
            }));
            
        }
    });
    }
    for (i = 0; i < EtiquetasLugares.length; i++) {
        if (currentZoom < 18) {
            EtiquetasLugares[i].style.opacity = 0;
        }
        else {
            EtiquetasLugares[i].style.opacity = 1;
        }
    }

});
});
  



