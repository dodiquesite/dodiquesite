import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';

import {Style, Icon} from 'ol/style';

import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import 'ol/proj';
import {useGeographic} from 'ol/proj';

import 'ol/ol.css'
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

useGeographic();

const map = new Map({
    layers: [
        new TileLayer({
            source: new OSM(),
        }),
    ],
    target: 'map',
    view: new View({
        center: [23.7360, 37.9788],
        zoom: 2,
        extent: [19.281, 35.907, 26.345, 41.870],
    }),
});

var monumentsData
loadMonumentsData().then(mondata=> monumentsData = mondata)

async function loadMonumentsData() {
    let response = await fetch('osm-server/greece-monuments.json.gz');
    let blob = await response.blob();
    const ds = new DecompressionStream('gzip');
    const decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).json();
}