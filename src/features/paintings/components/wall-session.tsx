"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  createXRStore,
  useGetXRSpaceMatrix,
  useRequestXRAnchor,
  useXRHitTest,
  XR,
} from "@react-three/xr";
import {
  Matrix4,
  Quaternion,
  TextureLoader,
  Vector3,
  type Group,
  type Texture,
} from "three";

import { Brush, BrushButton } from "@/components/brush";
import { WALL_DEPTH, wallEmulated } from "@/features/paintings/wall";
import { useT } from "@/hooks/use-t";

/**
 * The Android half of "view on your wall": a WebXR session, drawn with React
 * Three Fiber. (iPhone goes through `wall-usdz.ts` instead.)
 *
 * This module is the only one that pulls in three and @react-three/*, and the
 * painting page loads it on demand — see `wall-view.tsx`.
 *
 * How a work gets into the room:
 *   1. Every frame a ray leaves the middle of the screen and is tested against
 *      the surfaces the phone has found — a wall, the floor, a table.
 *   2. While nothing is placed, a ghost of the work — real size, with an
 *      outline in its plate's colour — follows that hit. On something upright
 *      it hangs plumb; on something level it lies face up, its top edge away
 *      from whoever is holding the phone.
 *   3. A tap leaves it there, and an anchor is requested at that spot so the
 *      phone keeps it pinned as its picture of the room improves.
 */

/**
 * One store for the page's lifetime, as the library intends. A phone held up
 * to a wall has no controllers, hands or gaze to draw, and needs none of the
 * headset features — only hit-testing (required: without it there is no wall),
 * anchors, and the DOM overlay the hints and buttons live in.
 */
