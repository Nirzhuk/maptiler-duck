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
	model: THREE.Object3D | null;

	constructor(id: string) {
		this.id = id;
		this.type = "custom";
		this.renderingMode = "3d";
		this.camera = new THREE.Camera();
		this.scene = new THREE.Scene();
		this.renderer = new THREE.WebGLRenderer();
		this.map = map;
		this.model = null;
	}

	prepare3D() {
		this.camera = new THREE.Camera();
		this.scene = new THREE.Scene();
		// create two three.js lights to illuminate the model
		const directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(0, -70, 100).normalize();
		this.scene.add(directionalLight);
		const directionalLight2 = new THREE.DirectionalLight(0xffffff);
		directionalLight2.position.set(0, 70, 100).normalize();
		this.scene.add(directionalLight2);
	}

	loadModel() {
		// Load the duck model
		const loader = new GLTFLoader();
		loader.load(
			"https://cnpjqkntxsyhzoffjrpb.supabase.co/storage/v1/object/public/duck/duck.gltf",
			(gltf) => {
				console.log(gltf);
				const model = gltf.scene;
				this.scene.add(model);

				// Set satellite position and scale
				model.position.set(0, 0, 0);
				model.scale.set(0.1, 0.1, 0.1);
				this.model = model;
			},
		);
	}

	onAdd(map: MapType, gl: WebGLRenderingContext) {
		this.prepare3D();
		this.renderer = new THREE.WebGLRenderer({
			canvas: map.getCanvas(),
			context: gl,
			antialias: true,
		});

		this.loadModel();

		this.renderer.autoClear = false;
	}

	rotateModel() {
		if (this.model) {
			this.model.rotation.y += 0.01;
		}
	}

	addDuckToMap(args: CustomRenderMethodInput) {
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
	}

	render(_gl: WebGLRenderingContext, args: CustomRenderMethodInput) {
		this.rotateModel();
		this.addDuckToMap(args);

		this.renderer.resetState();
		this.renderer.render(this.scene, this.camera);
		this.map.triggerRepaint();
	}
}
