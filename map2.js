let map = L.map('map').setView([27.492363475345755, -109.97045313367545],30)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var popup = L.popup();

const plantel = "ITSON NAINARI";

var bebe = false;
var banioBool = false;
var bebederos = document.getElementById('BebederosBtn');
var baniosB = document.getElementById('BañosBtn');
var rutaBtn = document.getElementById('RutasBtn');
var LocalizarBtn = document.getElementById('LocalizarBtn');
var EtiquetasLugares = document.getElementsByClassName("label-tooltip");

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
var baniosHombresPos = [];
var baniosMujeresPos = [];
var baniosHomMujePos = [];
var entradasLugares = [];

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
            console.log("Coordenadas actualizadas:", e.latlng.lat, e.latlng.lng);
            markerPos = L.marker(e.latlng).addTo(map);
            PosActual = [e.latlng.lat, e.latlng.lng];
            dentroItson(e.latlng.lat, e.latlng.lng);
            markerPos.bindPopup("Tu posición actual").openPopup();
            PosLocalizada = true;
            resolve(); // ✅ resolvemos la promesa
        }

        function onLocationError(e) {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);

            PosLocalizada = false;
            enItson = false;
            console.log("falso");
            reject(); // ❌ rechazamos la promesa
        }

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        map.locate({ setView: true, maxZoom: 30 });
    });
}

function onLocationFound(e) {
    markerPos.remove();
    console.log("Coordenadas actualizadas:", e.latlng.lat, e.latlng.lng);
    markerPos = L.marker(e.latlng).addTo(map);
    PosActual = [e.latlng.lat, e.latlng.lng];
    dentroItson(e.latlng.lat, e.latlng.lng);
    markerPos.bindPopup("Tu posición actual").openPopup();
    PosLocalizada = true;
}

function onLocationError(e) {
    PosLocalizada = false;
    enItson = false;
    console.log("falso");
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

function edificio() {
  const Busqueda = document.getElementById("inputBusqueda").value;
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
  }
}

inputBusqueda.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
       // event.preventDefault(); 
        edificio();
        footer.style.visibility = 'visible';
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
    footer.style.visibility = 'visible';
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
        footer.style.visibility = 'hidden';
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
    console.log(baniosHombres);
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
    footer.style.visibility = 'visible';
    ocultarEtiquetas();
    caso = 2;
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
        if (caso == 2) {
            bebedeRut();
        } else if (caso == 1) {
            rutas(PosActual[0], PosActual[1], prom[0], prom[1]);
        }
    } catch (e) {
        console.log("No se pudo obtener la ubicación.");
        // podrías mostrar un mensaje al usuario
    }
});

function rutasEspecificas(){
    if(PosLocalizada){
        if(caso == 2){
            bebedeRut();
        }
        else if(caso == 1){
        rutas(PosActual[0],PosActual[1], prom[0],prom[1]);
        }
    }
    else{
        obtenerPosicion();
        rutasEspecificas();
    }
}

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
                    iconUrl: 'ImgBebede.png',
                    
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
                        iconUrl: 'baniosHombres.png',
                        
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
                        iconUrl: 'baniosMujeres.png',
                        
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
                        iconUrl: 'baniosHombresMujeres.png',
                        
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
            var scaleFactor = Math.pow(1.5, currentZoom - 12); // Ajustar escala del icono

            var iconSize = [5 * scaleFactor, 5* scaleFactor];
            marker.setIcon(L.icon({
                iconUrl: 'entradas.png',
                
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
  



