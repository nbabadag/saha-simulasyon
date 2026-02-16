"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Plane, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// --- YÜRÜYEN BANT VE NESNE BİLEŞENİ ---
function FactoryScene() {
  const boxRef = useRef<THREE.Mesh>(null);
  const [running, setRunning] = useState(true);
  const [sensorActive, setSensorActive] = useState(false);

  // PLC SCAN CYCLE (Simülasyon Döngüsü)
  useFrame(() => {
    if (boxRef.current && running) {
      // Kutuyu X ekseninde ilerlet
      boxRef.current.position.x += 0.03;

      // SENSÖR MANTIĞI: Kutu x=2 pozisyonuna gelince algıla
      if (boxRef.current.position.x >= 2 && boxRef.current.position.x <= 2.2) {
        setSensorActive(true);
        setRunning(false); // PLC STOP KOMUTU
      } else {
        setSensorActive(false);
      }
    }
  });

  return (
    <>
      {/* Zemin (Fabrika Tabanı) */}
      <gridHelper args={[20, 20, 0x888888, 0x444444]} />
      
      {/* Yürüyen Bant */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#333" />
      </Box>

      {/* Sensör (Kırmızı Lamba) */}
      <Box args={[0.2, 0.5, 0.2]} position={[2, 0.3, 1.2]}>
        <meshStandardMaterial color={sensorActive ? "red" : "green"} emissive={sensorActive ? "red" : "black"} />
      </Box>
      <Text position={[2, 0.8, 1.2]} fontSize={0.2} color="white">
        {sensorActive ? "NESNE ALGILANDI" : "SENSOR OK"}
      </Text>

      {/* Hareket Eden Kutu */}
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>

      {/* Reset Butonu (Dünyaya dokunarak resetleme) */}
      <Box args={[0.5, 0.5, 0.5]} position={[-5, 1, 3]} onClick={() => {
        if(boxRef.current) boxRef.current.position.x = -4.5;
        setRunning(true);
      }}>
        <meshStandardMaterial color="blue" />
      </Box>
      <Text position={[-5, 1.5, 3]} fontSize={0.2} color="white">RESET (Maviye Tıkla)</Text>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      <div style={{ position: "absolute", zIndex: 1, color: "white", padding: 20, pointerEvents: 'none' }}>
        <h1>Saha Simülasyonu v1.1</h1>
        <p>Durum: <span style={{color: 'lime'}}>SİSTEM AKTİF</span></p>
        <p>Mavi kutuya tıklayarak sistemi resetleyebilirsiniz.</p>
      </div>
      <Canvas camera={{ position: [7, 7, 7] }}>
        <OrbitControls />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <FactoryScene />
      </Canvas>
    </main>
  );
}
