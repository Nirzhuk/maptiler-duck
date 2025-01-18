import "./style.css";
import type { CustomLayerInterface } from "@maptiler/sdk";
import type * as THREE from "three";

export type CustomLayerWithThree = CustomLayerInterface & {
	camera: THREE.Camera;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
};
