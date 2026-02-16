"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Grid } from "@react-three/drei";
import { useState } from "react";
import { useControls, button } from "leva";

// --- TEKİL SENSÖR BİLEŞENİ ---
function Sensor({ position, color, label }: any) {
  return (
    <group position={position}>
      <Box args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial color="#333" />
      </Box>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      <Text position={[0, 0.6, 0]} fontSize={0.15} color="black" fontWeight="bold">
        {label}
      </Text>
    </group>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);

  // --- KÜTÜPHANE MENÜSÜ ---
  useControls("CİHAZ KÜTÜPHANESİ", {
    "YENİ SENSÖR EKLE": button(() => {
      // Çözüm Burada: prev => [...prev, newElement] kalıbı eski veriyi korur
      setDevices((prevDevices) => [
        ...prevDevices,
        {
          id: Math.random(), // Her biri için eşsiz kimlik
          type: 'sensor',
          position: [Math.random() * 6 - 3, 0.2, Math.random() * 6 - 3],
          color: Math.random() > 0.5 ? "red" : "lime",
          label: `SENSÖR-${prevDevices.length + 1}`
        }
      ]);
    }),
    "TÜMÜNÜ SİL": button(() => setDevices([])),
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 1, padding: 20, pointerEvents: 'none' }}>
        <h1 style={{ color: '#222', margin: 0 }}>Saha Editörü v3.1</h1>
        <p style={{ color: '#666' }}>Eklenen Cihaz Sayısı: <b>{devices.length}</b></p>
      </div>

      <Canvas camera={{ position: [8, 8, 8] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls />
        
        {/* Görsel Arka Plan */}
        <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} cellColor="#999" sectionColor="#555" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* CİHAZ LİSTESİNİ EKRANA DÖKÜYORUZ */}
        {devices.map((device) => (
          <Sensor 
            key={device.id} 
            position={device.position} 
            color={device.color} 
            label={device.label} 
          />
        ))}

        {/* Pano Arka Duvarı */}
        <Box args={[6, 4, 0.2]} position={[0, 2, -6]}>
          <meshStandardMaterial color="#444" />
        </Box>
      </Canvas>
    </main>
  );
}
