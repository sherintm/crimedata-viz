function createMap(LGAData) {
  document.getElementById('weathermap').innerHTML =
    "<div id='map' style='width: 100%; height: 100%;'></div>";

  const vic_lga = L.geoJSON(LGAData, {
    style: style,
    onEachFeature: onEachFeature,
  });

  const grayscaleMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.outdoors',
      accessToken: API_KEY,
    }
  );

  const satelliteMap = L.tileLayer(
    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.satellite',
      accessToken: API_KEY,
    }
  );

  const outdoorsMap = L.tileLayer(
    'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.light',
      accessToken: API_KEY,
    }
  );

  const baseMaps = {
    'Grayscale Map': grayscaleMap,
    'Outdoor Map': outdoorsMap,
    'Satellite Map': satelliteMap,
  };

  const overlayMaps = {
    VIC_LGA: vic_lga,
  };

  const myMap = L.map('map', {
    center: [-37.5089, 145.7748],
    zoom: 7,
    layers: [grayscaleMap, vic_lga],
  });

  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    const legends = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    div.innerHTML = '<div>Rate Per 100K</div>';
    legends.forEach((legend, i) => {
      const next = legends[i + 1]
        ? '&ndash; ' + legends[i + 1] * 1000 + '<br>'
        : '+';
      div.innerHTML += `<div class="legend-range" style="background: ${getColour(
        legend
      )}">${legends[i] * 1000} ${next}</div>`;
    });

    return div;
  };

  legend.addTo(myMap);

  const info = L.control();

  info.onAdd = function () {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
  };

  // method that we will use to update the control based on feature properties passed
  info.update = function (props) {
    this._div.innerHTML = props
      ? '<b>' + props.lga_pid + '</b><br />' + props.vic_lga__3
      : 'Hover over a LGA';
  };

  info.addTo(myMap);

  function highlightFeature(e) {
    const layer = e.target;
    const {
      feature: {
        properties: { lga_pid, vic_lga__3 },
      },
    } = e.target;

    layer.setStyle({
      weight: 2,
      color: '#BD0026',
      dashArray: '',
      fillOpacity: 0.4,
    });

    info.update(layer.feature.properties);

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    vic_lga.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    myMap.fitBounds(e.target.getBounds());
    createStats(e.target.feature);
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature,
    });
  }

  function style(feature) {
    const incidentsRecorded =
      feature.properties.lga_crime_data?.rate_per_100k || 10000;
    return {
      fillColor: getColour(incidentsRecorded / 1000),
      weight: 1,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.6,
    };
  }
}

function createStats(feature) {
  const {
    properties: { lga_pid, vic_lga__3, lga_crime_data },
  } = feature;

  const statDiv = document.querySelector('.stat-bar');

  const statText = !lga_crime_data
    ? `<h2>Click a LGA on map to view details</h2>`
    : `
  <ul><li>LGA ID : <div class='stat-value' style='color: ${getColour(
    lga_crime_data.rate_per_100k / 1000
  )}' >${lga_pid}</div></li><li>Name : <div class='stat-value' style='color: ${getColour(
        lga_crime_data.rate_per_100k / 1000
      )}'>${vic_lga__3}</div></li><li>Recorded Incidents: <div class='stat-value' style='color: ${getColour(
        lga_crime_data.rate_per_100k / 1000
      )}'>${
        lga_crime_data.incidents_recorded
      }</div></li><li>Rate Per 100K : <div class='stat-value' style='color: ${getColour(
        lga_crime_data.rate_per_100k / 1000
      )}'>${lga_crime_data.rate_per_100k}</div></li></ul>
  `;

  statDiv.innerHTML = statText;
  statDiv.classList.remove('highlighting');
  void statDiv.offsetWidth;
  statDiv.classList.add('highlighting');
}

function createCrimeCharts(incidentsData) {
  const lowCrimeData = incidentsData
    .sort((a, b) => a.rate_per_100k_population - b.rate_per_100k_population)
    .slice(0, 10);

  const highCrimeData = incidentsData
    .sort((a, b) => {
      a.rate_per_100k_population + b.rate_per_100k_population;
      if (a.rate_per_100k_population > b.rate_per_100k_population) {
        return -1;
      } else {
        return 1;
      }
    })
    .slice(0, 10);

  const lowData = [
    {
      x: lowCrimeData.map((data) => data.rate_per_100k_population),
      y: lowCrimeData.map((data) => data.lga),
      type: 'bar',
      orientation: 'h',
      text: lowCrimeData.map((data) => data.rate_per_100k_population),
      textposition: 'auto',
      marker: {
        color: 'rgb(158,202,225)',
        opacity: 0.6,
        line: {
          color: 'rgb(255,255,255)',
          width: 1.5,
        },
      },
    },
  ];

  const highData = [
    {
      x: highCrimeData.map((data) => data.rate_per_100k_population),
      y: highCrimeData.map((data) => data.lga),
      type: 'bar',
      orientation: 'h',
      text: highCrimeData.map((data) => data.rate_per_100k_population),
      textposition: 'auto',
      marker: {
        color: 'rgb(222,45,38,0.8)',
        opacity: 0.6,
        line: {
          color: 'rgb(222,45,38,0.8)',
          width: 1.5,
        },
      },
    },
  ];

  const layout1 = {
    margin: {
      t: 40,
      l: 150,
    },
    title: {
      text: 'Top 10 LGAs with Low Crime Rate Per 100k',
    },
    yaxis: {
      autorange: 'reversed',
    },
  };

  const layout2 = {
    margin: {
      t: 40,
      l: 150,
    },
    title: {
      text: 'Top 10 LGAs with High Crime Rate Per 100k',
    },
    yaxis: {
      autorange: 'reversed',
    },
  };

  Plotly.newPlot('safe_lga', lowData, layout1, { responsive: true });
  Plotly.newPlot('unsafe_lga', highData, layout2, { responsive: true });
}

