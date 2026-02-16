"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text } from "@react-three/drei";
import { useState, useEffect } from "react";
import { useControls, button, folder } from "leva";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// --- SİMÜLASYON MOTORU (useFrame BURADA OLMALI) ---
function SimulationEngine({ devices, isRunning, boxPos, setBoxPos }: any) {
  useFrame(() => {
    if (!isRunning) return;

    let currentSpeed = 0.04;

    devices.forEach((sensor: any) => {
      const distance = Math.sqrt(
        Math.pow(sensor.pos[0] - boxPos[0], 2) + 
        Math.pow(sensor.pos[2] - boxPos[2], 2)
      );

      if (distance < 0.5 && sensor.action === 'STOP') {
        currentSpeed = 0;
      }
    });

    setBoxPos((prev: any) => [prev[0] + currentSpeed, prev[1], prev[2]]);
    if (boxPos[0] > 6) setBoxPos([-4, 0.4, 0]);
  });

  return (
    <>
      {/* Yürüyen Bant */}
      <Box args={[12, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#222" />
      </Box>

      {/* Kutu */}
      <Box position={boxPos} args={[0.6, 0.6, 0.6]}>
        <meshStandardMaterial color="orange" />
      </Box>
    </>
  );
}

// --- ANA SAYFA ---
export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [boxPos, setBoxPos] = useState<[number, number, number]>([-4, 0.4, 0]);
  const [isRunning, setIsRunning] = useState(false);

  // Veri Çekme
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('projects').select('layout_data').eq('project_name', 'Saha-01').single();
      if (data?.layout_data?.devices) setDevices(data.layout_data.devices);
    };
    load();
  }, []);

  const selectedDevice = devices.find(d => d.id === selectedId);

  // Kontrol Paneli
  useControls("FACTORY OS v6.2", {
    "SİSTEM": folder({
      "BAŞLAT / DURDUR": button(() => setIsRunning(!isRunning)),
      "RESET": button(() => setBoxPos([-4, 0.4, 0])),
    }),
    "CİHAZ EKLE": folder({
      "SENSÖR": button(() => {
        setDevices(prev => [...prev, { id: Date.now(), pos: [2, 0.3, 0], name: `S-${prev.length + 1}`, action: 'NONE' }]);
      }),
    }),
    "BULUT": folder({
      "KAYDET": button(async () => {
        await supabase.from('projects').upsert({ project_name: 'Saha-01', layout_data: { devices } }, { onConflict: 'project_name' });
        alert("Bulut senkronizasyonu tamam!");
      }),
    }),
    ...(selectedId ? {
      [`AYARLAR: ${selectedDevice?.name}`]: folder({
        "X": { value: selectedDevice.pos[0], min: -5, max: 5, onChange: (v) => update(0, v) },
        "Z": { value: selectedDevice.pos[2], min: -2, max: 2, onChange: (v) => update(2, v) },
        "İŞLEV": { 
          options: { "İzle": 'NONE', "Durdur": 'STOP' }, 
          value: selectedDevice.action,
          onChange: (v) => setDevices(prev => prev.map(d => d.id === selectedId ? {...d, action: v} : d))
        },
        "SİL": button(() => { setDevices(prev => prev.filter(d => d.id !== selectedId)); setSelectedId(null); })
      })
    } : {})
  }, [selectedId, devices, isRunning]);

  const update = (idx: number, val: number) => {
    setDevices(prev => prev.map(d => {
      if (d.id === selectedId) {
        const newPos = [...d.pos];
        newPos[idx] = val;
        return { ...d, pos: newPos };
      }
      return d;
    }));
  };

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <Canvas camera={{ position: [8, 5, 8] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls makeDefault enabled={!selectedId} />
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#999" sectionColor="#444" />

        <SimulationEngine devices={devices} isRunning={isRunning} boxPos={boxPos} setBoxPos={setBoxPos} />

        {devices.map((d) => (
          <group key={d.id} position={d.pos} onClick={(e) => { e.stopPropagation(); setSelectedId(d.id); }}>
            <Box args={[0.4, 0.4, 0.4]}>
              <meshStandardMaterial color={selectedId === d.id ? "yellow" : "#444"} />
            </Box>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="black">{d.name}</Text>
          </group>
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onClick={() => setSelectedId(null)}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}
