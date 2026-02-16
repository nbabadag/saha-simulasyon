"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Box, Text, Environment, ContactShadows, PerspectiveCamera } from "@react-three/drei";
import { useState, useRef } from "react";
import { useControls, button, folder } from "leva";

// --- FACTORY I/O TARZI PROFESYONEL BANT ---
function HeavyConveyor({ pos, length = 6 }: any) {
  return (
    <group position={pos}>
      {/* Ana Gövde - Alüminyum Profil Görünümü */}
      <Box args={[length, 0.4, 1.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#555" metalness={1} roughness={0.1} />
      </Box>
      {/* Bant Yüzeyi */}
      <Box args={[length, 0.05, 1.4]} position={[0, 0.22, 0]}>
        <meshStandardMaterial color="#111" roughness={0.8} />
      </Box>
      {/* Destek Ayakları */}
      <Box args={[0.2, 1, 1.5]} position={[-length/2.5, -0.6, 0]}><meshStandardMaterial color="#333" /></Box>
      <Box args={[0.2, 1, 1.5]} position={[length/2.5, -0.6, 0]}><meshStandardMaterial color="#333" /></Box>
    </group>
  );
}

function SimulationEngine({ isRunning, boxPos, setBoxPos, devices }: any) {
  useFrame(() => {
    if (!isRunning) return;
    let speed = 0.05;
    
    // Sensör Mantığı
    devices.forEach((s: any) => {
      const dist = Math.sqrt(Math.pow(s.pos[0] - boxPos[0], 2));
      if (dist < 0.3 && s.action === 'STOP') speed = 0;
    });

    setBoxPos((prev: any) => [prev[0] + speed, prev[1], prev[2]]);
    if (boxPos[0] > 5) setBoxPos([-5, 0.6, 0]);
  });

  return (
    <>
      <HeavyConveyor pos={[0, 0, 0]} length={12} />
      {/* Ürün (Kutu) */}
      <Box position={boxPos} args={[0.8, 0.8, 0.8]} castShadow>
        <meshStandardMaterial color="#d2a679" roughness={0.5} /> {/* Karton Rengi */}
      </Box>
    </>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<any>(null);
  const [boxPos, setBoxPos] = useState<[number, number, number]>([-5, 0.6, 0]);
  const [isRunning, setIsRunning] = useState(false);

  useControls("FACTORY I/O CLONE v7.0", {
    "SİSTEM": folder({
      "RUN": button(() => setIsRunning(true)),
      "STOP": button(() => setIsRunning(false)),
      "RESET": button(() => setBoxPos([-5, 0.6, 0])),
    }),
    "EKLE": folder({
      "İNDÜKTİF SENSÖR": button(() => {
        setDevices(prev => [...prev, { id: Date.now(), pos: [0, 0.6, 1], action: 'NONE' }]);
      }),
    }),
    ...(selectedId ? {
      "CİHAZ AYARI": folder({
        "X Ekseni": { value: devices.find(d => d.id === selectedId)?.pos[0], min: -6, max: 6, onChange: (v) => {
          setDevices(prev => prev.map(d => d.id === selectedId ? {...d, pos: [v, d.pos[1], d.pos[2]]} : d))
        }},
        "MANTIK": { options: ["İZLE", "DURDUR"], onChange: (v) => {
            setDevices(prev => prev.map(d => d.id === selectedId ? {...d, action: v === "DURDUR" ? 'STOP' : 'NONE'} : d))
        }}
      })
    } : {})
  }, [selectedId, devices]);

  return (
    <main style={{ width: "100vw", height: "100vh" }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={40} />
        <OrbitControls makeDefault />
        
        {/* Factory I/O Atmosferi için Environment ve Gölgeler */}
        <Environment preset="city" />
        <ContactShadows opacity={0.4} scale={20} blur={2.4} far={4.5} />
        <ambientLight intensity={0.4} />
        
        <Grid infiniteGrid cellSize={1} sectionSize={5} cellColor="#888" sectionColor="#444" />

        <SimulationEngine isRunning={isRunning} boxPos={boxPos} setBoxPos={setBoxPos} devices={devices} />

        {devices.map(d => (
          <group key={d.id} position={d.pos} onClick={() => setSelectedId(d.id)}>
            <Box args={[0.3, 0.3, 0.3]}><meshStandardMaterial color={selectedId === d.id ? "yellow" : "cyan"} metalness={1} /></Box>
            <Cylinder args={[0.05, 0.05, 1]} rotation={[Math.PI/2, 0, 0]} position={[0,0,-0.5]}>
                <meshBasicMaterial color="red" transparent opacity={0.2} />
            </Cylinder>
          </group>
        ))}

      </Canvas>
    </main>
  );
}
