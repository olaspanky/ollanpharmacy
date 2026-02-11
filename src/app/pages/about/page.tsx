'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import i1 from "../../../../public/img/o2.png"
import i2 from "../../../../public/img/o3.png"
import i3 from "../../../../public/img/o1.png"
import i4 from "../../../../public/img/o4.png"
import i5 from "../../../../public/img/o5.png"


interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  color: string;
  imageUrl?: any;
  initials: string;
}

export default function AboutUs() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const ceo: TeamMember = {
    id: 1,
    name: "Oladejo Olakareem",
    role: "Chief Executive Officer",
    bio: "A second-generation CEO, Oladejo grew up inside the Ollan Pharmacy business and now leads its evolution into a modern, tech-enabled healthcare company. He is focused on using technology, data, and operational excellence to expand access to quality medicines and food while keeping community trust at the center of everything.",
    color: "#dc2626",
      imageUrl: i1, // Replace with actual image path
    initials: "SM"
  };

  const teamMembers: TeamMember[] = [
    {
      id: 2,
      name: "Abdulkarerm Ajolayo Olakareem",
      role: "COO",
      bio: "Operations mastermind scaling efficiency and building sustainable growth frameworks.",
      color: "#b91c1c",
      imageUrl: i2, // Replace with actual image path
      initials: "MC"
    },
    {
      id: 3,
      name: "Olakareem Abdulwasii Omobolarinwa",
      role: "CTO",
      bio: "Tech pioneer architecting tomorrow's solutions with cutting-edge engineering.",
      color: "#991b1b",
      imageUrl: i3, // Replace with actual image path
      initials: "AR"
    },
    {
      id: 4,
      name: "Muizat Busari,",
      role: "Product Manager",
      bio: "While her journey with the company began more recently, her deep interest in the intersection of healthcare and brand storytelling has made her a vital part of the firm’s digital transformation",
      color: "#dc2626",
      imageUrl: i4, // Replace with actual image path
      initials: "JP"
    },
    {
      id: 5,
      name: "Balogun Lateef",
      role: "Operations and Digital Marketer",
      bio: "Balogun Lateef currently works at Ollan Pharmacy and Supermarket, where he improves operations, increases visibility, and drives sustainable growth across the pharmacy. ",
      color: "#b91c1c",
      imageUrl: i5, // Replace with actual image path
      initials: "EW"
    },
  
  ];

  return (
    <div className="min-h-screen  text-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-white"></div>
        <div 
          className="absolute w-[1000px] h-[1000px] rounded-full blur-[150px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)',
            left: mousePosition.x - 500,
            top: mousePosition.y - 500,
            transition: 'left 0.3s ease-out, top 0.3s ease-out'
          }}
        ></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div style={{
            backgroundImage: 'linear-gradient(#ef4444 1px, transparent 1px), linear-gradient(90deg, #ef4444 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} className="w-full h-full"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-red-500 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 py-20 relative">
          <div className="max-w-7xl w-full">
            {/* Main Title */}
            <div className="text-center mb-20">
            

              <h1 
                className="text-8xl md:text-9xl lg:text-[5rem] font-black mb-8 relative leading-none"
                style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
              >
                <span className="absolute inset-0 text-red-600 opacity-50 blur-lg animate-pulse">
                  THE TEAM
                </span>
                <span className="relative bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
                  THE TEAM
                </span>
              </h1>
              
              {/* Animated Line */}
              <div className="flex justify-center gap-2 mb-8">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1 bg-red-600 rounded-full"
                    style={{
                      width: i === 3 ? '120px' : '40px',
                      animation: `pulse 2s ease-in-out ${i * 0.1}s infinite`
                    }}
                  ></div>
                ))}
              </div>

              <p 
                className="text-2xl md:text-3xl text-red-300 max-w-4xl mx-auto leading-relaxed tracking-wide"
                style={{ fontFamily: "'Crimson Pro', 'Georgia', serif" }}
              >
                We don't follow trends.{' '}
                <span className="text-red-500 font-bold italic">We create them.</span>
              </p>
            </div>

            {/* CEO Spotlight - HERO CARD */}
            <div 
              className="mb-20 perspective-1000"
              style={{
                animation: 'slideUp 0.8s ease-out both'
              }}
            >
              <div 
                className="relative max-w-5xl mx-auto"
                onMouseEnter={() => setActiveCard(ceo.id)}
                onMouseLeave={() => setActiveCard(null)}
              >
                {/* Glowing Background Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-[3rem] blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 animate-pulse"></div>
                
                <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-black rounded-[2.5rem] overflow-hidden border-2 border-red-500 transform-gpu transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/50">
                  {/* Animated Scanlines */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 animate-scanline" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)'
                    }}></div>
                  </div>

                  {/* Spotlight Effect */}
                  <div 
                    className="absolute w-96 h-96 rounded-full opacity-30 pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      left: mousePosition.x / 10,
                      top: mousePosition.y / 10,
                      transition: 'left 0.5s ease-out, top 0.5s ease-out'
                    }}
                  ></div>

                  <div className="relative p-12 md:p-16">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                      {/* CEO Image - Large Circle */}
                      <div className="relative flex-shrink-0">
                        <div className="relative w-64 h-64 md:w-80 md:h-80">
                          {/* Rotating Ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/30 animate-spin-slow"></div>
                          <div className="absolute inset-4 rounded-full border-2 border-white/20"></div>
                          
                          {/* Main Circle with Image */}
                          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-white to-red-50 shadow-2xl overflow-hidden">
                            {/* Image Container */}
                            <div className="relative w-full h-full">
                              <Image 
                                src={ceo.imageUrl} 
                                alt={`${ceo.name} - ${ceo.role}`}
                                className="w-full h-full object-cover"
                               
                              />
                             
                            </div>
                          </div>

                          {/* Orbiting Dots */}
                          <div className="absolute inset-0 pointer-events-none">
                            {[0, 120, 240].map((angle, i) => (
                              <div
                                key={i}
                                className="absolute w-4 h-4 bg-white rounded-full shadow-lg"
                                style={{
                                  top: '50%',
                                  left: '50%',
                                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-140px)`,
                                  animation: `orbit 6s linear ${i * 2}s infinite`
                                }}
                              ></div>
                            ))}
                          </div>
                        </div>

                        {/* CEO Badge */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-red-600 px-8 py-3 rounded-full shadow-xl border-4 border-red-600">
                          <span className="font-black text-2xl tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
                            CEO
                          </span>
                        </div>
                      </div>

                      {/* CEO Info */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="inline-block mb-4 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                          <span className="text-sm font-bold tracking-widest uppercase text-white/90" style={{ fontFamily: "'Space Mono', monospace" }}>
                            {ceo.role}
                          </span>
                        </div>

                        <h2 
                          className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-none text-white"
                          style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                        >
                          {ceo.name}
                        </h2>

                        <div className="w-24 h-1 bg-white mb-6 md:mx-0 mx-auto"></div>

                        <p 
                          className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8"
                          style={{ fontFamily: "'Lato', sans-serif" }}
                        >
                          {ceo.bio}
                        </p>

                        {/* CEO Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="text-4xl font-black text-white mb-1">15+</div>
                            <div className="text-sm text-white/70">Years</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="text-4xl font-black text-white mb-1">5+</div>
                            <div className="text-sm text-white/70">Projects</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                            <div className="text-4xl font-black text-white mb-1">50+</div>
                            <div className="text-sm text-white/70">Team</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Decorative Corner Elements */}
                    <div className="absolute top-8 left-8 w-16 h-16 border-t-4 border-l-4 border-white/30 rounded-tl-3xl"></div>
                    <div className="absolute top-8 right-8 w-16 h-16 border-t-4 border-r-4 border-white/30 rounded-tr-3xl"></div>
                    <div className="absolute bottom-8 left-8 w-16 h-16 border-b-4 border-l-4 border-white/30 rounded-bl-3xl"></div>
                    <div className="absolute bottom-8 right-8 w-16 h-16 border-b-4 border-r-4 border-white/30 rounded-br-3xl"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Leadership Team Grid */}
            <div>
              <h3 
                className="text-5xl md:text-6xl font-black text-center mb-12 tracking-tight"
                style={{ fontFamily: "'Oswald', 'Impact', sans-serif" }}
              >
                <span className="bg-gradient-to-r from-red-400 to-black bg-clip-text text-transparent">
                  LEADERSHIP TEAM
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className="group relative"
                    style={{
                      animation: `slideUp 0.6s ease-out ${(index + 1) * 0.1}s both`
                    }}
                    onMouseEnter={() => setActiveCard(member.id)}
                    onMouseLeave={() => setActiveCard(null)}
                  >
                    <div className="relative h-[480px] rounded-3xl overflow-hidden transform-gpu transition-all duration-500 hover:scale-105 hover:-rotate-1">
                      {/* Card Background */}
                      <div 
                        className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(135deg, ${member.color} 0%, #000 100%)`
                        }}
                      ></div>

                      {/* Hover Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col">
                        {/* Role Badge */}
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span 
                              className="text-xs font-bold tracking-widest uppercase"
                              style={{ fontFamily: "'Space Mono', monospace" }}
                            >
                              {member.role}
                            </span>
                          </div>
                          
                          <div className="w-12 h-12 border-t-2 border-r-2 border-white/30 rounded-tr-2xl group-hover:border-red-400 transition-colors duration-500"></div>
                        </div>

                        {/* Team Member Image */}
                        <div className="relative w-48 h-48 mx-auto mb-6">
                          <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-red-400 transition-colors duration-500"></div>
                          <div className="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-white to-red-50 shadow-xl">
                            <div className="relative w-full h-full">
                              <Image 
                                src={member.imageUrl} 
                                alt={`${member.name} - ${member.role}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            
                            </div>
                          </div>
                          {/* Decorative ring */}
                          <div className="absolute -inset-4 rounded-full border border-dashed border-white/20 group-hover:rotate-180 transition-transform duration-[3s]"></div>
                        </div>

                        {/* Name and Bio */}
                        <div className="mt-auto text-center">
                          <h4 
                            className="text-3xl font-white text-white mb-3 leading-none transform group-hover:scale-105 transition-transform duration-500"
                            style={{ fontFamily: "'Oswald', 'Impact', sans-serif" }}
                          >
                            {member.name}
                          </h4>
                          <p 
                            className="text-red-50 text-sm leading-relaxed opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                            style={{ fontFamily: "'Lato', sans-serif" }}
                          >
                            {member.bio}
                          </p>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute bottom-8 right-8 w-20 h-20 border-2 border-white/10 rounded-full group-hover:scale-150 group-hover:border-red-500/30 transition-all duration-700 pointer-events-none"></div>
                      </div>

                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {/* <section className="relative py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-800"></div>
          <div className="absolute inset-0 opacity-10">
            <div style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 40px)`
            }} className="w-full h-full"></div>
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <h2 
              className="text-6xl md:text-7xl font-black mb-20 tracking-tight text-white"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              BY THE NUMBERS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { value: '500+', label: 'Projects Delivered' },
                { value: '50+', label: 'Team Members' },
                { value: '15+', label: 'Years Experience' },
                { value: '98%', label: 'Client Satisfaction' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border-2 border-white/20 hover:border-white/50 transition-all duration-500 hover:scale-105"
                  style={{
                    animation: `slideUp 0.6s ease-out ${i * 0.1}s both`
                  }}
                >
                  <div 
                    className="text-6xl md:text-7xl font-black text-white mb-4"
                    style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-red-100 text-lg font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        {/* CTA Section */}
        {/* <section className="py-32 px-6 bg-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-6xl md:text-7xl font-black mb-8 bg-gradient-to-r from-red-500 to-white bg-clip-text text-transparent"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              Join Our Journey
            </h2>
            <p className="text-2xl text-gray-400 mb-12" style={{ fontFamily: "'Lato', sans-serif" }}>
              We're always looking for talented individuals who share our passion for excellence.
            </p>
            <button className="group relative bg-red-600 hover:bg-red-700 text-white font-black px-12 py-6 rounded-full transition-all duration-500 text-xl hover:scale-105 shadow-2xl hover:shadow-red-500/50 overflow-hidden">
              <span className="relative z-10" style={{ fontFamily: "'Oswald', sans-serif" }}>VIEW OPEN POSITIONS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
          </div>
        </section> */}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg) translateY(-140px);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg) translateY(-140px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </div>
  );
}