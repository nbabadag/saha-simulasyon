"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text } from "@react-three/drei";
import { useState, useEffect } from "react";
import { useControls, button, folder } from "leva";
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 1. ADIM: SAYFA AÇILDIĞINDA VERİLERİ SUPABASE'DEN ÇEK
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('layout_data')
        .eq('project_name', 'Saha-01')
        .single();
      
      if (data && data.layout_data) {
        setDevices(data.layout_data.devices || []);
      }
    };
    fetchData();
  }, []);

  const selectedDevice = devices.find(d => d.id === selectedId);

  // 2. ADIM: LEVA PANELİNE KAYDET BUTONU EKLE
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
    "BULUT İŞLEMLERİ": folder({
      "PROJEYİ KAYDET": button(async () => {
        const { error } = await supabase
          .from('projects')
          .upsert([{ 
            project_name: 'Saha-01', 
            layout_data: { devices } 
          }], { onConflict: 'project_name' });
        
        if (error) alert("Hata: " + error.message);
        else alert("Tüm saha yerleşimi Supabase'e kaydedildi!");
      }),
    }),
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
      <div style={{ position: "absolute", zIndex: 10, padding: 20, color: '#222', pointerEvents: 'none' }}>
        <h2 style={{ margin: 0 }}>Saha Tasarım v4.7 (Cloud)</h2>
        <p>Cihazları yerleştir ve 'PROJEYİ KAYDET'e bas.</p>
      </div>

      <Canvas camera={{ position: [8, 8, 8] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls makeDefault />
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#999" sectionColor="#444" fadeDistance={30} />

        {devices.map((device) => (
          <group 
            key={device.id} 
            position={device.pos} 
            onClick={(e) => { e.stopPropagation(); setSelectedId(device.id); }}
          >
            <Box args={[0.5, 0.5, 0.5]}>
              <meshStandardMaterial 
                color={selectedId === device.id ? "#ffea00" : "#333"} 
                emissive={selectedId === device.id ? "#ffea00" : "black"}
                emissiveIntensity={0.5}
              />
            </Box>
            <Text position={[0, 0.7, 0]} fontSize={0.2} color="black" fontWeight="bold">
              {device.name}
            </Text>
          </group>
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} onClick={() => setSelectedId(null)}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}
