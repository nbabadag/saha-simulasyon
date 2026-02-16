"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Grid, TransformControls } from "@react-three/drei";
import { useState } from "react";
import { useControls, button } from "leva";

function DraggableSensor({ device, isSelected, onSelect }: any) {
  return (
    <>
      {isSelected ? (
        // Seçiliyken TransformControls her şeyi kontrol eder
        <TransformControls mode="translate">
          <group onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            <Box args={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial color="#ffea00" />
            </Box>
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color={device.color} emissive={device.color} />
            </mesh>
            <Text position={[0, 0.8, 0]} fontSize={0.2} color="black" fontWeight="bold">
              {device.label}
            </Text>
          </group>
        </TransformControls>
      ) : (
        // Seçili değilken normal durur
        <group position={device.position} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          <Box args={[0.4, 0.4, 0.4]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color={device.color} />
          </mesh>
          <Text position={[0, 0.6, 0]} fontSize={0.15} color="black">
            {device.label}
          </Text>
        </group>
      )}
    </>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useControls("SAHA EDİTÖRÜ", {
    "SENSÖR EKLE": button(() => {
      setDevices((prev) => [
        ...prev,
        {
          id: Date.now(),
          position: [Math.random() * 3, 0.25, Math.random() * 3],
          color: "red",
          label: `S-${prev.length + 1}`
        }
      ]);
    }),
    "SEÇİMİ BIRAK": button(() => setSelectedId(null)),
    "HER ŞEYİ SİL": button(() => { setDevices([]); setSelectedId(null); }),
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 1, padding: 20, pointerEvents: 'none' }}>
        <h1 style={{ color: '#222', margin: 0 }}>Saha Tasarım v3.2</h1>
        <p style={{ color: '#555' }}>Taşımak için sensöre tıkla, bırakmak için boşluğa tıkla.</p>
      </div>

      <Canvas camera={{ position: [10, 10, 10] }} onClick={() => setSelectedId(null)}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Oklarla oynarken kameranın dönmesini engellemek için 'makeDefault' önemli */}
        <OrbitControls makeDefault enabled={selectedId === null} />
        
        <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} cellColor="#999" sectionColor="#444" />

        {devices.map((device) => (
          <DraggableSensor 
            key={device.id} 
            device={device} 
            isSelected={selectedId === device.id}
            onSelect={() => setSelectedId(device.id)}
          />
        ))}

        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </main>
  );
}
