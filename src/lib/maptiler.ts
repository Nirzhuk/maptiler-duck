import * as maptilersdk from "@maptiler/sdk";
import { MAP_CONTAINER_ID } from "../constants/dom-elements";

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

const mapContainer = document.getElementById(MAP_CONTAINER_ID);

if (!mapContainer) {
	throw new Error("Map container not found");
}

const map = new maptilersdk.Map({
	container: mapContainer,
	style: maptilersdk.MapStyle.OUTDOOR,
	zoom: 3.5,
	center: [8.1316, 46.484],
	maxPitch: 80,
	pitch: 70,
});

map.on("load", () => {
	console.log("Map loaded");
	map.setProjection({ type: "globe" });
});

export default map;
