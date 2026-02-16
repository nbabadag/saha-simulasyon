"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Line } from "@react-three/drei";
import { useRef, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three";

function WiringSimulation() {
  const boxRef = useRef<THREE.Mesh>(null);
  const [wireConnected, setWireConnected] = useState(false);
  const [phase, setPhase] = useState<'MOVING' | 'STOPPED'>('MOVING');

  // Terminal noktaları
  const sensorTerminal: [number, number, number] = [2, 0.5, 1];
  const plcInputTerminal: [number, number, number] = [-0.8, 2.5, -3.3];

  useFrame(() => {
    if (!boxRef.current) return;

    const mesafe = Math.abs(boxRef.current.position.x - 2);
    const isDetected = mesafe < 0.3;

    if (isDetected && wireConnected) {
      setPhase('STOPPED');
    }

    if (phase === 'MOVING') {
      boxRef.current.position.x += 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      
      {/* --- YENİLENMİŞ AÇIK RENK ZEMİN --- */}
      <gridHelper args={[30, 30, 0x000000, 0x888888]} position={[0, -0.06, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#cccccc" /> 
      </mesh>

      {/* --- KABLO --- */}
      {wireConnected && (
        <Line 
          points={[sensorTerminal, [2, 2.5, 1], [-0.8, 2.5, 1], plcInputTerminal]} 
          color="blue" // Açık zeminde sarı yerine mavi daha iyi görünür
          lineWidth={3} 
        />
      )}

      {/* --- SENSÖR --- */}
      <group position={[2, 0.3, 1]}>
         <Box args={[0.4, 0.4, 0.4]}><meshStandardMaterial color="#444" /></Box>
         <mesh position={[0, 0.2, 0]} onClick={() => setWireConnected(!wireConnected)}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color={wireConnected ? "#00ff00" : "#ff0000"} />
         </mesh>
      </group>

      {/* --- PANO VE PLC --- */}
      <group position={[0, 2, -4]}>
        <Box args={[4, 5, 1]}><meshStandardMaterial color="#555" /></Box>
        <Box args={[1.2, 1.2, 0.5]} position={[-1, 1, 0.7]}>
            <meshStandardMaterial color="#888" />
            <mesh position={[0.2, 0.5, 0.3]} onClick={() => setWireConnected(!wireConnected)}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color={wireConnected ? "#00ff00" : "#ff0000"} />
            </mesh>
        </Box>
      </group>

      {/* --- BANT VE KUTU --- */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}><meshStandardMaterial color="#222" /></Box>
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}><meshStandardMaterial color="orange" /></Box>

      {/* RESET BUTONU */}
      <mesh position={[-6, 1, 2]} onClick={() => { setPhase('MOVING'); if(boxRef.current) boxRef.current.position.x = -4.5; }}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#0000ff" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <Canvas camera={{ position: [12, 10, 12] }}>
        <WiringSimulation />
        <OrbitControls />
      </Canvas>
    </main>
  );
}
