let coordPlantel =  [];

fetch(`https://web-production-b0921.up.railway.app/delimitacion?plantel=${encodeURIComponent(plantel)}`)
  .then(response => response.json())
  .then(data => {
    if (data.length > 0 && data[0].coordenadas) {
      coordPlantel = data[0].coordenadas; 
    } else {
      console.warn("No se encontraron coordenadas para el plantel");
    }
  })
  .catch(error => {
    console.error("Error al obtener coordenadas del plantel:", error);
});

fetch(`https://web-production-b0921.up.railway.app/poligonos?plantel=${encodeURIComponent(plantel)}`)
  .then(response => response.json())
  .then(data => {
    data.forEach(p => {
      const poligono = L.polygon(p.coordenadas, {
        color: p.color,
        fillColor: p.fillColor 
      }).addTo(map);
      
      poligono.bindTooltip(p.nombre.toUpperCase(), {
        permanent: true,
        direction: 'center',
        className: 'label-tooltip'
      });

      ListPoligon.push(poligono);
      
      const claveOriginal = transformarTexto(p.nombre);
      estadoOriginal.set(claveOriginal, p.fillColor);
      poligonosPorNombre.set(claveOriginal, poligono);

      const aliases = generarAlias(p.nombre);
      aliases.forEach(alias => {
        poligonosPorNombre.set(alias, poligono);
      });
    });
  })
  .catch(error => {
    console.error("Error al cargar polígonos:", error);
  });


  const LeafIcon = L.Icon.extend({
  options: {
    iconSize: [37, 67],
    iconAnchor: [19, 64]
  }
});

const iconos = {
  'bebedero': new LeafIcon({ iconUrl: 'imagenes/ImgBebede.png' }),
  'banio_hombre': new LeafIcon({ iconUrl: 'imagenes/baniosHombres.png' }),
  'banio_mujer': new LeafIcon({ iconUrl: 'imagenes/baniosMujeres.png' }),
  'banio_mix': new LeafIcon({ iconUrl: 'imagenes/baniosHombresMujeres.png' }),
  'entrada': new LeafIcon({ iconUrl: 'imagenes/entradas.png' })

};

fetch(`https://web-production-b0921.up.railway.app/marcadores?plantel=${encodeURIComponent(plantel)}`)
  .then(response => response.json())
  .then(marcadores => {
    marcadores.forEach(m => {
      const icono = iconos[m.tipo];
      if (!icono) return; 

      const marker = L.marker([m.lat, m.lng], { icon: icono }).addTo(map);
      marker.setOpacity(0); 
      if (m.tipo === 'bebedero') {
        Bebederos.push(marker);
        BebederosPos.push([m.lat, m.lng]); 
      } else if (m.tipo === 'banio_hombre') {
        baniosHombres.push(marker);
        baniosHomMujePos.push([m.lat, m.lng]);
      } else if (m.tipo === 'banio_mujer') {
        baniosMujeres.push(marker);
        baniosHomMujePos.push([m.lat, m.lng]);
      } else if (m.tipo === 'banio_mix') {
        baniosHomMuje.push(marker);
        baniosHomMujePos.push([m.lat, m.lng]);
      } else if (m.tipo === 'entrada') {
        entradasLugares.push(marker);
      }
    });
  })
  .catch(err => {
    console.error('Error al cargar marcadores:', err);
});

fetch(`https://web-production-b0921.up.railway.app/aulas?plantel=${encodeURIComponent(plantel)}`)
    .then(response => response.json())
    .then(data => {
    data.forEach(aula => {
        const obj = {
        nombre: aula.nombre,
        lat: aula.lat,
        lng: aula.lng,
        edificio: aula.Edifcio
        };
        Aulas.push(obj);
        AulasPorNombre.set(aula.nombre.toLowerCase(), obj);
    });
    })
    .catch(error => {
    console.error("Error al cargar aulas:", error);
});

var ITSON = L.polygon(
    coordPlantel
    
 ,{
    color: '#a2d2ff',
    fillOpacity: 0
}
).addTo(map);

