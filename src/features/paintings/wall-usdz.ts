import {
  BoxGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  SRGBColorSpace,
  TextureLoader,
} from "three";
import { USDZExporter } from "three/examples/jsm/exporters/USDZExporter.js";

import { WALL_DEPTH } from "@/features/paintings/wall";

/**
 * The iPhone half of "view in your room".
 *
 * Safari has no WebXR, but it opens a USDZ file in AR Quick Look — Apple's own
 * viewer, which finds a surface, puts the model on it and keeps it there. So the
 * work is built here as the same thin box the Android scene draws, exported in
 * the browser, and handed over. Nothing is uploaded and nothing is stored.
 */

/** Primed canvas, unpainted: the paper of `globals.css`. */
const CANVAS_EDGE = "#fbfaf9";

export async function buildWallUsdz({
  url,
  width,
  height,
}: {
  url: string;
  /** Metres. */
  width: number;
  height: number;
}): Promise<Blob> {
  const texture = await new TextureLoader().loadAsync(url);
  texture.colorSpace = SRGBColorSpace;

  const stretcher = new Mesh(
    new BoxGeometry(width, height, WALL_DEPTH),
    new MeshStandardMaterial({ color: CANVAS_EDGE, roughness: 1, metalness: 0 }),
  );
  stretcher.position.z = WALL_DEPTH / 2;

  const face = new Mesh(
    new PlaneGeometry(width, height),
    new MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0 }),
  );
  // A hair proud of the box, so the two never fight for the same pixels.
  face.position.z = WALL_DEPTH + 0.0005;

  // Built upright, facing +Z, like the Android scene. Quick Look stands a
  // model on whatever it anchors to — the model's +Y points out of the
  // surface — so the work is laid on its back: the face turns to +Y and the
  // top edge to -Z. On a floor that is face up; on a wall, -Z is "up".
  const work = new Group();
  work.add(stretcher, face);
  work.rotation.x = -Math.PI / 2;

  const scene = new Scene();
  scene.add(work);
  scene.updateMatrixWorld(true);

  try {
    const bytes = await new USDZExporter().parseAsync(scene, {
      ar: {
        anchoring: { type: "plane" },
        // Any surface: wall, floor or table — the visitor's choice.
        planeAnchoring: { alignment: "any" },
      },
      includeAnchoringProperties: true,
      quickLookCompatible: true,
      maxTextureSize: 2048,
    });
    return new Blob([bytes], { type: "model/vnd.usdz+zip" });
  } finally {
    texture.dispose();
    for (const mesh of [stretcher, face]) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  }
}

/**
 * Hands a USDZ to AR Quick Look. Safari only treats a link as AR when it is
 * `rel="ar"` with an image inside it; `allowsContentScaling=0` takes away the
 * pinch-to-resize, which is the whole point — the work stays its real size.
 */
export function openQuickLook(objectUrl: string): void {
  const link = document.createElement("a");
  link.rel = "ar";
  link.href = `${objectUrl}#allowsContentScaling=0`;
  link.appendChild(document.createElement("img"));
  link.click();
}
