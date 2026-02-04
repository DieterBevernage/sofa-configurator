import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ConcreteBench } from './components/ConcreteBench';
import { Interface } from './components/Interface';
import { OrderSummary } from './components/OrderSummary';
import { useConfiguratorStore } from './store/useConfiguratorStore';
import * as THREE from 'three';
import { useGLTF, useTexture, Environment, OrbitControls, GizmoHelper, GizmoViewcube, ContactShadows } from '@react-three/drei';
import { PRODUCTS } from './config/products';
import { findSnapPosition } from './utils/snapping';
import { checkCollision } from './utils/collision';
import { CAMERA_CONFIG } from './config/camera';
import { FINISHES } from './config/finishes';
import { GRASS_CONFIG } from './config/grass';
import { LIGHTING_CONFIG } from './config/lighting';
import { QUALITY_CONFIG } from './config/quality';

// Preload all finish textures
Object.values(FINISHES).forEach(f => {
  useTexture.preload(f.bumpMapPath);
});

// Preload grass ground texture
useTexture.preload(GRASS_CONFIG.groundTexturePath);

// Preload all GLB models
Object.values(PRODUCTS).forEach(p => {
  if (p.type === 'glb' && p.modelPath) {
    useGLTF.preload(p.modelPath);
  }
});

function KeyboardListener() {
  const selectedId = useConfiguratorStore((state) => state.selectedId);
  const removeModule = useConfiguratorStore((state) => state.removeModule);
  const undo = useConfiguratorStore((state) => state.undo);
  const redo = useConfiguratorStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if we're typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        removeModule(selectedId);
      }

      // Undo/Redo Shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeModule, undo, redo]);

  return null;
}

function InteractionManager() {
  const { raycaster, camera } = useThree();
  const pendingDrop = useConfiguratorStore((state) => state.pendingDrop);
  const setPendingDrop = useConfiguratorStore((state) => state.setPendingDrop);
  const addModule = useConfiguratorStore((state) => state.addModule);
  const modules = useConfiguratorStore((state) => state.modules);

  const setDraggingId = useConfiguratorStore((state) => state.setDraggingId);

  // Handle New Drops from UI
  useEffect(() => {
    if (pendingDrop) {
      const x = (pendingDrop.x / window.innerWidth) * 2 - 1;
      const y = -(pendingDrop.y / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, target)) {
        let finalPos: [number, number, number] = [target.x, 0, target.z];
        let finalRot: [number, number, number] = [0, 0, 0];

        const snapResult = findSnapPosition(target, modules, pendingDrop.variant);
        if (snapResult) {
          finalPos = snapResult.position;
          finalRot = snapResult.rotation;
        }

        addModule({
          id: Math.random().toString(36).substr(2, 9),
          type: (pendingDrop.variant === 'tree' || pendingDrop.variant === 'human') ? 'environment' : 'bench',
          variant: pendingDrop.variant,
          position: finalPos,
          rotation: finalRot,
          color: 'Grijs',
          finish: useConfiguratorStore.getState().defaultFinish
        });
      }
      setPendingDrop(null);
    }
  }, [pendingDrop, camera, raycaster, addModule, setPendingDrop, modules]);

  // Handle Release globally
  useEffect(() => {
    const handleUp = () => {
      const state = useConfiguratorStore.getState();
      if (state.draggingId) {
        const m = state.modules.find(mod => mod.id === state.draggingId);
        if (m && m.isColliding && state.dragStartPos) {
          // Revert
          state.updateModule(state.draggingId, {
            position: state.dragStartPos.position,
            rotation: state.dragStartPos.rotation,
            isColliding: false
          } as any);
        } else if (m) {
          // Just clear colliding flag if set (though it shouldn't be if not colliding)
          state.updateModule(state.draggingId, { isColliding: false } as any);
        }
      }
      setDraggingId(null);
    };
    window.addEventListener('pointerup', handleUp);
    return () => window.removeEventListener('pointerup', handleUp);
  }, [setDraggingId]);

  return null;
}

import { SkyGradient } from './components/SkyGradient';
import { EnvironmentObject } from './components/EnvironmentObject';
import { Grass } from './components/Grass';
import { DxfRenderer } from './components/DxfRenderer';
// import { BrutonLogo } from './components/BrutonLogo'; // Temporarily disabled

