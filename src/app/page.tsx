"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Cylinder } from "@react-three/drei";
import { createClient } from '@supabase/supabase-js';
import { useControls, button } from "leva";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

// --- SUPABASE BAĞLANTISI ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function PhysicalScene({ settings }: any) {
  const boxRef = useRef<THREE.Mesh>(null);
  const [phase, setPhase] = useState('MOVING');

  useFrame(() => {
    if (boxRef.current && phase === 'MOVING') {
      boxRef.current.position.x += settings.bantHizi;
      if (boxRef.current.position.x >= settings.sensorX) {
        setPhase('STOPPED');
      }
    }
  });

  return (
    <>
      <gridHelper args={[20, 20, 0x555555, 0x333333]} />
      {/* Bant */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>
      {/* Sensör */}
      <group position={[settings.sensorX, 0.5, 1]}>
        <Box args={[0.3, 0.3, 0.3]}><meshStandardMaterial color="#444" /></Box>
        <Cylinder args={[0.01, 0.01, 2]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
          <meshBasicMaterial color="red" transparent opacity={0.4} />
        </Cylinder>
      </group>
      {/* Kutu */}
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>
      <OrbitControls />
    </>
  );
}

export default function Home() {
  const settings = useControls({
    projectID: { value: 'Saha-01' },
    bantHizi: { value: 0.04, min: 0, max: 0.2 },
    sensorX: { value: 2, min: -3, max: 3 },
    "BULUTA KAYDET": button(async () => {
      const { data, error } = await supabase
        .from('projects')
        .upsert([{ 
          project_name: 'Saha-01', 
          layout_data: { bantHizi: 0.04, sensorX: 2 } // Örnek veri
        }]);
      if (error) alert("Hata: " + error.message);
      else alert("Ayarlar Supabase'e başarıyla gönderildi!");
    })
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      <div style={{ position: "absolute", zIndex: 1, color: "white", padding: 20 }}>
        <h1>Endüstriyel Simülasyon v2.0</h1>
        <small>Supabase Bulut Bağlantısı: AKTİF</small>
      </div>
      <Canvas camera={{ position: [8, 8, 8] }}>
        <Stars />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PhysicalScene settings={settings} />
      </Canvas>
    </main>
  );
}
