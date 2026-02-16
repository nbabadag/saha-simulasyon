"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Grid, TransformControls } from "@react-three/drei";
import { useState } from "react";
import { useControls, button } from "leva";

function DraggableSensor({ device, isSelected, onSelect }: any) {
  // Seçiliyken TransformControls aktiftir, seçili değilse sadece düz grup.
  return (
    <>
      {isSelected ? (
        <TransformControls 
          mode="translate" 
          onPointerDown={(e) => e?.stopPropagation()}
        >
          <group>
            <Box args={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.5} />
            </Box>
            <mesh position={[0, 0.3, 0]}>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color={device.color} />
            </mesh>
            <Text position={[0, 0.8, 0]} fontSize={0.2} color="black" fontWeight="bold">
              {device.label} (SEÇİLİ)
            </Text>
          </group>
        </TransformControls>
      ) : (
        <group 
          position={device.position} 
          onClick={(e) => {
            e.stopPropagation();
            onSelect(device.id);
          }}
        >
          <Box args={[0.4, 0.4, 0.4]}>
            <meshStandardMaterial color="#333" />
          </Box>
          <mesh position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color={device.color} />
          </mesh>
          <Text position={[0, 0.6, 0]} fontSize={0.15} color="#444">
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
          position: [Math.random() * 4 - 2, 0.25, Math.random() * 4 - 2],
          color: "red",
          label: `S-${prev.length + 1}`
        }
      ]);
    }),
    "SEÇİMİ BIRAK": button(() => setSelectedId(null)),
    "HER ŞEYİ TEMİZLE": button(() => { setDevices([]); setSelectedId(null); }),
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 1, padding: 20, pointerEvents: 'none' }}>
        <h1 style={{ color: '#222', margin: 0 }}>Saha Tasarım v4.0</h1>
        <p style={{ color: '#666' }}>Sensörün üzerine tıkla, oklar belirecektir.</p>
      </div>

      <Canvas camera={{ position: [10, 10, 10] }} onClick={() => setSelectedId(null)}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        
        {/* Seçim varken kamera dönmesini kapatıyoruz */}
        <OrbitControls makeDefault enabled={selectedId === null} />
        
        <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} cellColor="#999" sectionColor="#555" />

        {devices.map((device) => (
          <DraggableSensor 
            key={device.id} 
            device={device} 
            isSelected={selectedId === device.id}
            onSelect={setSelectedId}
          />
        ))}

        {/* Görünmez Yer Paneli (Seçimi bırakmak için) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}
