import type { CustomRenderMethodInput, Map as MapType } from "@maptiler/sdk";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import map from "./lib/maptiler.ts";
import type { CustomLayerWithThree } from "./types/layers.ts";

export class DuckLayer implements CustomLayerWithThree {
	id: string;
	type: "custom";
	renderingMode: "3d";
	camera: THREE.Camera;
	scene: THREE.Scene;
	renderer: THREE.WebGLRenderer;
	map: MapType;
	constructor(id: string) {
		this.id = id;
		this.type = "custom";
		this.renderingMode = "3d";
		this.camera = new THREE.Camera();
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.map = map;
	}
	onAdd(map: MapType, gl: WebGLRenderingContext) {
		this.camera = new THREE.Camera();
		this.scene = new THREE.Scene();

		// create two three.js lights to illuminate the model
		const directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(0, -70, 100).normalize();
		this.scene.add(directionalLight);
		const directionalLight2 = new THREE.DirectionalLight(0xffffff);
		directionalLight2.position.set(0, 70, 100).normalize();
		this.scene.add(directionalLight2);
		// use the three.js GLTF loader to add the 3D model to the three.js scene
		const loader = new GLTFLoader();
		loader.load("/duck.gltf", (gltf) => {
			this.scene.add(gltf.scene);
		});
		this.map = map;

		// use the MapLibre GL JS map canvas for three.js
		this.renderer = new THREE.WebGLRenderer({
			canvas: map.getCanvas(),
			context: gl,
			antialias: true,
		});
		loader.load(
			"https://cnpjqkntxsyhzoffjrpb.supabase.co/storage/v1/object/public/duck/duck.gltf",
			(gltf) => {
				console.log(gltf);
				const satellite = gltf.scene;
				this.scene.add(satellite);

				// Set satellite position and scale
				satellite.position.set(0, 0, 0);
				satellite.scale.set(0.1, 0.1, 0.1);

				// Animation loop
				const animate = () => {
					requestAnimationFrame(animate);

					// Rotate the satellite
					satellite.rotation.y += 0.01;

					this.renderer.render(this.scene, this.camera);
				};
				animate();
			},
		);

		this.renderer.autoClear = false;
	}

	render(_gl: WebGLRenderingContext, args: CustomRenderMethodInput) {
		const modelOrigin = [8.1316, 46.484];
		const modelAltitude = 0;

		const scaling = 3_000.0;

		const modelMatrix = map.transform.getMatrixForModel(
			{ lng: modelOrigin[0], lat: modelOrigin[1] },
			modelAltitude,
		);

		const m = new THREE.Matrix4().fromArray(
			args.defaultProjectionData.mainMatrix,
		);
		const l = new THREE.Matrix4()
			.fromArray(modelMatrix)
			.scale(new THREE.Vector3(scaling, scaling, scaling));

		this.camera.projectionMatrix = m.multiply(l);
		this.renderer.resetState();
		this.renderer.render(this.scene, this.camera);
		this.map.triggerRepaint();
	}
}
