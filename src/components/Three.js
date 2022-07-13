import * as THREE from "three";
import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Box, OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { frag, vert } from "../materials/liquidMaterial";
import clamp from "lodash/clamp";
import lerp from "lerp";
import { Vector3 } from "three";

function Liquid(props) {
  const ref = useRef();
  const bubbleMaterial = useRef();
  const orientation = props.orientation;
  const { nodes } = useGLTF("/test-bottle.glb");

  const wobbleAmountToAddX = useRef(0);
  const wobbleAmountToAddZ = useRef(0);
  const lastPos = useRef(new THREE.Vector3());
  const lastRot = useRef(new THREE.Vector3());
    
  const recovery = 4;
  const wobbleSpeed = 2;
  const maxWobble = 0.1;

  const { size, viewport } = useThree();

  useFrame(({ clock, mouse }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      const _delta = clock.getDelta();
      const delta = _delta > 0 ? _delta : 0.01;

      ref.current.position.x = mouse.x;

      const euler = new THREE.Euler(
        (orientation.beta * Math.PI) / 180,
        -(orientation.gamma * Math.PI) / 180,
        (orientation.alpha * Math.PI) / 180
      );
      const quaternion = new THREE.Quaternion();

      quaternion.setFromEuler(euler);

      ref.current.rotation.setFromQuaternion(quaternion);
      // ref.current.rotation.z = Math.PI * 0.4;
      // ref.current.rotation.y = (orientation.alpha * Math.PI) / 180;

      // decrease wobble over time
      wobbleAmountToAddX.current = lerp(
        wobbleAmountToAddX.current,
        0,
        delta * recovery
      );
      wobbleAmountToAddZ.current = lerp(
        wobbleAmountToAddZ.current,
        0,
        delta * recovery
      );

      // make a sine wave of the decreasing wobble
      const pulse = 2 * Math.PI * wobbleSpeed;
      const wobbleAmountX = wobbleAmountToAddX.current * Math.sin(pulse * time);
      const wobbleAmountZ = wobbleAmountToAddZ.current * Math.cos(pulse * time);

      // send it to the shader
      bubbleMaterial.current.material.uniforms.wobbleX.value = wobbleAmountX;
      bubbleMaterial.current.material.uniforms.wobbleZ.value = wobbleAmountZ;

      // velocity
      const velocity = lastPos.current.clone();
      velocity.sub(ref.current.position).divideScalar(delta);
      const angularVelocity = new Vector3().setFromEuler(ref.current.rotation);
      angularVelocity.sub(lastRot.current);

      // add clamped velocity to wobble
      wobbleAmountToAddX.current += clamp(
        (velocity.x + angularVelocity.z * 0.2) * maxWobble,
        -maxWobble,
        maxWobble
      );
      wobbleAmountToAddZ.current += clamp(
        (velocity.z + angularVelocity.x * 0.2) * maxWobble,
        -maxWobble,
        maxWobble
      );

      // keep last position
      lastPos.current = ref.current.position.clone();
      lastRot.current = new Vector3().setFromEuler(ref.current.rotation);
      // bubbleMaterial.current.material.uniforms.fillAmount.value =
      //   -ref.current.position.y + 0.2;
    }
  });

  return (
    <group rotation={[Math.PI * 0.5, 0, 0]}>
      <group ref={ref} {...props} dispose={null}>
        {/* <Box args={[1, 1, 1]} renderOrder={0}>
          <meshPhysicalMaterial
            side={THREE.BackSide}
            transmission={1}
            roughness={0}
            thickness={3}
          />
        </Box> */}
        <mesh geometry={nodes.Cube.geometry} renderOrder={1}>
          <meshPhysicalMaterial
            metalness={1}
            roughness={0}
            clearcoat={1}
            opacity={0.3}
            color="green"
            transparent
          />
        </mesh>
        <mesh
          geometry={nodes.Cube.geometry}
          renderOrder={0}
          ref={bubbleMaterial}
          scale={[0.8, 0.8, 0.8]}
        >
          <shaderMaterial
            transparent
            vertexShader={vert}
            fragmentShader={frag}
            side={THREE.DoubleSide}
            uniforms={{
              resolution: {
                value: new THREE.Vector2(size.width, size.height),
              },
              fillAmount: {
                value: 0.4,
              },
              wobbleX: {
                value: 0.01,
              },
              wobbleZ: {
                value: 0.01,
              },
              topColor: {
                value: new THREE.Vector4(128 / 255, 0, 1, 0.7),
              },
              rimColor: {
                value: new THREE.Vector4(1, 1, 1, 1),
              },
              foamColor: {
                value: new THREE.Vector4(128 / 255, 0, 1, 0.7),
              },
              tint: {
                value: new THREE.Vector4(1, 0, 1, 0.7),
              },
              rim: {
                value: 0.02,
              },
              rimPower: {
                value: 1,
              },
            }}
          />
        </mesh>
      </group>
    </group>
  );
}

const Three = ({ socket }) => {
  const [orientation, setOrientation] = useState({
    alpha: null,
    gamma: null,
    beta: null,
  });

  if (socket)
    socket.on("receive_orientation", (data) => {
      setOrientation(data);
      console.log(data);
    });

  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight />
      <color args={["#000"]} attach="background" />
      <pointLight position={[10, 10, 10]} />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, -0, 10]} intensity={2} />
      <Suspense fallback={null}>
        <Liquid orientation={orientation} position={[0, 0, 0]} />
        <Environment background preset="warehouse" />
        {/* <Background /> */}
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
};

export default Three;
