import {
    Terrain,
    Viewer,
    Ion,
    Cesium3DTileStyle,
    Cesium3DTileset,
    Math as CesiumMath,
    Cartesian3
} from "cesium";

import * as Cesium from "cesium";
import "./style.css";

// =======================
// TOKEN
// =======================
Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

// =======================
// VIEWER
// =======================
const viewer = new Viewer("cesiumContainer", {
    terrain: Terrain.fromWorldTerrain(),
    timeline: false,
    animation: false,
    sceneModePicker: false,
    baseLayerPicker: false,
});

// 🟢 TERRAIN DEFAULT
viewer.scene.verticalExaggeration = 3.0;
viewer.scene.verticalExaggerationRelativeHeight = 0.0;

// =======================
// TILESET
// =======================
let tileset;

try {
    tileset = await Cesium3DTileset.fromIonAssetId(4944209);
    viewer.scene.primitives.add(tileset);

    viewer.scene.globe.depthTestAgainstTerrain = true;

    await viewer.flyTo(tileset);

} catch (e) {
    console.error("Tileset Fehler:", e);
}

// =======================
// CAMERA
// =======================
viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(
        8.704723,
        48.443524,
        2000
    ),
    orientation: {
        heading: CesiumMath.toRadians(20),
        pitch: CesiumMath.toRadians(-20),
        roll: 0.0,
    },
    duration: 0.5
});

// =======================
// TILESET STYLE
// =======================
if (tileset) {
    tileset.style = new Cesium3DTileStyle({
        color: {
            conditions: [
                ["${Height} >= 40", "color('darkred')"],
                ["${Height} >= 30", "color('red')"],
                ["${Height} >= 25", "color('orangered')"],
                ["${Height} >= 20", "color('orange')"],
                ["${Height} >= 15", "color('gold')"],
                ["${Height} >= 10", "color('yellow')"],
                ["${Height} >= 5", "color('limegreen')"],
                ["true", "color('deepskyblue')"]
            ]
        }
    });
}

// =======================
// 🟢 TERRAIN SLIDER (FIXED)
// =======================
const terrainSlider = document.getElementById("terrainSlider");
const terrainValue = document.getElementById("terrainValue");

terrainSlider.addEventListener("input", (e) => {
    const value = Number(e.target.value);

    viewer.scene.verticalExaggeration = value;
    viewer.scene.verticalExaggerationRelativeHeight = 0.0;

    terrainValue.textContent = value.toFixed(1);
});

// =======================
// 🔵 TILESET SLIDER (FIXED)
// =======================
const tilesetSlider = document.getElementById("tilesetSlider");
const tilesetValue = document.getElementById("tilesetValue");

let baseMatrix;

if (tileset) {
    await tileset.readyPromise;
    baseMatrix = Cesium.Matrix4.clone(tileset.modelMatrix);

    tilesetSlider.addEventListener("input", (e) => {
        const height = Number(e.target.value);

        tilesetValue.textContent = height;

        const translation = Cesium.Matrix4.fromTranslation(
            new Cesium.Cartesian3(0, 0, height)
        );

        tileset.modelMatrix = Cesium.Matrix4.multiply(
            baseMatrix,
            translation,
            new Cesium.Matrix4()
        );
    });
}