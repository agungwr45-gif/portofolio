'use client';

import React, { Suspense, useRef, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  PerspectiveCamera,
  MeshTransmissionMaterial,
  Environment,
  ContactShadows,
  AdaptiveDpr,
  AdaptiveEvents,
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Download, 
  Mail,
} from 'lucide-react';

// --- Types ---
interface ProjectLink {
  label: string;
  type: string;
  url: string;
}

interface Project {
  title: string;
  desc: string;
  img: string;
  links: ProjectLink[];
}

// --- Custom Sharp Icons ---
const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.553 4.189 1.606 6.06L0 24l6.12-1.605a11.778 11.778 0 005.925 1.585h.005c6.637 0 12.032-5.396 12.035-12.03a11.824 11.824 0 00-3.517-8.403z"/>
  </svg>
);

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);

// --- Pointer Manager ---
function PointerManager() {
  const { mouse } = useThree();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouse]);
  return null;
}

// --- Optimized Architectural Sphere ---
function ArchitecturalSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  
  // DRATICALLY reduced detail from 15 to 3 for massive FPS boost
  const sphereGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 3), []);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      const targetRotationX = state.mouse.y * 1.0;
      const targetRotationY = state.mouse.x * 1.0;
      
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotationY + t * 0.1, 0.06);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetRotationX, 0.06);
      
      const limitX = Math.max(0, (viewport.width / 7) - 1.1);
      const limitY = Math.max(0, (viewport.height / 7) - 1.1);

      const targetX = state.mouse.x * limitX;
      const targetY = state.mouse.y * limitY;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.06);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.06);
    }
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={sphereGeo}>
        <MeshTransmissionMaterial 
          samples={6} // Reduced from 16 to 6
          thickness={1.0} 
          chromaticAberration={0.05} 
          anisotropy={0.1} 
          distortion={0}
          color="#06b6d4"
          transmission={1} 
          roughness={0.02} 
          ior={1.2}
          emissive="#0891b2"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

