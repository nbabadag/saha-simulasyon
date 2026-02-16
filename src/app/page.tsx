"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Line, Grid } from "@react-three/drei";
import { useState } from "react";
import { useControls, button } from "leva";

// --- TEKİL CİHAZ BİLEŞENİ ---
function Sensor({ position, color }: any) {
  return (
    <group position={position}>
      <Box args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial color="#444" />
      </Box>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color={color} emissive={color} />
      </mesh>
      <Text position={[0, 0.6, 0]} fontSize={0.2} color="black">SENSÖR</Text>
    </group>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);

  // --- KÜTÜPHANE MENÜSÜ (LEVA) ---
  useControls("CİHAZ KÜTÜPHANESİ", {
    "YENİ SENSÖR EKLE": button(() => {
      const newSensor = {
        id: Date.now(),
        type: 'sensor',
        position: [Math.random() * 4 - 2, 0.3, Math.random() * 4],
        color: 'red'
      };
      setDevices([...devices, newSensor]);
    }),
    "TEMİZLE": button(() => setDevices([])),
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 1, padding: 20 }}>
        <h1>Saha Editörü v3.0</h1>
        <p>Kütüphaneden cihaz seçip sahaya ekleyin.</p>
        <p>Cihaz Sayısı: {devices.length}</p>
      </div>

      <Canvas camera={{ position: [10, 10, 10] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        
        {/* AÇIK RENK ZEMİN SİSTEMİ */}
        <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} cellColor="#888" sectionColor="#444" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#d1d1d1" />
        </mesh>

        {/* DİNAMİK OLARAK EKLENEN CİHAZLAR */}
        {devices.map((device) => (
          <Sensor key={device.id} position={device.position} color={device.color} />
        ))}

        {/* SABİT PANO */}
        <Box args={[4, 5, 0.5]} position={[0, 2.5, -5]}>
          <meshStandardMaterial color="#555" />
        </Box>
      </Canvas>
    </main>
  );
}
