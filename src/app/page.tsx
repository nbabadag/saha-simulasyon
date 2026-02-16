"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text } from "@react-three/drei";
import { useState } from "react";
import { useControls, button, folder } from "leva";

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // SEÇİLİ CİHAZIN AYARLARINI PANELDE GÖSTER
  const selectedDevice = devices.find(d => d.id === selectedId);

  useControls("SAHA EDİTÖRÜ", {
    "CİHAZ EKLE": folder({
      "SENSÖR": button(() => {
        setDevices(prev => [...prev, {
          id: Date.now(),
          pos: [0, 0.25, 0],
          color: "red",
          name: `S-${prev.length + 1}`
        }]);
      }),
    }),
    // Eğer bir cihaz seçiliyse panelde koordinatlarını göster
    ...(selectedId ? {
      [`SEÇİLİ: ${selectedDevice?.name}`]: folder({
        "Pozisyon X": { 
          value: selectedDevice?.pos[0] || 0, 
          min: -10, max: 10, 
          onChange: (v) => updatePosition(0, v) 
        },
        "Pozisyon Z": { 
          value: selectedDevice?.pos[2] || 0, 
          min: -10, max: 10, 
          onChange: (v) => updatePosition(2, v) 
        },
        "SİL": button(() => {
          setDevices(prev => prev.filter(d => d.id !== selectedId));
          setSelectedId(null);
        })
      })
    } : {})
  }, [selectedId, devices]);

  // Pozisyonu güncelleyen fonksiyon
  const updatePosition = (index: number, value: number) => {
    setDevices(prev => prev.map(d => {
      if (d.id === selectedId) {
        const newPos = [...d.pos];
        newPos[index] = value;
        return { ...d, pos: newPos };
      }
      return d;
    }));
  };

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIdex: 10, padding: 20, color: '#222' }}>
        <h2>Saha Tasarım v4.5</h2>
        <p>Sensöre tıkla, sağdaki panelden yerini değiştir.</p>
      </div>

      <Canvas camera={{ position: [8, 8, 8] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#999" sectionColor="#444" />

        {devices.map((device) => (
          <group 
            key={device.id} 
            position={device.pos} 
            onClick={(e) => { e.stopPropagation(); setSelectedId(device.id); }}
          >
            <Box args={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial 
                color={selectedId === device.id ? "yellow" : "#333"} 
                emissive={selectedId === device.id ? "yellow" : "black"}
                emissiveIntensity={0.5}
              />
            </Box>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="black">{device.name}</Text>
          </group>
        ))}

        {/* Zemine tıklayınca seçimi bırak */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} onClick={() => setSelectedId(null)}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}