function Scene() {
  const modules = useConfiguratorStore((state) => state.modules);
  const selectModule = useConfiguratorStore((state) => state.selectModule);
  const selectedId = useConfiguratorStore((state) => state.selectedId);
  const showGrass = useConfiguratorStore((state) => state.showGrass);
  const renderingQuality = useConfiguratorStore((state) => state.renderingQuality);

  // Get current quality profile
  const quality = QUALITY_CONFIG[renderingQuality];
  const lightingBase = LIGHTING_CONFIG;

  const draggingId = useConfiguratorStore((state) => state.draggingId);
  const setDraggingId = useConfiguratorStore((state) => state.setDraggingId);
  const updateModule = useConfiguratorStore((state) => state.updateModule);
  const sunIntensity = useConfiguratorStore((state) => state.sunIntensity);
  // const setIsRotating = useConfiguratorStore((state) => state.setIsRotating); // Removed unused
  const modulesRef = useRef(modules);
  modulesRef.current = modules;

  const handleRotate = (id: string, angle: number) => {
    // Rotation Snapping Logic
    // 1. Find if we are snapped to any neighbor
    const currentModule = modulesRef.current.find(m => m.id === id);
    if (!currentModule) return;

    const currentPos = new THREE.Vector3(...currentModule.position);

    // Check if close to any neighbor to be considered "Magnetically Snapped" position-wise
    // Reuse finding logic or just distance check
    let snappedNeighbor = null;
    for (const m of modulesRef.current) {
      if (m.id === id) continue;
      const pos = new THREE.Vector3(...m.position);
      // Distance < 1.6 (1.5 width + small gap + tolerance)
      if (currentPos.distanceTo(pos) < 1.6) {
        snappedNeighbor = m;
        break;
      }
    }

    let finalAngle = angle;

    if (snappedNeighbor) {
      // We are magnetically connected. check tolerance.
      const neighborRot = snappedNeighbor.rotation[1]; // Y rotation

      // Normalize angles to 0-2PI or -PI/PI for comparison if needed
      // Simple diff:
      const diff = Math.abs(angle - neighborRot);
      const diffDeg = THREE.MathUtils.radToDeg(diff);

      // Tolerance 2 degrees
      // Also check modulo 360/90? 
      // User said: "enkel draaien tolerantie ... als 2 graden gedraaid ... niet magnetisch meer".
      // Interpretation: If within 2 degrees of alignment, force alignment.
      // If outside, allow free rotation (or "break").

      if (diffDeg < 5) { // 2 degrees is very small, using 5 for usability
        finalAngle = neighborRot;
      }
    }

    updateModule(id, { rotation: [0, finalAngle, 0] });
  };

  // We use this plane to track movement when dragging an existing item
  const handlePlanePointerMove = (e: any) => {
    if (draggingId) {
      e.stopPropagation();
      const point = e.point;

      // Bench 'under side' is at 0. User wants +1cm (0.01) from Plane (-0.01).
      // If Plane is -0.01, and Bench is 0, gap is 1cm.
      // If user wants visible gap, maybe 0.01? Let's use 0 for now as it matches geometry.

      const currentModule = modulesRef.current.find(m => m.id === draggingId);
      if (!currentModule) return;

      const target = new THREE.Vector3(point.x, 0, point.z);
      const snapResult = findSnapPosition(target, modulesRef.current, currentModule.variant, draggingId);

      let proposedPos: [number, number, number] = [point.x, 0, point.z];
      let proposedRot: [number, number, number] = [0, 0, 0];

      if (snapResult) {
        proposedPos = snapResult.position;
        proposedRot = snapResult.rotation;
      } else {
        const current = modulesRef.current.find((m: { id: string | null; }) => m.id === draggingId);
        if (current) proposedRot = current.rotation;
      }

      // Physics / Sliding Logic
      // Reuse currentModule defined above
      if (!currentModule) return;

      const check = (pos: [number, number, number], rot: [number, number, number]) => checkCollision(
        new THREE.Vector3(...pos),
        new THREE.Euler(...rot),
        draggingId,
        modulesRef.current,
        currentModule.variant
      );

      let finalPos = proposedPos;
      let finalRot = proposedRot;
      let isColliding = false;

      if (check(proposedPos, proposedRot)) {
        // Collision detected. Try Sliding.
        // 1. Try keeping old Z (Slide X)
        // Note: Use 'currentModule.position' as "Old" safe position.
        // Ideally we use "drag start" but "current" is most recent frame.
        const slideXPos: [number, number, number] = [proposedPos[0], 0, currentModule.position[2]];
        const slideZPos: [number, number, number] = [currentModule.position[0], 0, proposedPos[2]];

        const validSlideX = !check(slideXPos, proposedRot);
        const validSlideZ = !check(slideZPos, proposedRot);

        if (validSlideX) {
          finalPos = slideXPos;
        } else if (validSlideZ) {
          finalPos = slideZPos;
        } else {
          // Blocked. Keep old position.
          finalPos = currentModule.position;
          // If rotation changed and caused this?
          if (check(finalPos, proposedRot)) {
            // Even with old pos, rotation causes collision? Revert rotation.
            finalRot = currentModule.rotation;
          }
        }

        // If we are still colliding (e.g. pinned), flag it
        if (check(finalPos, finalRot)) {
          isColliding = true;
        }
      }

      updateModule(draggingId, { position: finalPos, rotation: finalRot, isColliding } as any);
    }
  };

  return (
    <>
      <ambientLight
        intensity={quality.lighting.ambientIntensity}
        color={lightingBase.ambient.color}
      />

      <hemisphereLight
        intensity={quality.lighting.hemisphereIntensity}
        color={lightingBase.hemisphere.skyColor}
        groundColor={lightingBase.hemisphere.groundColor}
      />

      <directionalLight
        position={lightingBase.directional.position}
        intensity={quality.lighting.directionalIntensity * sunIntensity}
        castShadow={quality.lighting.directionalCastsShadow}
        shadow-mapSize-width={quality.shadows.shadowMapSize}
        shadow-mapSize-height={quality.shadows.shadowMapSize}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={quality.shadows.shadowBias}
      />
      <InteractionManager />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
        onPointerMove={handlePlanePointerMove}
        onClick={(e) => {
          if (!draggingId) {
            e.stopPropagation();
            selectModule(null);
          }
        }}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#888888" />
      </mesh>

      {/* Visual Grass Patch */}
      {showGrass && <Grass />}

      {/* Logo Branding - Hero View focal point */}
      {/* Temporarily disabled - code preserved for future use
      <BrutonLogo
        position={[0, 0.5, 0]}
        rotation={[0.2, -Math.PI / 6, 0.1]}
        scale={3.5}
      />
      */}

      {/* DXF/DWG Renderer - Imported CAD drawings */}
      <DxfRenderer />

      {modules.map((module) => {
        if (module.variant === 'tree' || module.variant === 'human') {
          return (
            <EnvironmentObject
              key={module.id}
              {...module}
              selected={selectedId === module.id}
              onSelect={() => selectModule(module.id)}
              onPointerDown={(e: any) => { // Fixed type
                e.stopPropagation();
                selectModule(module.id);
                setDraggingId(module.id);
              }}
              pointerEvents={draggingId === module.id ? 'none' : 'auto'}
            />
          );
        }

        return (
          <ConcreteBench
            key={module.id}
            {...module}
            selected={selectedId === module.id}
            onSelect={() => selectModule(module.id)}
            onRotate={(angle) => handleRotate(module.id, angle)}
            onPointerDown={(e) => {
              e.stopPropagation();
              selectModule(module.id);
              setDraggingId(module.id);
            }}
            pointerEvents={draggingId === module.id ? 'none' : 'auto'}
          />
        );
      })}

      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enabled={!draggingId && !useConfiguratorStore.getState().isRotating}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: null as any
        }}
        minPolarAngle={CAMERA_CONFIG.minPolarAngle}
        maxPolarAngle={CAMERA_CONFIG.maxPolarAngle}
        maxDistance={CAMERA_CONFIG.maxDistance}
        minDistance={CAMERA_CONFIG.minDistance}
        onChange={(e) => {
          if (e?.target && 'target' in e.target) {
            const controls = e.target;
            if (controls.target.y < CAMERA_CONFIG.minPanY) {
              controls.target.y = CAMERA_CONFIG.minPanY;
            }
          }
        }}
      />

      <GizmoHelper alignment="top-right" margin={[selectedId ? 380 : 80, 80]}>
        <GizmoViewcube />
        {/* Blocker mesh to disable bottom faces interaction / Blocker mesh om onderste knoppen uit te zetten */}
        <mesh
          position={[0, -50, 0]}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <boxGeometry args={[100, 100, 100]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </GizmoHelper>

      <SkyGradient />
      <fog attach="fog" args={['#dbe9f4', 10, 90]} />
      <Environment
        preset={quality.environment.preset}
        environmentIntensity={quality.environment.intensity}
        blur={quality.environment.blur}
      />

      {/* Contact Shadows - Only shown if enabled in quality profile */}
      {quality.shadows.contactShadowsEnabled && (
        <ContactShadows
          position={[0, -0.005, 0]}
          opacity={quality.shadows.contactShadows.opacity}
          scale={quality.shadows.contactShadows.scale}
          blur={quality.shadows.contactShadows.blur}
          resolution={quality.shadows.contactShadows.resolution}
          far={quality.shadows.contactShadows.far}
        />
      )}
    </>
  )
}

function App() {
  const setPendingDrop = useConfiguratorStore((state) => state.setPendingDrop);
  const renderingQuality = useConfiguratorStore((state) => state.renderingQuality);
  const quality = QUALITY_CONFIG[renderingQuality];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const variant = e.dataTransfer.getData('variant');
    if (variant) {
      setPendingDrop({
        x: e.clientX,
        y: e.clientY,
        variant: variant as any
      });
    }
  };

  return (
    <div
      className="w-full h-full relative outline-none"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <KeyboardListener />
      <Canvas
        shadows={quality.shadows.enabled}
        gl={{ antialias: quality.renderer.antialias }}
        dpr={[quality.renderer.dprMin, quality.renderer.dprMax]}
        camera={{
          position: CAMERA_CONFIG.defaultPosition,
          fov: CAMERA_CONFIG.fov,
          near: 0.02,
          far: 1000
        }}
      >
        <Scene />
      </Canvas>

      <Interface />
      <OrderSummary />
    </div>
  )
}

export default App
