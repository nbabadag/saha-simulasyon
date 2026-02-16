"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import { useControls } from "leva"; // Yeni eklediğimiz kontrol paneli
import * as THREE from "three";

function FactoryScene() {
  const boxRef = useRef<THREE.Mesh>(null);
  
  // --- KONTROL PANELİ AYARLARI ---
  const { bantHizi, sensorKonumu, sensorHassasiyeti } = useControls({
    bantHizi: { value: 0.03, min: 0, max: 0.2, step: 0.01 },
    sensorKonumu: { value: 2, min: -4, max: 4, step: 0.1 },
    sensorHassasiyeti: { value: 0.2, min: 0.05, max: 1, step: 0.05 },
  });

  const [running, setRunning] = useState(true);
  const [sensorActive, setSensorActive] = useState(false);

  useFrame(() => {
    if (boxRef.current && running) {
      boxRef.current.position.x += bantHizi;

      // DİNAMİK SENSÖR MANTIĞI
      const mesafe = Math.abs(boxRef.current.position.x - sensorKonumu);
      if (mesafe < sensorHassasiyeti) {
        setSensorActive(true);
        setRunning(false); 
      } else {
        setSensorActive(false);
      }
    }
  });

  return (
    <>
      <gridHelper args={[20, 20, 0x888888, 0x444444]} />
      
      {/* Bant */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#222" />
      </Box>

      {/* Dinamik Sensör */}
      <Box args={[0.2, 0.6, 0.2]} position={[sensorKonumu, 0.3, 1.2]}>
        <meshStandardMaterial color={sensorActive ? "red" : "cyan"} emissive={sensorActive ? "red" : "black"} />
      </Box>

      {/* Kutu */}
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>

      {/* Reset Küresi */}
      <mesh position={[-5, 1, 3]} onClick={() => {
        if(boxRef.current) boxRef.current.position.x = -4.5;
        setRunning(true);
      }}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [8, 5, 8] }}>
        <OrbitControls />
        <Stars />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} />
        <FactoryScene />
      </Canvas>
    </main>
  );
}
