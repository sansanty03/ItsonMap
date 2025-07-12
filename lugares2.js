
let coordItson =  [[27.491253914310835,-109.97349934058605],[27.494984215063315,-109.97349397858893],
[27.496644729207,-109.97348325459471],[27.496678034392065,-109.97347789259759],
[27.49672085532945,-109.97342963462353],[27.496792223521425,-109.97323124073024],
[27.496806497154267,-109.97311327679373],[27.496925444022658,-109.97266286903597],
[27.4969492333809,-109.97243766515713],[27.496953991251935,-109.972292891235],
[27.49692068615038,-109.97219101328977],[27.49689213891245,-109.97212130732727],
[27.496844560166142,-109.97203015337631],[27.49675891837094,-109.97192827543113],
[27.49663045555319,-109.97180494949745],[27.496126118596923,-109.97157438362144],
[27.496040476242783,-109.97149931566184],[27.49596910756342,-109.97140816171085],
[27.49592152841814,-109.97134381774546],[27.49585967549855,-109.97125266379453],
[27.495774032937113,-109.97105963189833],[27.495712688520584,-109.97089743564035],
[27.495646077556277,-109.97052745783938],[27.495598498271388,-109.97038804591435],
[27.495541403102376,-109.9702593579836],[27.495446244421558,-109.97011458406148],
[27.49532729595485,-109.96998589613068],[27.495198831466446,-109.96990546617394],
[27.495198831466446,-109.96991082817107],[27.49497520774014,-109.96985184620276],
[27.494718277791705,-109.96981967422008],[27.494585054619392,-109.9697875022374],
[27.494466105222184,-109.9697553302547],[27.494342397712728,-109.9696963482864],
[27.494185384135186,-109.96961591832968],[27.49401885433854,-109.96953548837293],
[27.493857082294873,-109.96942288643352],[27.493719100069786,-109.96930492249695],
[27.493657245912754,-109.96921913054311],[27.49359063370475,-109.96911189060079],
[27.493262330090857,-109.96825397106227],[27.49315289533537,-109.96795369922377],
[27.49309579889798,-109.96782501129299],[27.493024428309642,-109.96768023737086],
[27.492957815718775,-109.96757835942566],[27.49296257376232,-109.96757835942566],
[27.49225362300743,-109.96815209311706],[27.49219176802707,-109.96815745511417],
[27.491982412451044,-109.96831831502766],[27.491887250693967,-109.96815745511417],
[27.49184442787647,-109.96799123320356],[27.492039509465794,-109.9677982013074],
[27.491963380106203,-109.96743358550354],[27.49070723807316,-109.96743358550354],
[27.49082619153148,-109.96814136912282],[27.49088328914583,-109.96845236495555],
[27.491011758669842,-109.96895639268442],[27.491092646811786,-109.96904754663541],
[27.49125918103451,-109.96974460626048],[27.49126393915149,-109.96985184620276],
[27.491244906682457,-109.97146580733465],[27.491244906682457,-109.97150870331156],
[27.49125442291738,-109.97211460898566],[27.49125918103451,-109.9721628669597],
[27.49126393915149,-109.97349800424155],[27.491253914310835,-109.97349934058605]];

var ITSON = L.polygon(
    coordItson
    
 ,{
    color: '#a2d2ff',
    fillOpacity: 0
}
).addTo(map);

fetch('https://web-production-b0921.up.railway.app/poligonos?plantel=${plantel}')
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

fetch('https://web-production-b0921.up.railway.app/marcadores?plantel=${plantel}')
  .then(response => response.json())
  .then(marcadores => {
    marcadores.forEach(m => {
      const icono = iconos[m.tipo.toLowerCase()];
      if (!icono) return; 

      const marker = L.marker([m.lat, m.lng], { icon: icono }).addTo(map);
      marker.setOpacity(0); 
      if (m.tipo === 'bebedero') {
        Bebederos.push(marker);
        BebederosPos.push([m.lat, m.lng]); 
      } else if (m.tipo === 'banio_hombre') {
        baniosHombres.push(marker);
        baniosHombresPos.push([m.lat, m.lng]);
        console.log(baniosHombres);
      } else if (m.tipo === 'banio_mujer') {
        baniosMujeres.push(marker);
        baniosMujeresPos.push([m.lat, m.lng]);
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


    var markerPos = L.marker([27.49265, -109.971157],{opacity:0,iconSize:3 }).addTo(map);

    var markerAyk = L.marker([27.49265, -109.971157],{opacity:0,iconSize:3 }).addTo(map);