function createOffenceTypeCharts(offenceData) {
  const offenceTypeData = [
    {
      values: offenceData.map((data) => data.incidents),
      labels: offenceData.map((data) => data.offence_division),
      type: 'pie',
      hole: 0.7,
      text: 'Types',
      textposition: 'inside',
      domain: { x: [1, 1] },
    },
  ];

  const layout = {
    title: 'Percentage of Each Offence Type',
    grid: { rows: 1, columns: 1 },
    annotations: [
      {
        font: {
          size: 24,
        },
        showarrow: false,
        text: 'Offences',
        x: 0.5,
        y: 0.5,
      },
    ],
  };

  Plotly.newPlot('offence_type', offenceTypeData, layout, { responsive: true });
}

function createTimeChart(offenceData) {
  const offenceArray = [
    'Property and deception offences',
    'Crimes against the person',
    'Justice procedures offences',
    'Other offences',
    'Public order and security offences',
    'Drug offences',
  ];
  const offenceTypeData = [];
  const traceArr = [];

  offenceArray.forEach((offence) => {
    const selectedData = offenceData.filter(
      (data) => data.offence_division === offence
    );
    offenceTypeData.push(selectedData);
  });

  offenceTypeData.forEach((data) => {
    const trace = {
      x: data.map((offence) => offence.year),
      y: data.map((offence) => offence.incidents),
      name: data[0].offence_division,
      mode: 'lines',
      line: {
        shape: 'spline',
        smoothing: 1.3,
      },
    };
    traceArr.push(trace);
  });

  const layout = {
    title: 'Yearly Total Incidents by Offence Type',
    xaxis: {
      tickangle: -45,
    },
    barmode: 'group',
  };

  Plotly.newPlot('incidents_by_year', traceArr, layout, { responsive: true });
}

function createVictimCharts(victimData) {
  const maleData = victimData.filter((data) => data.afm_gender === 'Males');
  const femaleData = victimData.filter((data) => data.afm_gender === 'Females');

  const trace1 = {
    x: maleData.map((victim) => victim.afm_age_group),
    y: maleData.map((victim) => victim.afm_counter),
    type: 'bar',
    name: 'Male',
    marker: {
      color: 'rgb(49,130,189)',
      opacity: 0.7,
    },
  };

  const trace2 = {
    x: femaleData.map((victim) => victim.afm_age_group),
    y: femaleData.map((victim) => victim.afm_counter),
    type: 'bar',
    name: 'Female',
    marker: {
      color: 'rgb(204,204,204)',
      opacity: 0.7,
    },
  };

  const data = [trace1, trace2];

  const layout = {
    title: 'Victims by Gender and AgeGroup',
    xaxis: {
      tickangle: -45,
    },
    barmode: 'group',
  };

  Plotly.newPlot('victims', data, layout, { responsive: true });
}

const onYearChange = async () => {
  const year = document.querySelector('#year-select').value;
  showLoader();
  await renderPanels(year);
  hideLoader();
};

const renderPanels = async (year = 2021) => {
  const initialStats = {
    properties: {
      lga_pid: 100,
      vic_lga__3: 'Victoria',
      vic_lga__5: '3',
      vic_lga_sh: '2015-09-21',
    },
  };
  const offenceData = await d3.json(`${OFFENCE_API}/${year}`);
  const offenceYearlyData = await d3.json(OFFENCE_API);
  const victimData = await d3.json(`${VICTIM_API}/${year}`);
  const crimeData = await d3.json(`${CRIME_API}/${year}`);

  createStats(initialStats);
  createOffenceTypeCharts(offenceData);
  createVictimCharts(victimData);
  createCrimeCharts(crimeData);
  createTimeChart(offenceYearlyData);
};

const renderMap = async (year = 2021) => {
  const vicLgaData = await d3.json(`${LGA_API}/${year}`);
  createMap(vicLgaData);
};

const init = async () => {
  showLoader();
  await renderPanels();
  await renderMap();
  hideLoader();
};

init();
