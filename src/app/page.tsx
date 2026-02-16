"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Cylinder } from "@react-three/drei";
import { useRef, useState } from "react";
import { useControls } from "leva";
import * as THREE from "three";

function SimulationScene() {
  const boxRef = useRef<THREE.Mesh>(null);
  const lifterRef = useRef<THREE.Group>(null);
  
  const { bantHizi, makasHizi } = useControls({
    bantHizi: { value: 0.04, min: 0, max: 0.2, step: 0.01 },
    makasHizi: { value: 0.02, min: 0.01, max: 0.1, step: 0.01 },
  });

  const [phase, setPhase] = useState<'MOVING' | 'LIFTING' | 'DONE'>('MOVING');
  const [liftHeight, setLiftHeight] = useState(0.3);

  useFrame(() => {
    // 1. FAZ: Kutu Bantta İlerliyor
    if (phase === 'MOVING' && boxRef.current) {
      boxRef.current.position.x += bantHizi;
      if (boxRef.current.position.x >= 2) {
        setPhase('LIFTING'); // Sensör algıladı, kaldırma fazına geç
      }
    }

    // 2. FAZ: İstif Makası Aşağı/Yukarı
    if (phase === 'LIFTING') {
      if (liftHeight < 2.5) {
        const newHeight = liftHeight + makasHizi;
        setLiftHeight(newHeight);
        if (boxRef.current) boxRef.current.position.y = newHeight;
        if (lifterRef.current) lifterRef.current.position.y = newHeight;
      } else {
        setPhase('DONE');
      }
    }
  });

  return (
    <>
      <gridHelper args={[20, 20, 0x555555, 0x333333]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      {/* Yürüyen Bant */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>

      {/* İstif Makası / Asansör Mekanizması */}
      <group ref={lifterRef} position={[2, liftHeight, 0]}>
        {/* Taşıyıcı Platform */}
        <Box args={[1.2, 0.1, 1.2]} position={[0, -0.35, 0]}>
          <meshStandardMaterial color="silver" metalness={0.8} roughness={0.2} />
        </Box>
        {/* Yan Direkler */}
        <Box args={[0.1, 5, 0.1]} position={[-0.5, 2, -0.5]}><meshStandardMaterial color="#444" /></Box>
        <Box args={[0.1, 5, 0.1]} position={[0.5, 2, -0.5]}><meshStandardMaterial color="#444" /></Box>
      </group>

      {/* Hareket Eden Kutu */}
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>

      {/* PLC Durum Paneli (Sol Üst) */}
      <group position={[-5, 4, -2]}>
        <Text position={[0, 0.5, 0]} fontSize={0.3} color="white">SİSTEM DURUMU</Text>
        <Text position={[0, 0, 0]} fontSize={0.2} color={phase === 'MOVING' ? "lime" : "white"}>
          {phase === 'MOVING' ? "BANT AKTIF" : "BANT STOP"}
        </Text>
        <Text position={[0, -0.3, 0]} fontSize={0.2} color={phase === 'LIFTING' ? "orange" : "white"}>
          {phase === 'LIFTING' ? "MAKAS CALISIYOR" : "MAKAS BEKLEMEDE"}
        </Text>
      </group>

      {/* Reset Küresi */}
      <mesh position={[-6, 1, 3]} onClick={() => {
        setPhase('MOVING');
        setLiftHeight(0.3);
        if(boxRef.current) {
            boxRef.current.position.x = -4.5;
            boxRef.current.position.y = 0.3;
        }
      }}>
        <sphereGeometry args={[0.4]} />
        <meshStandardMaterial color="blue" />
      </mesh>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      <Canvas camera={{ position: [10, 10, 10] }}>
        <OrbitControls />
        <Stars />
        <SimulationScene />
      </Canvas>
    </main>
  );
}
