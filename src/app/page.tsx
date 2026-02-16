"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text, Stars, Cylinder } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { useControls, button, folder } from "leva";
import { createClient } from '@supabase/supabase-js';
import * as THREE from "three";

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// --- SENSÖR BİLEŞENİ (PLC MANTIĞI DAHİL) ---
function Sensor({ device, isSelected, onSelect, boxPos }: any) {
  const [isActive, setIsActive] = useState(false);

  // Mesafe Algılama (PLC Giriş Simülasyonu)
  useEffect(() => {
    const dist = Math.sqrt(
      Math.pow(device.pos[0] - boxPos[0], 2) + 
      Math.pow(device.pos[2] - boxPos[2], 2)
    );
    setIsActive(dist < 0.6);
  }, [boxPos, device.pos]);

  return (
    <group position={device.pos} onClick={(e) => { e.stopPropagation(); onSelect(device.id); }}>
      <Box args={[0.5, 0.5, 0.5]}>
        <meshStandardMaterial 
          color={isSelected ? "#ffea00" : "#333"} 
          metalness={0.8}
          roughness={0.2}
        />
      </Box>
      {/* Sensör Lensi (Aktifse Yeşil Yanar) */}
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05]} />
        <meshBasicMaterial color={isActive ? "#00ff00" : "#ff0000"} />
      </mesh>
      <Text position={[0, 0.8, 0]} fontSize={0.2} color="black" fontWeight="bold">
        {device.name} {isActive ? "(ON)" : "(OFF)"}
      </Text>
    </group>
  );
}

// --- ANA SİMÜLASYON MOTORU ---
export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [boxPos, setBoxPos] = useState<[number, number, number]>([-4.5, 0.3, 0]);
  const [isRunning, setIsRunning] = useState(false);

  // 1. ADIM: BULUTTAN VERİ ÇEKME
  useEffect(() => {
    const loadProject = async () => {
      const { data } = await supabase
        .from('projects')
        .select('layout_data')
        .eq('project_name', 'Saha-01')
        .single();
      if (data?.layout_data?.devices) setDevices(data.layout_data.devices);
    };
    loadProject();
  }, []);

  // 2. ADIM: KONTROL PANELİ (LEVA)
  const selectedDevice = devices.find(d => d.id === selectedId);

  useControls("FABRİKA KONTROL PANELİ", {
    "SİMÜLASYON": folder({
      "BAŞLAT / DURDUR": button(() => setIsRunning(!isRunning)),
      "RESET (KUTU)": button(() => setBoxPos([-4.5, 0.3, 0])),
    }),
    "CİHAZ KÜTÜPHANESİ": folder({
      "YENİ SENSÖR EKLE": button(() => {
        setDevices(prev => [...prev, {
          id: Date.now(),
          pos: [Math.random() * 2, 0.25, Math.random() * 2],
          name: `S-${prev.length + 1}`
        }]);
      }),
    }),
    "BULUT SERVİSİ": folder({
      "TÜM SAHAYI KAYDET": button(async () => {
        const { error } = await supabase
          .from('projects')
          .upsert({ project_name: 'Saha-01', layout_data: { devices } }, { onConflict: 'project_name' });
        if (error) alert("Hata: " + error.message);
        else alert("Saha yerleşimi buluta başarıyla işlendi!");
      }),
    }),
    ...(selectedId ? {
      [`DÜZENLE: ${selectedDevice?.name}`]: folder({
        "Konum X": { value: selectedDevice?.pos[0], min: -10, max: 10, onChange: (v) => updatePos(0, v) },
        "Konum Z": { value: selectedDevice?.pos[2], min: -10, max: 10, onChange: (v) => updatePos(2, v) },
        "CİHAZI SİL": button(() => {
          setDevices(prev => prev.filter(d => d.id !== selectedId));
          setSelectedId(null);
        })
      })
    } : {})
  }, [selectedId, devices, isRunning]);

  const updatePos = (axis: number, val: number) => {
    setDevices(prev => prev.map(d => {
      if (d.id === selectedId) {
        const newPos = [...d.pos];
        newPos[axis] = val;
        return { ...d, pos: newPos };
      }
      return d;
    }));
  };

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}>
      <div style={{ position: "absolute", zIndex: 10, padding: 20, color: '#222', pointerEvents: 'none' }}>
        <h2 style={{ margin: 0 }}>Saha Master v5.0</h2>
        <p>Sensörleri diz, kaydet ve simülasyonu başlat.</p>
        <p>Durum: <b>{isRunning ? "ÇALIŞIYOR" : "DURDU"}</b></p>
      </div>

      <Canvas camera={{ position: [10, 8, 10] }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <OrbitControls makeDefault enabled={!selectedId} />
        <Stars radius={100} depth={50} count={500} factor={4} />
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#999" sectionColor="#444" fadeDistance={30} />

        {/* Yürüyen Bant */}
        <Box args={[12, 0.1, 2]} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#222" />
        </Box>

        {/* Hareket Eden Kutu */}
        <BoxWithLogic isRunning={isRunning} pos={boxPos} setPos={setBoxPos} />

        {/* Dinamik Sensörler */}
        {devices.map((device) => (
          <Sensor 
            key={device.id} 
            device={device} 
            isSelected={selectedId === device.id} 
            onSelect={setSelectedId} 
            boxPos={boxPos}
          />
        ))}

        {/* Boşlukta seçimi bırakma alanı */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} onClick={() => setSelectedId(null)}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </main>
  );
}

// --- KUTU HAREKET MANTIĞI ---
function BoxWithLogic({ isRunning, pos, setPos }: any) {
  useFrame(() => {
    if (isRunning) {
      setPos((prev: any) => [prev[0] + 0.04, prev[1], prev[2]]);
      if (pos[0] > 6) setPos([-4.5, 0.3, 0]); // Başa dön
    }
  });

  return (
    <Box position={pos} args={[0.6, 0.6, 0.6]}>
      <meshStandardMaterial color="orange" metalness={0.4} roughness={0.5} />
    </Box>
  );
}
