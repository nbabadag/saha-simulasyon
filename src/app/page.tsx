"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Grid, TransformControls } from "@react-three/drei";
import { useState } from "react";
import { useControls, button } from "leva";

function DraggableSensor({ device, isSelected, onSelect }: any) {
  return (
    <group 
      position={device.position} 
      onClick={(e) => { 
        e.stopPropagation(); 
        onSelect(device.id); 
      }}
    >
      <Box args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial color={isSelected ? "#ffea00" : "#333"} />
      </Box>
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.1]} />
        <meshStandardMaterial color={device.color} emissive={device.color} />
      </mesh>
      <Text position={[0, 0.6, 0]} fontSize={0.15} color="black">
        {device.label}
      </Text>
    </group>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Seçili cihazın verisini bul
  const selectedDevice = devices.find(d => d.id === selectedId);

  useControls("SAHA EDİTÖRÜ", {
    "SENSÖR EKLE": button(() => {
      setDevices((prev) => [
        ...prev,
        {
          id: Date.now(),
          position: [Math.random() * 2, 0.2, Math.random() * 2],
          color: "red",
          label: `S-${prev.length + 1}`
        }
      ]);
    }),
    "TÜMÜNÜ SİL": button(() => { setDevices([]); setSelectedId(null); }),
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 1, padding: 20, pointerEvents: 'none', color: '#222' }}>
        <h1>Saha Tasarım v3.3</h1>
        <p>1. Sensör Ekle'ye bas.</p>
        <p>2. Sensöre tıkla (Oklar çıkacak).</p>
        <p>3. Okları tutup sürükle.</p>
      </div>

      <Canvas camera={{ position: [10, 10, 10] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        <OrbitControls makeDefault enabled={!selectedId} />
        
        <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={30} cellColor="#999" sectionColor="#444" />

        {/* CİHAZLAR */}
        {devices.map((device) => (
          <DraggableSensor 
            key={device.id} 
            device={device} 
            isSelected={selectedId === device.id}
            onSelect={setSelectedId}
          />
        ))}

        {/* SEÇİLİ NESNE İÇİN OKLAR (GIZMO) */}
        {selectedId && (
          <TransformControls 
            object={undefined} // Manuel kontrol için
            mode="translate" 
            onObjectChange={(e: any) => {
              // Pozisyon değiştiğinde veriyi güncelle
              const newPos = e.target.object.position;
              setDevices(prev => prev.map(d => 
                d.id === selectedId ? { ...d, position: [newPos.x, newPos.y, newPos.z] } : d
              ));
            }}
          >
            {/* Bu kısım TransformControls'un neyi taşıyacağını belirler */}
            <mesh position={selectedDevice?.position || [0,0,0]} visible={false}>
               <boxGeometry args={[0.5, 0.5, 0.5]} />
            </mesh>
          </TransformControls>
        )}

        <Stars radius={100} depth={50} count={500} factor={4} saturation={0} fade speed={1} />
        
        {/* Boşluğa tıklayınca seçimi kaldırmak için görünmez zemin */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} onClick={() => setSelectedId(null)}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}