// The emulator will not install over a browser's own WebXR, and desktop Chrome
// has one — it just cannot do AR. In emulated development, step it aside.
if (wallEmulated()) {
  Object.defineProperty(navigator, "xr", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

const store = createXRStore({
  controller: false,
  hand: false,
  gaze: false,
  transientPointer: false,
  screenInput: false,
  handTracking: false,
  bodyTracking: false,
  layers: false,
  meshDetection: false,
  planeDetection: false,
  hitTest: "required",
  anchors: true,
  domOverlay: true,
  offerSession: false,
  enterGrantedSession: false,
  emulate: wallEmulated()
    ? { type: "metaQuest3", inject: true, syntheticEnvironment: "living_room" }
    : false,
});

type Placement = { position: Vector3; quaternion: Quaternion };

/** Primed canvas, unpainted: the paper of `globals.css`. */
const CANVAS_EDGE = "#fbfaf9";

/**
 * A surface leaning further than this from upright is a floor, a table or a
 * ceiling: the work lies on it instead of hanging from it.
 */
const MAX_LEAN = 0.35;

/** How far the ghost closes on its target each frame: steady, not sticky. */
const FOLLOW = 0.35;

// Scratch objects for the frame loop, so sixty hit-tests a second allocate
// nothing.
const HIT = new Matrix4();
const BASIS = new Matrix4();
const ANCHORED = new Matrix4();
const POINT = new Vector3();
const NORMAL = new Vector3();
const EYE = new Vector3();
const GAZE = new Quaternion();
const UP = new Vector3();
const RIGHT = new Vector3();
const SCALE = new Vector3();
const TARGET_POSITION = new Vector3();
const TARGET_QUATERNION = new Quaternion();

function subscribe(onChange: () => void) {
  return store.subscribe(onChange);
}

function useInSession(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => store.getState().session != null,
    () => false,
  );
}

export default function WallSession({
  imageUrl,
  width,
  height,
  accent,
  onEnd,
}: {
  imageUrl: string;
  /** Metres, as the work really is. */
  width: number;
  height: number;
  /** The work's plate — its strong partner outlines the ghost. */
  accent: string;
  /** The camera view has closed, however it closed. */
  onEnd: () => void;
}) {
  const { t } = useT();

  const [ready, setReady] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [found, setFound] = React.useState(false);
  const [placement, setPlacement] = React.useState<Placement | null>(null);

  const inSession = useInSession();

  // Set by a tap, spent by the next frame that has a surface under it.
  const wantsHang = React.useRef(false);

  React.useEffect(() => store.onSessionEnd(onEnd), [onEnd]);

  // Leaving the page with the camera open must not leave it open.
  React.useEffect(
    () => () => {
      void store.getState().session?.end().catch(() => undefined);
    },
    [],
  );

  const start = () => {
    setFailed(false);
    setStarting(true);
    setFound(false);
    setPlacement(null);
    wantsHang.current = false;
    store
      .enterAR()
      .catch(() => setFailed(true))
      .finally(() => setStarting(false));
  };

  const overlayRoot = store.getState().domOverlayRoot;

  return (
    <>
      {/* The canvas only ever shows inside the camera view, where the browser
          draws it for us. On the page it needs a size to exist and nothing
          else. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0"
      >
        <Canvas
          frameloop="demand"
          style={{ pointerEvents: "none" }}
          onCreated={() => setReady(true)}
        >
          <XR store={store}>
            {/* Suspense inside <XR>, so the session survives the picture
                loading. */}
            <React.Suspense fallback={null}>
              <Wall
                imageUrl={imageUrl}
                width={width}
                height={height}
                accent={accent}
                placement={placement}
                wantsHangRef={wantsHang}
                onFound={setFound}
                onHang={setPlacement}
              />
            </React.Suspense>
          </XR>
        </Canvas>
      </div>

      <BrushButton
        type="button"
        shape="dab"
        color="var(--primary)"
        tilt={-1.5}
        disabled={!ready || starting}
        onClick={start}
        className="text-primary-foreground disabled:opacity-60"
      >
        {!ready || starting ? t.wallPreparing : t.wallStart}
      </BrushButton>

      {failed && (
        <p role="alert" className="text-destructive m-0 text-sm leading-[1.6]">
          {t.wallFailed}
        </p>
      )}

      {inSession &&
        overlayRoot &&
        createPortal(
          <Hud
            hint={found ? t.wallAim : t.wallSearching}
            hung={placement !== null}
            moveLabel={t.wallMove}
            doneLabel={t.wallDone}
            closeLabel={t.wallClose}
            onHang={() => {
              wantsHang.current = true;
            }}
            onMove={() => {
              wantsHang.current = false;
              setPlacement(null);
            }}
            onDone={() => {
              void store.getState().session?.end().catch(() => undefined);
            }}
          />,
          overlayRoot,
        )}
    </>
  );
}

// --- inside the canvas -------------------------------------------------------

function Wall({
  imageUrl,
  width,
  height,
  accent,
  placement,
  wantsHangRef,
  onFound,
  onHang,
}: {
  imageUrl: string;
  width: number;
  height: number;
  accent: string;
  placement: Placement | null;
  wantsHangRef: React.RefObject<boolean>;
  onFound: (found: boolean) => void;
  onHang: (placement: Placement) => void;
}) {
  const texture = useLoader(TextureLoader, imageUrl);
  const camera = useThree((state) => state.camera);

  const ghost = React.useRef<Group>(null);
  const reported = React.useRef(false);

  // Without the DOM overlay there is nothing on screen to tap, so the
  // session's own tap is the only signal. With it, the overlay catches taps
  // itself — and listening here too would hang the work again the moment
  // "Move it" was pressed.
  React.useEffect(() => {
    return store.subscribe((state, previous) => {
      if (state.session === previous.session || state.session == null) return;
      const session = state.session;
      session.addEventListener("select", () => {
        if (session.domOverlayState == null) wantsHangRef.current = true;
      });
    });
  }, [wantsHangRef]);

  useXRHitTest(
    (results, getWorldMatrix) => {
      const hit = results[0];
      const found = hit !== undefined && getWorldMatrix(HIT, hit);

      if (found) {
        // A hit's Y axis is the surface's normal. Which way along it is not
        // promised, so turn it to face whoever is looking.
        POINT.setFromMatrixPosition(HIT);
        NORMAL.setFromMatrixColumn(HIT, 1).normalize();
        camera.getWorldPosition(EYE);
        if (NORMAL.dot(EYE.sub(POINT)) < 0) NORMAL.negate();

        if (Math.abs(NORMAL.y) <= MAX_LEAN) {
          // Upright — a wall. Hang it plumb: "up" is the world's up, not
          // whatever way the phone happens to be tilted.
          UP.set(0, 1, 0);
        } else {
          // Level — a floor, a table, a ceiling. There is no plumb here, so
          // "up" is the top of the screen: the work reads the right way round
          // to whoever is placing it.
          UP.set(0, 1, 0).applyQuaternion(camera.getWorldQuaternion(GAZE));
        }

        // Lay that "up" onto the surface, and build the work's frame from it:
        // across, up, and out towards the viewer.
        UP.addScaledVector(NORMAL, -UP.dot(NORMAL)).normalize();
        RIGHT.crossVectors(UP, NORMAL);
        BASIS.makeBasis(RIGHT, UP, NORMAL);
        TARGET_QUATERNION.setFromRotationMatrix(BASIS);
        TARGET_POSITION.copy(POINT);
      }

      if (found !== reported.current) {
        reported.current = found;
        onFound(found);
      }

      const following = found && placement === null;

      if (ghost.current) {
        if (following && ghost.current.visible) {
          ghost.current.position.lerp(TARGET_POSITION, FOLLOW);
          ghost.current.quaternion.slerp(TARGET_QUATERNION, FOLLOW);
        } else if (following) {
          // Just found a surface: appear on it, do not fly in from the last.
          ghost.current.position.copy(TARGET_POSITION);
          ghost.current.quaternion.copy(TARGET_QUATERNION);
        }
        ghost.current.visible = following;
      }

      if (wantsHangRef.current) {
        wantsHangRef.current = false;
        if (following) {
          onHang({
            position: TARGET_POSITION.clone(),
            quaternion: TARGET_QUATERNION.clone(),
          });
        }
      }
    },
    "viewer",
    "plane",
  );

  return (
    <>
      <group ref={ghost} visible={false}>
        <Work texture={texture} width={width} height={height} ghost />
        <Outline width={width} height={height} color={accent} />
      </group>

      {placement && (
        <Hung placement={placement}>
          <Work texture={texture} width={width} height={height} />
        </Hung>
      )}
    </>
  );
}

/**
 * The work, placed. It starts where it was tapped and, once the phone grants an
 * anchor there, follows the anchor instead — the same spot, corrected as the
 * phone learns the room.
 */
function Hung({
  placement,
  children,
}: {
  placement: Placement;
  children: React.ReactNode;
}) {
  const group = React.useRef<Group>(null);
  const requestAnchor = useRequestXRAnchor();

  // Kept with the placement it was made for: a work that has been moved must
  // not follow the anchor of the spot it left.
  const [anchored, setAnchored] = React.useState<{
    placement: Placement;
    anchor: XRAnchor;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    let made: XRAnchor | undefined;

    requestAnchor({
      relativeTo: "world",
      worldPosition: placement.position,
      worldQuaternion: placement.quaternion,
    })
      .then((anchor) => {
        if (!anchor) return;
        if (cancelled) {
          anchor.delete();
          return;
        }
        made = anchor;
        setAnchored({ placement, anchor });
      })
      // No anchors on this phone: the work simply stays where it was tapped.
      .catch(() => undefined);

    return () => {
      cancelled = true;
      try {
        made?.delete();
      } catch {
        // The session ended first and took the anchor with it.
      }
    };
  }, [placement, requestAnchor]);

  const anchor =
    anchored?.placement === placement ? anchored.anchor : undefined;
  const getAnchorMatrix = useGetXRSpaceMatrix(anchor?.anchorSpace);

  useFrame((_state, _delta, frame: XRFrame | undefined) => {
    if (!group.current) return;
    if (getAnchorMatrix?.(ANCHORED, frame)) {
      ANCHORED.decompose(
        group.current.position,
        group.current.quaternion,
        SCALE,
      );
    } else {
      group.current.position.copy(placement.position);
      group.current.quaternion.copy(placement.quaternion);
    }
  });

  return (
    <group
      ref={group}
      position={placement.position}
      quaternion={placement.quaternion}
    >
      {children}
    </group>
  );
}

