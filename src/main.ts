import "./style.css";

import "@maptiler/sdk/dist/maptiler-sdk.css";

import { DuckLayer } from "./duckLayer.ts";
import map from "./lib/maptiler.ts";

document
	.querySelector<HTMLButtonElement>("#current-projection-btn")
	?.addEventListener("click", () => {
		// Toggle projection
		const currentProjection = map.getProjection();
		map.setProjection({
			type: currentProjection.type === "globe" ? "mercator" : "globe",
		});
		map.setZoom(currentProjection.type === "globe" ? 5.5 : 3.5);
	});

map.on("style.load", () => {
	map.addLayer(new DuckLayer("duck"));
});
