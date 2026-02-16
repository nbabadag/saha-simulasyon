"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text, Stars } from "@react-three/drei";
import { useState, useEffect } from "react";
import { useControls, button, folder } from "leva";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [boxPos, setBoxPos] = useState<[number, number, number]>([-4, 0.4, 0]);
  const [isRunning, setIsRunning] = useState(false);
  const [motorSpeed, setMotorSpeed] = useState(0.04);

  // --- ANA PLC DÖNGÜSÜ ---
  useFrame(() => {
    if (!isRunning) return;

    let currentSpeed = 0.04; // Normal çalışma hızı
    let sensorTriggered = false;

    // Her bir sensörü kontrol et
    devices.forEach(sensor => {
      // Sensör ile Kutu arasındaki mesafe hesabı
      const distance = Math.sqrt(
        Math.pow(sensor.pos[0] - boxPos[0], 2) + 
        Math.pow(sensor.pos[2] - boxPos[2], 2)
      );

      // Algılama mesafesi (0.5 birim)
      if (distance < 0.5) {
        sensorTriggered = true;
        // EĞER SENSÖRÜN İŞLEVİ "DURDUR" İSE
        if (sensor.action === 'STOP') {
          currentSpeed = 0; 
        }
      }
    });

    setMotorSpeed(currentSpeed);
    setBoxPos(prev => [prev[0] + currentSpeed, prev[1], prev[2]]);

    // Kutu bant sonuna gelirse başa dön (Lup)
    if (boxPos[0] > 6) setBoxPos([-4, 0.4, 0]);
  });

  // --- KONTROL PANELİ ---
  const selectedDevice = devices.find(d => d.id === selectedId);

  useControls("FACTORY OS v6.1", {
    "SİSTEM": folder({
      "BAŞLAT / DURDUR": button(() => setIsRunning(!isRunning)),
      "KUTUYU RESETLE": button(() => setBoxPos([-4, 0.4, 0])),
    }),
    "CİHAZ EKLE": folder({
      "SENSÖR EKLE": button(() => {
        setDevices(prev => [...prev, {
          id: Date.now(),
          pos: [2, 0.3, 0], // Varsayılan konum
          name: `SENSÖR-${prev.length + 1}`,
          action: 'NONE' // Varsayılan işlevsiz
        }]);
      }),
    }),
    "BULUT": folder({
      "SAHAYI KAYDET": button(async () => {
        await supabase.from('projects').upsert({ project_name: 'Saha-01', layout_data: { devices } }, { onConflict: 'project_name' });
        alert("Kaydedildi!");
      }),
    }),
    ...(selectedId ? {
      [`AYARLAR: ${selectedDevice?.name}`]: folder({
        "Konum X": { value: selectedDevice.pos[0], min: -5, max: 5, onChange: (v) => updateDevice('pos', 0, v) },
        "Konum Z": { value: selectedDevice.pos[2], min: -2, max: 2, onChange: (v) => updateDevice('pos', 2, v) },
        "SENSÖR İŞLEVİ": { 
          options: { "Sadece Oku": 'NONE', "Motoru Durdur": 'STOP' }, 
          value: selectedDevice.action,
          onChange: (v) => updateDevice('action', null, v)
        },
        "CİHAZI SİL": button(() => {
          setDevices(prev => prev.filter(d => d.id !== selectedId));
          setSelectedId(null);
        })
      })
    } : {})
  }, [selectedId, devices, isRunning]);

  const updateDevice = (key: string, idx: any, val: any) => {
    setDevices(prev => prev.map(d => {
      if (d.id === selectedId) {
        if (idx !== null) {
          const newPos = [...d.pos];
          newPos[idx] = val;
          return { ...d, pos: newPos };
        }
        return { ...d, [key]: val };
      }
      return d;
    }));
  };

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 10, padding: 20, color: '#222', pointerEvents: 'none' }}>
        <h2>Saha Tasarım v6.1</h2>
        <p>Sensör İşlevi: <b>{selectedDevice?.action === 'STOP' ? 'Durdurucu' : 'İzleyici'}</b></p>
      </div>

      <Canvas camera={{ position: [8, 5, 8] }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls makeDefault enabled={!selectedId} />
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#999" sectionColor="#444" />

        {/* Yürüyen Bant */}
        <Box args={[12, 0.1, 2]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#222" />
        </Box>

        {/* Kutu */}
        <Box position={boxPos} args={[0.6, 0.6, 0.6]}>
          <meshStandardMaterial color="orange" />
        </Box>

        {/* Sensörler */}
        {devices.map((device) => (
          <group key={device.id} position={device.pos} onClick={(e) => { e.stopPropagation(); setSelectedId(device.id); }}>
            <Box args={[0.4, 0.4, 0.4]}>
              <meshStandardMaterial color={selectedId === device.id ? "yellow" : "#444"} />
            </Box>
            {/* Sensörün "Gözü" */}
            <mesh position={[0, 0, 0.25]}>
                <sphereGeometry args={[0.08]} />
                <meshBasicMaterial color={device.action === 'STOP' ? "cyan" : "red"} />
            </mesh>
            <Text position={[0, 0.6, 0]} fontSize={0.2} color="black" fontWeight="bold">{device.name}</Text>
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