/**
 * A stretched canvas: a thin box standing off the surface with the photograph
 * on its face. Unlit on purpose — the photograph already carries the studio's
 * light, and shading it again by guesswork would only change its colours.
 */
function Work({
  texture,
  width,
  height,
  ghost = false,
}: {
  texture: Texture;
  width: number;
  height: number;
  ghost?: boolean;
}) {
  return (
    <>
      {!ghost && (
        <mesh position={[0, 0, WALL_DEPTH / 2]}>
          <boxGeometry args={[width, height, WALL_DEPTH]} />
          <meshBasicMaterial color={CANVAS_EDGE} toneMapped={false} />
        </mesh>
      )}
      {/* A hair proud of the box, so the two never fight for the same pixels. */}
      <mesh position={[0, 0, WALL_DEPTH + 0.0005]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          map={texture}
          toneMapped={false}
          transparent={ghost}
          opacity={ghost ? 0.6 : 1}
          depthWrite={!ghost}
        />
      </mesh>
    </>
  );
}

/** The ghost's edge, so a pale work still reads against a pale surface. */
function Outline({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) {
  const line = 0.006;
  const z = WALL_DEPTH + 0.001;
  const x = width / 2 + line / 2;
  const y = height / 2 + line / 2;

  const bars: Array<[number, number, number, number]> = [
    [0, y, width + line * 2, line],
    [0, -y, width + line * 2, line],
    [x, 0, line, height],
    [-x, 0, line, height],
  ];

  return (
    <>
      {bars.map(([px, py, w, h]) => (
        <mesh key={`${px}:${py}`} position={[px, py, z]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

// --- over the camera ---------------------------------------------------------

/**
 * What sits on top of the camera view. The whole screen is the "place it"
 * button until the work is down; after that it is two buttons and nothing else.
 */
function Hud({
  hint,
  hung,
  moveLabel,
  doneLabel,
  closeLabel,
  onHang,
  onMove,
  onDone,
}: {
  hint: string;
  hung: boolean;
  moveLabel: string;
  doneLabel: string;
  closeLabel: string;
  onHang: () => void;
  onMove: () => void;
  onDone: () => void;
}) {
  // A tap on a button here is also a tap on the scene behind it, unless the
  // browser is told otherwise before it decides.
  const controls = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const keep = (event: Event) => event.preventDefault();
    node.addEventListener("beforexrselect", keep);
    return () => node.removeEventListener("beforexrselect", keep);
  }, []);

  return (
    <div
      onClick={hung ? undefined : onHang}
      className="text-foreground fixed inset-0 z-[70] flex flex-col justify-between p-[clamp(16px,4vw,32px)] font-sans select-none"
    >
      <div ref={controls} className="flex justify-end">
        <button
          type="button"
          aria-label={closeLabel}
          onClick={(event) => {
            event.stopPropagation();
            onDone();
          }}
          className="text-primary-foreground relative isolate size-11 flex-none cursor-pointer border-0 bg-transparent font-sans text-[22px] leading-none"
        >
          <Brush
            shape="small"
            color="var(--primary)"
            className="absolute -inset-1 -z-10"
          />
          ×
        </button>
      </div>

      <div
        ref={controls}
        className="flex flex-wrap items-center justify-center gap-[var(--space-3)] pb-[env(safe-area-inset-bottom)]"
      >
        {hung ? (
          <>
            <BrushButton
              type="button"
              shape="line4"
              color="var(--color-plate-butter)"
              tilt={1.5}
              className="text-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onMove();
              }}
            >
              {moveLabel}
            </BrushButton>
            <BrushButton
              type="button"
              shape="dab"
              color="var(--primary)"
              tilt={-1.5}
              className="text-primary-foreground"
              onClick={(event) => {
                event.stopPropagation();
                onDone();
              }}
            >
              {doneLabel}
            </BrushButton>
          </>
        ) : (
          <p
            role="status"
            className="relative isolate m-0 px-7 py-3 text-center text-[15px] leading-[1.5] text-balance"
          >
            <Brush
              shape="line3"
              color="var(--background)"
              className="absolute inset-0 -z-10"
            />
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
