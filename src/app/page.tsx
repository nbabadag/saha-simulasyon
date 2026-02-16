"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Line } from "@react-three/drei";
import { useRef, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three";

function WiringSimulation({ settings }: any) {
  const boxRef = useRef<THREE.Mesh>(null);
  const [wireConnected, setWireConnected] = useState(false);
  const [phase, setPhase] = useState('MOVING');

  // PLC ve Sensör terminal noktaları (Koordinatlar)
  const sensorTerminal: [number, number, number] = [2, 0.5, 1];
  const plcInputTerminal: [number, number, number] = [-0.8, 2.5, -3.3];

  useFrame(() => {
    if (!boxRef.current) return;

    // SENSÖR OKUMA
    const mesafe = Math.abs(boxRef.current.position.x - 2);
    const isDetected = mesafe < 0.3;

    // SADECE KABLO BAĞLIYSA DURDUR (Logic)
    if (isDetected && wireConnected) {
      setPhase('STOPPED');
    }

    if (phase === 'MOVING') {
      boxRef.current.position.x += 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* --- KABLO (Sadece bağlıysa görünür) --- */}
      {wireConnected && (
        <Line 
          points={[sensorTerminal, [2, 2.5, 1], [-0.8, 2.5, 1], plcInputTerminal]} 
          color="yellow" 
          lineWidth={2} 
        />
      )}

      {/* --- SENSÖR TERMİNALİ --- */}
      <mesh position={sensorTerminal} onClick={() => setWireConnected(!wireConnected)}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color={wireConnected ? "lime" : "red"} />
      </mesh>
      <Text position={[2, 0.8, 1]} fontSize={0.15}>SENSÖR ÇIKIŞI</Text>

      {/* --- PANO VE PLC --- */}
      <group position={[0, 2, -4]}>
        <Box args={[4, 5, 1]}><meshStandardMaterial color="#222" /></Box>
        <Box args={[1, 1.2, 0.5]} position={[-1, 1, 0.7]}>
            <meshStandardMaterial color="#555" />
            {/* PLC Giriş Terminali */}
            <mesh position={[0.2, 0.5, 0.3]} onClick={() => setWireConnected(!wireConnected)}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color={wireConnected ? "lime" : "red"} />
            </mesh>
        </Box>
        <Text position={[-0.8, 3, 0.6]} fontSize={0.2} color="white">PLC GİRİŞİ (I0.0)</Text>
      </group>

      {/* --- BANT VE KUTU --- */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}><meshStandardMaterial color="#111" /></Box>
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}><meshStandardMaterial color="orange" /></Box>

      {/* RESET BUTONU */}
      <mesh position={[-6, 1, 2]} onClick={() => { setPhase('MOVING'); if(boxRef.current) boxRef.current.position.x = -4.5; }}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#000" }}>
      <Canvas camera={{ position: [10, 10, 10] }}>
        <Stars />
        <WiringSimulation />
        <OrbitControls />
      </Canvas>
    </main>
  );
}
