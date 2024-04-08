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
import {Overlay} from "ol";

/**
 * @typedef { {lat: number, lon: number, name: string,
 *  attrs: Object<string, string>, desc: string, link: string} } Monument
 */
/** @type { Monument[] } */
var monumentsData

var popupContainer = document.getElementById('popup');
var popupContent = document.getElementById('popup-content');
var popupCloser = document.getElementById('popup-closer');
if (!popupContent || !popupContainer || !popupCloser)
    throw new Error("popup, popup-content or popup-closer not found");

async function popupAnimate(isClose) {
    return new Promise(res => {
        $(popupContainer).css('scale', isClose ? 1.0 : 0.25);
        $(popupContainer).css('transform-origin', "16% 100%");
        $(popupContainer).animate({
                scale: isClose ? 0.25 : 1.0,
            }, 155, "linear",
            () => {
                res();
                $(popupContainer).css('scale', 1.0);
            });
    });
}

popupCloser.onclick = async function () {
    await popupAnimate(true);
    popupOverlay.setPosition(undefined);
    popupCloser.blur();
    return false;
};

var popupOverlay = new Overlay({
    element: popupContainer,
    autoPan: {
        animation: { duration: 250 }
    }
});

/** @param {Monument} monument */
function showPopup(monument) {
    var content = $(popupContent);
    content.empty();
    content.append($('<h3></h3>').text(monument.name));
    if (monument.desc)
        content.append($('<p></p>').text(monument.desc));
    var attrsDiv = $("<div>", {"class": "popup-attrs"});
    for (let key of Object.keys(monument.attrs))
        attrsDiv.append($('<p></p>').text(`${key}: ${monument.attrs[key]}`));
    content.append(attrsDiv);
    if (monument.link)
        content.append($('<a></a>',
            {href: monument.link, text: `Wiki: ${monument.link}`}));
    popupOverlay.setPosition([monument.lon, monument.lat]);
    popupAnimate(false).then();
}

app().then();

function createMap() {
    useGeographic();

    var monumentIcons = new MonumentMapIcons();

    const map = new Map({
        layers: [
            new TileLayer({
                source: new OSM(),
            }),
            monumentIcons.getVectorLayer()
        ],
        target: 'map',
        overlays: [popupOverlay],
        view: new View({
            center: [23.7360, 37.9788],
            zoom: 2,
            extent: [19.281, 35.907, 26.345, 41.870],
        }),
    });

    monumentIcons.bindClickEventToMap(map);

    console.dir( map.getControls().getArray()[0] );
    //var zoomControl = map.getControls().getArray()[0];
    map.on('moveend', (e) => {
        // [minX,minY,maxX,maxY]
        var currentExtent = map.getView().calculateExtent(map.getSize());
        console.dir(currentExtent);
        var monumentsInBbox = getMonumentsInBbox(currentExtent);
        console.dir(monumentsInBbox);
        monumentIcons.clearMonuments();
        monumentsInBbox.slice(0, 100).forEach(monument => {
            monumentIcons.addMonument(monument);
        })
    });
}

async function app() {
    monumentsData = await loadMonumentsData();
    console.dir(monumentsData);
    createMap();
}

async function loadMonumentsData() {
    var response = await fetch('resource/greece-monuments.json.gz');
    var blob = await response.blob();
    var ds = new DecompressionStream('gzip');
    var decompressedStream = blob.stream().pipeThrough(ds);

    var result = await new Response(decompressedStream).json();

    return result;
}

/** @param { number[] } bbox - [minX, minY, maxX, maxY]
 * @returns { Monument[] } */
function getMonumentsInBbox(bbox) {
    var result = [];
    for (let monument of monumentsData) {
        if ((monument.lon > bbox[0] && monument.lon < bbox[2])
            && (monument.lat > bbox[1] && monument.lat < bbox[3]))
        {
            result.push(monument);
        }
    }

    return result;
}

class MonumentMapIcons {
    constructor() {
        const iconsStyle = new Style({
            image: new Icon({
                color: '#00d0ff',
                crossOrigin: 'anonymous',
                src: 'img/monument.svg'
            })
        });
        this.vectorSource = new VectorSource({ features: [] });
        this.vectorLayer = new VectorLayer( {
            source: this.vectorSource,
            style: (feature, resolution) => {
                iconsStyle.getImage().setScale(2);
                return iconsStyle;
            }
        } );

        //map.addLayer(this.vectorLayer);
        //this.icons = {};
    }

    getVectorLayer() { return this.vectorLayer; }
    bindClickEventToMap(map) {
        map.on('click', (event) => {
            const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
                return feature;
            });
            if (feature) {
                var monument = feature.getProperties().monument
                console.log(monument);
                showPopup(monument);
            }
        });

        var lastHoveredFeature = null;
        function clearLastHoveredFeature() {
            if (lastHoveredFeature) {
                lastHoveredFeature.setStyle(new Style({
                    image: new Icon({
                        color: '#00d0ff',
                        crossOrigin: 'anonymous',
                        src: 'img/monument.svg',
                        scale: 2
                    })
                }));
                lastHoveredFeature = null;
            }
        }
        map.on('pointermove', (event) => {
            if (event.dragging)
                return;
            const feature = map.forEachFeatureAtPixel(event.pixel, function (feature) {
                return feature;
            });
            if (feature) {
                if (feature === lastHoveredFeature)
                    return;
                clearLastHoveredFeature();
                feature.setStyle(new Style({
                        image: new Icon({
                            color: '#7702f3',
                            crossOrigin: 'anonymous',
                            src: 'img/monument.svg',
                            scale: 2.5
                        })
                }));
                lastHoveredFeature = feature;
                console.log(feature);
            } else {
                clearLastHoveredFeature();
            }
        });
    }

    addMonument(monument) {
        var {lon, lat} = monument;
        this.vectorSource.addFeature(new Feature({
            geometry: new Point([lon, lat]),
            monument
        }));
    }

    clearMonuments() {
        this.vectorSource.clear();
    }
}