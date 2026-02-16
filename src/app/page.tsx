"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Box } from "@react-three/drei";

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#111" }}>
      <div style={{ position: "absolute", zIndex: 1, color: "white", padding: 20 }}>
        <h1>Web Simülasyon Sistemi v1.0</h1>
        <p>PLC ve Sensör Dünyasına Hoş Geldiniz.</p>
      </div>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <OrbitControls />
        <Stars />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {/* Test Kutusu - Simülasyon Nesnesi */}
        <Box position={[0, 0, 0]}>
          <meshStandardMaterial color="orange" />
        </Box>
        {/* Yerleşim Zemini */}
        <gridHelper args={[20, 20]} />
      </Canvas>
    </main>
  );
}
