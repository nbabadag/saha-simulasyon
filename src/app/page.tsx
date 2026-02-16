"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Box, Text, Cylinder } from "@react-three/drei";
import { createClient } from '@supabase/supabase-js';
import { useControls, button } from "leva";
import { useRef, useState } from "react";
import * as THREE from "three";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function WorkshopScene({ settings }: any) {
  const boxRef = useRef<THREE.Mesh>(null);
  
  // PLC Simülasyon Döngüsü
  useFrame(() => {
    if (boxRef.current && boxRef.current.position.x < settings.sensorX) {
      boxRef.current.position.x += 0.04;
    }
  });

  return (
    <>
      <gridHelper args={[20, 20, 0x444444, 0x222222]} />
      
      {/* --- ELEKTRİK PANOSU --- */}
      <group position={[0, 2, -4]}>
        {/* Pano Gövdesi */}
        <Box args={[4, 5, 1]}>
          <meshStandardMaterial color="#333" metalness={0.6} roughness={0.2} />
        </Box>
        {/* Pano İç Rayı (DIN Rail) */}
        <Box args={[3.5, 0.1, 0.2]} position={[0, 1, 0.45]}>
          <meshStandardMaterial color="silver" />
        </Box>
        
        {/* Pano Kapağı (Dinamik) */}
        <group position={[2, 0, 0.5]} rotation={[0, settings.panoKapagi ? -Math.PI / 1.5 : 0, 0]}>
          <Box args={[4, 5, 0.1]} position={[-2, 0, 0]}>
            <meshStandardMaterial color="#444" metalness={0.5} transparent opacity={0.9} />
          </Box>
          <Text position={[-2, 0, 0.1]} fontSize={0.2} color="yellow">DİKKAT: YÜKSEK GERİLİM</Text>
        </group>

        {/* Panonun İçindeki Örnek PLC */}
        {settings.panoKapagi && (
          <Box args={[1, 1.2, 0.5]} position={[-1, 1, 0.7]}>
            <meshStandardMaterial color="#555" />
            <Text position={[0, 0, 0.26]} fontSize={0.1} color="white">S7-1200 CPU</Text>
          </Box>
        )}
      </group>

      {/* Bant ve Kutu */}
      <Box args={[10, 0.1, 2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#111" />
      </Box>
      <Box ref={boxRef} args={[0.6, 0.6, 0.6]} position={[-4.5, 0.3, 0]}>
        <meshStandardMaterial color="orange" />
      </Box>

      <OrbitControls />
    </>
  );
}

export default function Home() {
  const settings = useControls({
    panoKapagi: false,
    sensorX: { value: 2, min: -3, max: 3 },
    "PROJEYİ BULUTA YAZ": button(async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert([{ project_name: 'Pano Tasarımı 1', layout_data: { sensorX: 2 } }]);
      if (!error) alert("Pano ayarları kaydedildi!");
    })
  });

  return (
    <main style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      <Canvas camera={{ position: [8, 5, 12] }}>
        <Stars />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <WorkshopScene settings={settings} />
      </Canvas>
    </main>
  );
}
