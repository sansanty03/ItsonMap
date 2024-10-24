let map = L.map('map').setView([27.492363475345755, -109.97045313367545],30)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var popup = L.popup();

let PosLocalizada = false;
let PosActual=[];

function obtenerPosicion() {
    map.locate({ setView: true, maxZoom: 16 });
}

function onLocationFound(e) {
    markerPos.remove();
    console.log("Coordenadas actualizadas:", e.latlng.lat, e.latlng.lng);
    markerPos = L.marker(e.latlng).addTo(map);
    PosActual = [e.latlng.lat, e.latlng.lng];
    markerPos.bindPopup("Tu posición actual").openPopup();
    PosLocalizada = true;
    console.log("real");
}

function onLocationError(e) {
    PosLocalizada = false;
    console.log("falso");
}

var footer = document.querySelector('footer');

map.on('locationfound', onLocationFound);

map.on('locationerror', onLocationError);

document.addEventListener("DOMContentLoaded", function() {

const estadoOriginal = new Map();

var bebe = false;

 var bebederos = document.getElementById('BebederosBtn');

 var bañosB = document.getElementById('BañosBtn');

 var rutaBtn = document.getElementById('RutasBtn');

var prom = [];

var caso = 0;

var poligonos = {
    "av1800": av1800,
    "av1600": av1600,
    "av1500": av1500,
    "av1400": av1400,
    "av1300": av1300,
    "av1200": av1200,
    "av1100": av1100,
    "av1000": av1000,
    "av800": av800,
    "av700": av700, 
    "av900": av900,
    "av600": av600,
    "av500": av500,
    "av400": av400,
    "av300": av300,
    "av200": av200,
    "lv100": LV100,
    "lv200": LV200,
    "lv300": LV300,
    "lv500":LV500,
    "lv700":LV700,
    "lv800":LV800,
    "lv900":LV900,
    "lv1500": LV1500,
    "lv1100": LV1100,
    "tutorias": Tutorias,
};

for (var nombre in poligonos) {
        estadoOriginal.set(nombre, poligonos[nombre].options.fillColor );
      //  console.log(nombre);     
}

function quitarAcentos(text) {
    return text
        .replace(/[áäàâ]/g, 'a')
        .replace(/[éëèê]/g, 'e')
        .replace(/[íïìî]/g, 'i')
        .replace(/[óöòô]/g, 'o')
        .replace(/[úüùû]/g, 'u')
        .replace(/[ñ]/g, 'n');
}

function transformarTexto(texto) {
    const textoSinAcento = quitarAcentos(texto);
    
    const textoTransformado = textoSinAcento.toLowerCase().replace(/\s/, '');
    return textoTransformado;
  }

function colorOriginal(){
    for (var nombre in poligonos) {
        poligonos[nombre].setStyle({ fillColor: estadoOriginal.get(nombre) });
       
    } 
}  
  
function edificio(){

    var Busqueda = document.getElementById("inputBusqueda").value;
    var inputBusqueda = transformarTexto(Busqueda);
   colorOriginal();
    if(poligonos.hasOwnProperty(inputBusqueda)){ 
        var poligono = poligonos[inputBusqueda];
        poligono.setStyle({ fillColor: 'green' });
       const coordenadasPoligono = poligono.getLatLngs();
    
    let sumaLatitud = 0;
    let sumaLongitud = 0;
    
    for (const coordenada of coordenadasPoligono[0]) {
        sumaLatitud += coordenada.lat;
        sumaLongitud += coordenada.lng;
    }
    
    const promedioLatitud = sumaLatitud / coordenadasPoligono[0].length;
    const promedioLongitud = sumaLongitud / coordenadasPoligono[0].length;
    
    prom = [promedioLatitud, promedioLongitud];
    
    const latitud = prom[0];
    const longitud = prom[1];
    
    const coordenadas = new L.LatLng(latitud, longitud);
    caso = 1;
    map.flyTo(coordenadas,18);
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
    
    if(!bebe){
        var i = 0;
    for (var bebedero in Bebederos) {
        mark = Bebederos[i];
        mark.setOpacity(1);
        i++;
    }
    bebe = !bebe;
    footer.style.visibility = 'visible';
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

    }

{


}
});

bañosB.addEventListener('click', function () {

    //obtenerPosicion();
    footer.style.visibility = 'visible';
   colorOriginal();
    console.log("prueba2");

});

rutaBtn.addEventListener('click', function () {
    obtenerPosicion();
    
    if(PosLocalizada){
        if(caso == 2){
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
        else if(caso == 1){
        rutas(PosActual[0],PosActual[1], prom[0],prom[1]);
        }
    }

    

});


map.on('zoomend', function() {
    if(bebe){
    var currentZoom = map.getZoom();
  
    markers.forEach(function(marker) {
        if (currentZoom < 15) {
            marker.setOpacity(0); // Ocultar marcador si el zoom es menor a 12
        } else {
            marker.setOpacity(1); // Mostrar marcador si el zoom es mayor o igual a 12
            var scaleFactor = Math.pow(1.5, currentZoom - 12); // Ajustar escala del icono
    
            var iconSize = [5 * scaleFactor, 5* scaleFactor];
            marker.setIcon(L.icon({
                iconUrl: 'ImgBebede.png',
                
                iconSize: iconSize,
                iconAnchor: [iconSize[0] / 2, iconSize[1]],
                popupAnchor: [0, -iconSize[1] / 2]
                
            }));
            
        }
    });}
});

  });
  