// --- Compact Glass Project Card ---
function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-2xl border border-white/30 rounded-[3rem] overflow-hidden flex flex-col transition-all duration-700 hover:scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)]"
    >
      <div className="relative h-64 bg-neutral-100/10 overflow-hidden border-b border-white/10">
        {project.img && <Image src={project.img} alt={project.title} fill className="object-cover object-top transition-transform duration-1000 group-hover:scale-105" unoptimized />}
      </div>

      <div className="p-10 flex-1 flex flex-col justify-between relative z-10">
        <div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-3xl font-black tracking-tighter text-neutral-950 uppercase leading-none">{project.title}</h3>
          </div>
          <p className="text-neutral-900 text-lg font-bold opacity-80 mb-8 leading-snug">{project.desc}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {project.links.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 px-8 py-4 bg-neutral-950 text-white rounded-full text-[11px] font-black tracking-widest uppercase hover:bg-black transition-all active:scale-95 shadow-lg">
              {link.type === 'web' && <ExternalLink size={14} />}
              {link.type === 'ig' && <InstagramIcon size={14} />}
              {link.type === 'drive' && <Download size={14} />}
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function BlendedPortfolio() {
  const projects: Project[] = [
    { title: "blog.jackton.xyz", desc: "Portal berita teknologi dan properti yang dioperasikan sepenuhnya oleh jurnalis AI. Menyajikan informasi industri secara otomatis sepanjang waktu.", img: "/assets/preview-blog.jackton.xyz.png", links: [{ label: "Website", type: "web", url: "http://blog.jackton.xyz" }, { label: "Instagram", type: "ig", url: "https://instagram.com/jackton.xyz" }] },
    { title: "lolos.online", desc: "Membangun platform persiapan seleksi online dengan sistem automasi evaluasi dan penilaian berbasis AI. Platform ini melakukan analisa performa personal untuk memberikan rekomendasi belajar yang akurat bagi peserta ujian.", img: "/assets/preview-lolos.online.png", links: [{ label: "Website", type: "web", url: "http://lolos.online" }] },
    { title: "bettercalljack.lab", desc: "Laboratorium eksperimental di Instagram yang mengeksarasi sinergi antara kreativitas visual dan algoritma media sosial.", img: "/assets/preview-bettercalljack.lab.jpg", links: [{ label: "Instagram", type: "ig", url: "https://instagram.com/bettercalljack.lab" }] },
    { title: "Fantasy Spa", desc: "Berhasil mengimplementasikan perbaikan operasional dan performance marketing, yang sukses menaikkan jumlah pengunjung hingga 61% dan mendorong pertumbuhan net profit sebesar 74% dibandingkan bulan sebelumnya.", img: "/assets/preview-fantasyspa.jpg", links: [{ label: "Drive Archive", type: "drive", url: "https://drive.google.com/drive/folders/1ZQOfb5t7KB6zJIxm1dZwZ0NIdf4UuO6z?usp=sharing" }] }
  ];

  const stockedTools = [
    "Claude Code", "Claude App", "Claude Cowork", "Gemini App", "Gemini CLI", 
    "Nano Banana", "ElevenLabs", "n8n", "Cloudflare WARP", "GitHub", "Vercel", 
    "Canva", "CapCut", "Meta Ads", "etc."
  ];

  return (
    <main className="relative min-h-screen w-full bg-white font-sans selection:bg-neutral-900 selection:text-white overflow-x-hidden">
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas dpr={[1, 1.5]} performance={{ min: 0.5 }}>
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <PointerManager />
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
          <ambientLight intensity={1.5} />
          <pointLight position={[10, 10, 10]} intensity={8} color="#ffffff" />
          <spotLight position={[-15, 20, 15]} angle={0.4} penumbra={1} intensity={20} color="#0891b2" />
          <spotLight position={[20, -15, 10]} angle={0.4} penumbra={1} intensity={12} color="#0ea5e9" />
          <Suspense fallback={null}>
            <group scale={3.5}>
              <ArchitecturalSphere />
            </group>
            <Environment preset="studio" />
            <ContactShadows position={[0, -5, 0]} opacity={0.05} scale={20} blur={6} far={10} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content Section */}
      <div className="relative z-10 w-full flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-24 px-6 max-w-5xl w-full flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-44 md:h-44 mb-10 rounded-full overflow-hidden border-[4px] border-white shadow-2xl bg-white">
            <Image src="/assets/foto-agung.JPG" alt="Agung Wahyu Riyadi" fill className="object-cover" unoptimized />
          </motion.div>

          <motion.div className="mb-10 px-8 py-2.5 sm:px-10 sm:py-3 rounded-full border border-neutral-200 bg-white/40 backdrop-blur-xl shadow-sm">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[1.5em] text-neutral-950 pl-[1.5em]">PORTFOLIO</span>
          </motion.div>
          
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl sm:text-6xl md:text-[110px] font-black tracking-tighter leading-[0.9] sm:leading-[0.8] mb-8 sm:mb-12 text-neutral-950 text-center">
            AGUNG WAHYU <br /> RIYADI.
          </motion.h1>

          <motion.p className="max-w-2xl text-neutral-800 text-lg sm:text-2xl font-black italic mb-12 sm:mb-16 tracking-tight px-4">
            &quot;fortune favors the bold&quot;
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 relative z-20 w-full sm:w-auto px-6">
            <a href="/assets/Profile resume.pdf" target="_blank" rel="noopener noreferrer" className="px-10 py-5 bg-neutral-950 text-white rounded-full font-black text-[12px] uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 flex items-center justify-center gap-2">
              <Download size={18} /> Download CV
            </a>
            <a href="mailto:agungwr45@gmail.com" className="px-10 py-5 bg-white/40 backdrop-blur-2xl border-2 border-white rounded-full font-black text-[12px] uppercase tracking-widest hover:bg-white transition-all active:scale-95 text-neutral-900 shadow-xl flex items-center justify-center gap-2">
              <Mail size={18} /> Contact Me
            </a>
          </div>
        </section>

        {/* Jendela Konten (iOS Glass Effect) */}
        <section className="max-w-5xl w-full px-6 sm:px-8 mb-32 sm:mb-40">
          <div className="bg-gradient-to-br from-white/25 via-white/10 to-transparent backdrop-blur-3xl border border-white/40 p-8 sm:p-12 md:p-16 rounded-[3rem] sm:rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 relative overflow-hidden">
            {/* Glossy Overlay Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
            
            <div className="lg:col-span-7 text-center lg:text-left text-neutral-950 relative z-10">
              <h2 className="text-[11px] uppercase tracking-[0.8em] text-neutral-400 font-black mb-6 sm:mb-8">THE MISSION</h2>
              <p className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tighter mb-6 sm:mb-8 uppercase">
                ARCHITECTING <br /><span className="text-neutral-400 italic">AUTONOMY.</span>
              </p>
              <p className="text-lg sm:text-xl leading-snug font-black opacity-80">
                Menggabungkan keahlian di digital marketing dan sales ke dalam sistem berbasis AI, dengan fokus membangun infrastruktur yang bekerja secara otomatis dan berbasis data.
              </p>
            </div>
            <div className="lg:col-span-5 flex flex-col justify-center space-y-8 sm:space-y-10 lg:border-l lg:border-white/40 lg:pl-16 items-center lg:items-start text-neutral-950 relative z-10">
              <a href="https://wa.me/6285869154325" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl flex items-center justify-center text-neutral-400 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-700 shadow-lg"><WhatsAppIcon size={24} /></div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400">WhatsApp</span>
                  <span className="text-lg sm:text-xl font-black tracking-tighter uppercase">0858-6915-4325</span>
                </div>
              </a>
              <a href="https://linkedin.com/in/agung-wahyu-riyadi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 sm:gap-6 group">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl flex items-center justify-center text-neutral-400 group-hover:bg-neutral-950 group-hover:text-white transition-all duration-700 shadow-lg"><LinkedinIcon size={24} /></div>
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-neutral-400">LinkedIn</span>
                  <span className="text-lg sm:text-xl font-black text-neutral-950 tracking-tighter uppercase text-wrap text-center lg:text-left">Agung Wahyu Riyadi</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Projects Titles */}
        <div className="max-w-5xl w-full px-6 space-y-12 pb-48 sm:pb-64">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-[14px] uppercase tracking-[1em] text-neutral-400 font-black mb-8 sm:mb-12">PROJECTS</h2>
            <h3 className="text-4xl sm:text-6xl md:text-[100px] font-black tracking-tighter leading-[0.8] uppercase text-neutral-950">Selected <br /><span className="text-neutral-400 italic">Works.</span></h3>
          </div>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {projects.map((project, i) => (
              <ProjectCard key={i} project={project} />
            ))}
          </section>
        </div>

        {/* Tools Section */}
        <section className="max-w-5xl w-full px-6 mb-32 sm:mb-40">
          <div className="bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-3xl border border-white/30 p-8 sm:p-12 md:p-16 rounded-[3rem] sm:rounded-[4rem] shadow-2xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/5 pointer-events-none" />
            <h2 className="text-[11px] uppercase tracking-[1em] text-neutral-400 font-black mb-12 sm:mb-16 relative z-10">STOCKED TOOLS</h2>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 sm:gap-x-10 sm:gap-y-6 relative z-10">
              {stockedTools.map((tool, i) => (
                <span key={i} className="text-sm sm:text-lg md:text-xl font-black text-neutral-950 uppercase tracking-tighter opacity-40 hover:opacity-100 transition-opacity cursor-default">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mx-6 mb-12 py-16 sm:py-24 px-6 bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-3xl border border-white/30 rounded-[3rem] sm:rounded-[4rem] text-center shadow-2xl w-[calc(100%-3rem)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/5 pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter mb-8 sm:mb-12 text-neutral-950 uppercase opacity-20 relative z-10">LET&apos;S BUILD.</h2>
          <div className="pt-8 sm:pt-12 border-t border-neutral-200 relative z-10">
            <p className="text-[14px] sm:text-[16px] text-neutral-950 font-black uppercase tracking-[1.5em]">2026</p>
          </div>
        </footer>

      </div>

    </main>
  );
}
