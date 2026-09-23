import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useMotionValue } from 'framer-motion';
import { ArrowRight, Menu, X, ChevronRight } from 'lucide-react';

// ==========================================
// 1. DADOS E CONFIGURAÇÕES ESTÁTICAS
// ==========================================

const NAV_ITEMS = [
  { label: 'Início', href: 'home' },
  { label: 'Catálogo', href: 'catalog' },
  { label: 'Projetos', href: 'projects' },
  { label: 'Sobre Nós', href: 'about' },
];

const CATEGORIES = [
  {
    title: 'SISTEMAS\nDE CLOSETS',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop&fm=webp',
    description: 'Closets desenhados milimetricamente para maximizar o uso do espaço, com divisórias pensadas para as suas peças mais valiosas.'
  },
  {
    title: 'ESTANTES\nE NICHOS',
    image: 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?q=80&w=800&auto=format&fit=crop&fm=webp',
    description: 'Composições modulares que se adaptam à arquitetura da sua casa, unindo estética minimalista e capacidade de armazenamento.'
  },
  {
    title: 'ARMÁRIOS\nCOM PORTAS',
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?q=80&w=800&auto=format&fit=crop&fm=webp',
    description: 'Superfícies contínuas e sistemas de abertura invisíveis. Armários que se camuflam nas paredes ou se tornam o destaque do ambiente.'
  },
  {
    title: 'GAVETAS\nE ORGANIZAÇÃO',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop&fm=webp',
    description: 'A verdadeira organização mora no interior. Gavetas com divisores sob medida, corrediças invisíveis e amortecimento perfeito.'
  },
];

const PROJECTS = [
  { 
    title: 'Residência Villa Lobos', 
    category: 'Closet Master', 
    img: 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?q=80&w=1000&fm=webp',
    description: 'Um projeto completo de closet master desenvolvido com iluminação embutida e acabamento em laca fosca. Espaços inteligentemente divididos para joias, calçados e vestuário longo.'
  },
  { 
    title: 'Apartamento Jardins', 
    category: 'Living', 
    img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1000&fm=webp',
    description: 'Integração de marcenaria na sala de estar, criando painéis que ocultam a TV e revelam nichos iluminados para obras de arte.'
  },
  { 
    title: 'Cobertura Itaim', 
    category: 'Cozinha Planejada', 
    img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1000&auto=format&fit=crop&fm=webp',
    description: 'Cozinha gourmet de altíssimo padrão, com frentes em lâmina natural de madeira e bancadas em pedra sinterizada.'
  },
];

// ==========================================
// 2. VARIANTES DE ANIMAÇÃO (Framer Motion)
// ==========================================

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 20 } }
};

const revealText = {
  hidden: { y: '100%', opacity: 0, rotate: 5 },
  show: { y: 0, opacity: 1, rotate: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

// ==========================================
// 3. COMPONENTES COMPARTILHADOS
// ==========================================

/**
 * Modal genérico e reutilizável.
 * Impede o scroll do fundo quando aberto.
 */
const Modal = memo(({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-10"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()} // Impede que o clique no modal feche-o acidentalmente
            className="bg-[#e6e2db] rounded-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl"
          >
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 z-50 text-[#4a4238] bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/**
 * Barra de Navegação (Menu principal)
 * Otimizado com memo para não re-renderizar desnecessariamente.
 */
const Navbar = memo(({ currentPage, setCurrentPage, openContact }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Controle de scroll otimizado (Debounce simples)
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 30);
        timeoutId = null;
      }, 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -50 }} animate={{ y: 0 }} transition={{ duration: 0.8 }}
        className={`fixed w-full z-[60] top-0 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300 ${
          isOpen ? 'text-[#2a241f]' : (scrolled ? 'bg-[#2a241f]/90 backdrop-blur-md shadow-sm text-white' : 'mix-blend-difference text-white')
        }`}
      >
        <div 
          onClick={() => {setCurrentPage('home'); setIsOpen(false);}}
          className="text-xl md:text-2xl font-serif tracking-[0.2em] uppercase cursor-pointer"
        >
          Mira
        </div>
        
        {/* Menu Desktop */}
        <div className="hidden lg:flex items-center space-x-10 text-[10px] md:text-xs uppercase tracking-widest font-medium">
          {NAV_ITEMS.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentPage(item.href)}
              className={`transition-colors duration-300 relative group py-2 ${currentPage === item.href ? 'text-amber-200' : 'hover:text-amber-200'}`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 h-[1px] bg-amber-200 transition-all duration-300 ${currentPage === item.href ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
            </button>
          ))}
        </div>

        {/* Botão Orçamento Desktop */}
        <button 
          onClick={openContact}
          className="hidden lg:flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-[10px] uppercase tracking-wider transition-all duration-300 border border-white/20 hover:scale-105 active:scale-95"
        >
          Orçamento <ArrowRight size={14} />
        </button>

        {/* Botão Hamburguer Mobile */}
        <button className="lg:hidden z-[60] relative" aria-label="Menu" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </motion.nav>

      {/* Menu Fullscreen Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at top right)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at top right)' }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 h-[100dvh] w-screen bg-[#e6e2db] flex flex-col items-center justify-center text-[#4a4238] z-[55]"
          >
            <div className="flex flex-col space-y-6 text-center text-3xl font-serif px-6 w-full max-w-sm">
              {NAV_ITEMS.map((item, idx) => (
                <motion.button 
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.1 }}
                  key={idx} 
                  onClick={() => { setCurrentPage(item.href); setIsOpen(false); }} 
                  className={`hover:text-[#a89078] transition-colors py-2 ${currentPage === item.href ? 'text-[#a89078]' : ''}`}
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                onClick={() => { openContact(); setIsOpen(false); }} 
                className="mt-6 text-xs uppercase tracking-widest text-white bg-[#a89078] px-8 py-4 rounded-full w-full active:scale-95 transition-transform"
              >
                Solicitar Orçamento
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

const Footer = memo(({ openContact }) => (
  <footer className="bg-[#2a241f] text-[#e6e2db] pt-20 pb-10 px-6 md:px-12 rounded-t-[2rem] relative z-30">
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center mb-20">
      <h2 className="text-2xl md:text-4xl font-serif mb-6 uppercase tracking-widest text-[#f5f2ec]">Vamos criar juntos?</h2>
      <p className="text-[#a89078] mb-10 font-light text-xs md:text-sm max-w-lg">
        Entre em contato — nossa equipe de especialistas ajudará na escolha dos materiais e no orçamento.
      </p>
      <button 
        onClick={openContact}
        className="px-10 py-4 border border-[#a89078] rounded-full text-[10px] md:text-[11px] uppercase tracking-widest font-bold hover:bg-[#a89078] hover:text-[#2a241f] transition-colors duration-300"
      >
        Falar com Especialista
      </button>
    </div>

    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-[#a89078] border-t border-white/10 pt-8 gap-6 font-light">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center">
        <a href="#" className="hover:text-white transition-colors">Tel: +55 (11) 9999-9999</a>
        <a href="#" className="hover:text-white transition-colors">contato@miramoveis.com.br</a>
      </div>
      <div className="text-center md:text-right">
        São Paulo, SP — Seg a Dom, 10h às 20h
      </div>
    </div>
  </footer>
));

// ==========================================
// 4. COMPONENTES DAS PÁGINAS (Views)
// ==========================================

const HeroSection = memo(({ openContact }) => {
  // Animações baseadas no scroll da página
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 250]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 800], [1, 1.1]);

  // Animações baseadas no movimento do mouse (efeito parallax suave)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const videoRef = useRef(null);

  // Força o autoplay do vídeo no carregamento (importante para dispositivos móveis)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 30);
    mouseY.set((clientY / innerHeight - 0.5) * 30);
  };

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  return (
    <section onMouseMove={handleMouseMove} className="relative h-[100svh] w-full overflow-hidden bg-[#1a1613]">
      {/* Background com Vídeo */}
      <motion.div style={{ scale }} className="absolute inset-0 w-full h-full">
        <video 
          ref={videoRef}
          src="/Create_panning_video_with_fade_20260923122748.mp4" 
          autoPlay loop muted playsInline disablePictureInPicture
          className="w-full h-full object-cover object-center opacity-85 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#e6e2db]/95"></div>
      </motion.div>

      {/* Conteúdo Central */}
      <motion.div style={{ y: y1, opacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4 pt-24 pointer-events-none">
        <motion.div style={{ x: smoothX, y: smoothY }} className="flex flex-col items-center">
          <div className="overflow-hidden mb-2">
            <motion.h1 
              initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
              className="text-[18vw] md:text-[100px] lg:text-[130px] leading-none font-serif tracking-[0.1em] text-[#f5f2ec] drop-shadow-lg"
            >
              {['M', 'I', 'R', 'A'].map((letter, i) => (
                <motion.span key={i} variants={revealText} className="inline-block">{letter}</motion.span>
              ))}
            </motion.h1>
          </div>
          
          <motion.div
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }}
             className="flex flex-col items-center pointer-events-auto"
          >
            <p className="text-[9px] md:text-[11px] tracking-[0.4em] uppercase mb-8 md:mb-10 text-[#f5f2ec] font-light mix-blend-overlay drop-shadow-md">
              Móveis planejados para a sua vida
            </p>
            <button 
              onClick={openContact}
              className="group flex items-center gap-3 px-8 md:px-10 py-3 md:py-4 bg-white/95 hover:bg-white text-[#4a4238] rounded-full text-[10px] md:text-[11px] uppercase tracking-widest font-bold transition-all duration-500 shadow-xl hover:-translate-y-1 hover:shadow-2xl"
            >
              Iniciar Projeto <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
});

const DescriptionSection = memo(() => (
  <section className="py-20 md:py-28 px-6 md:px-12 bg-[#e6e2db] text-[#4a4238] relative z-20 -mt-6 md:-mt-10 rounded-t-[2rem] shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer} className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
      <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-serif leading-tight md:w-1/2 uppercase tracking-wide">
        Móveis Planejados<br/> sob medida
      </motion.h2>
      
      <motion.div variants={fadeInUp} className="md:w-5/12 flex flex-col gap-6 mt-2">
        <div className="w-12 h-[1px] bg-[#a89078]"></div>
        <p className="text-sm md:text-base leading-relaxed text-[#6b6255] font-light">
          Criamos móveis sob medida de acordo com as suas necessidades e as características do seu espaço. Selecionamos materiais premium para que cada detalhe funcione com conforto e estética.
        </p>
      </motion.div>
    </motion.div>
  </section>
));

const CategoryCard = memo(({ item, onClick }) => (
  <motion.div variants={fadeInUp} className="group relative cursor-pointer w-full" onClick={onClick}>
    <div className="overflow-hidden rounded-xl h-[350px] md:h-[450px] mb-4 relative shadow-md group-hover:shadow-xl transition-shadow duration-300">
      <motion.div 
        initial={{ scale: 1.15, opacity: 0, filter: "blur(4px)" }}
        whileInView={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="w-full h-full"
      >
        <img 
          src={item.image} 
          alt={item.title.replace('\n', ' ')}
          loading="lazy" // Otimização de performance: não baixa a imagem até ela aparecer na tela
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500"></div>
    </div>
    <div className="flex items-start justify-between border-t border-[#d5d0c7] pt-3">
      <h3 className="text-[10px] md:text-[11px] font-semibold tracking-[0.15em] text-[#4a4238] whitespace-pre-line leading-relaxed group-hover:text-[#a89078] transition-colors">
        {item.title}
      </h3>
      <motion.div whileHover={{ x: 3, scale: 1.1 }} className="text-[#a89078]">
        <ArrowRight size={16} strokeWidth={2} />
      </motion.div>
    </div>
  </motion.div>
));

const GallerySection = memo(({ openProject }) => (
  <section className="pb-32 bg-[#e6e2db] overflow-hidden px-6 md:px-12">
    <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer} className="max-w-6xl mx-auto">
      <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-8 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory">
        {CATEGORIES.map((item, idx) => (
           <div key={idx} className="snap-center sm:snap-start w-[80vw] sm:w-[280px] md:w-full flex-shrink-0">
             <CategoryCard item={item} onClick={() => openProject(item)} />
           </div>
        ))}
      </div>
    </motion.div>
  </section>
));

// PÁGINAS PRINCIPAIS
const HomePage = memo(({ openProject, openContact }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <HeroSection openContact={openContact} />
    <DescriptionSection />
    <GallerySection openProject={openProject} />
  </motion.div>
));

const CatalogPage = memo(({ openProject }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} className="pt-32 pb-24 bg-[#e6e2db] min-h-screen px-6 md:px-12">
    <div className="max-w-6xl mx-auto">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-5xl font-serif mb-6 text-[#2a241f]">
        Nosso Catálogo
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm md:text-base text-[#6b6255] font-light mb-16 max-w-2xl">
        Explore nossas soluções de armazenamento desenvolvidas para aliar funcionalidade máxima ao design elegante e atemporal.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {CATEGORIES.concat(CATEGORIES.slice(0,2)).map((item, idx) => (
          <motion.div key={idx} className="group cursor-pointer flex flex-col" onClick={() => openProject(item)}>
            <div className="overflow-hidden rounded-xl h-[400px] mb-5 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 1.15, filter: "blur(5px)" }} 
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img src={item.image} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-110" alt={item.title} />
              </motion.div>
            </div>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="text-[11px] tracking-widest uppercase font-semibold text-[#4a4238] group-hover:text-[#a89078] transition-colors border-t border-[#d5d0c7] pt-4"
            >
              {item.title.replace('\n', ' ')}
            </motion.h3>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
));

const ProjectsPage = memo(({ openProject }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} className="pt-32 pb-32 bg-[#2a241f] min-h-screen px-6 md:px-12 text-[#e6e2db]">
    <div className="max-w-5xl mx-auto">
      <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-5xl font-serif mb-6">
        Projetos Recentes
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-sm md:text-base text-white/60 font-light mb-20 max-w-2xl">
        Veja como transformamos ambientes através da marcenaria de alto padrão, combinando estética impecável e inteligência espacial.
      </motion.p>

      <div className="flex flex-col gap-24">
        {PROJECTS.map((proj, idx) => (
          <motion.div 
            key={idx} 
            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-10 md:gap-16 items-center group cursor-pointer`}
            onClick={() => openProject(proj)}
          >
            <div className="w-full md:w-2/3 h-[350px] md:h-[450px] overflow-hidden rounded-xl relative">
              <motion.div 
                initial={{ opacity: 0, scale: 1.15, filter: "blur(5px)" }} 
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                viewport={{ once: true, margin: "-100px" }} 
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-full h-full"
              >
                <img src={proj.img} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-[2.5s] group-hover:scale-105" alt={proj.title} />
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.8 }}
              className="w-full md:w-1/3 flex flex-col gap-5"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#a89078]">{proj.category}</span>
              <h2 className="text-2xl md:text-4xl font-serif leading-tight">{proj.title}</h2>
              <button className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest w-fit border-b border-white/30 pb-2 group-hover:border-white transition-colors mt-4 group-hover:text-amber-200">
                Explorar Projeto <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
));

const AboutPage = memo(() => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }} className="pt-32 pb-32 bg-[#e6e2db] min-h-screen px-6 md:px-12">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
      <motion.div 
        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
        className="w-full md:w-1/2"
      >
        <h1 className="text-3xl md:text-5xl font-serif mb-8 text-[#2a241f]">Nossa Essência</h1>
        <div className="w-16 h-[1px] bg-[#a89078] mb-8"></div>
        <p className="text-sm md:text-base text-[#6b6255] font-light mb-6 leading-relaxed">
          Na Mira Móveis, acreditamos que o mobiliário deve se adaptar à sua vida, e não o contrário. Há mais de 10 anos desenhamos e fabricamos soluções de marcenaria de alto padrão que transcendem o básico.
        </p>
        <p className="text-sm md:text-base text-[#6b6255] font-light leading-relaxed">
          Nossa fábrica utiliza tecnologia de ponta alemã aliada ao cuidado artesanal inestimável de nossa equipe. O resultado são armários, closets e sistemas de organização que resistem ao teste do tempo, tanto em durabilidade estrutural quanto em elegância estética.
        </p>
      </motion.div>
      <div className="w-full md:w-1/2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, scale: 1.15, filter: "blur(5px)" }}
          whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&fm=webp" loading="lazy" decoding="async" className="w-full h-full object-cover" alt="Nossa fábrica" />
        </motion.div>
      </div>
    </div>
  </motion.div>
));


// ==========================================
// 5. APLICAÇÃO PRINCIPAL (Controle de Rotas e Estado)
// ==========================================

export default function App() {
  // Estados Globais
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  // Controle de Progresso do Scroll Global (Barra no topo)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Otimização: Callbacks memoizados para evitar re-renderizações em cascata
  const handleOpenContact = useCallback(() => setIsContactOpen(true), []);
  const handleCloseContact = useCallback(() => setIsContactOpen(false), []);
  const handleOpenProject = useCallback((project) => setSelectedProject(project), []);
  const handleCloseProject = useCallback(() => setSelectedProject(null), []);

  // Força a página a rolar para o topo ao mudar de aba
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-[#e6e2db] font-sans selection:bg-[#a89078] selection:text-white">
      {/* Barra de progresso de scroll */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#a89078] origin-left z-[100]" style={{ scaleX }} />
      
      {/* Navegação Global */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} openContact={handleOpenContact} />
      
      {/* Container Principal de Rotas (Pseudo-Routing) */}
      <main>
        <AnimatePresence mode="wait">
          {currentPage === 'home' && <HomePage key="home" openProject={handleOpenProject} openContact={handleOpenContact} />}
          {currentPage === 'catalog' && <CatalogPage key="catalog" openProject={handleOpenProject} />}
          {currentPage === 'projects' && <ProjectsPage key="projects" openProject={handleOpenProject} />}
          {currentPage === 'about' && <AboutPage key="about" />}
        </AnimatePresence>
      </main>

      {/* Rodapé Global */}
      <Footer openContact={handleOpenContact} />

      {/* MODAIS (Renderizados de forma condicional para otimização) */}
      
      {/* Modal de Detalhes de Projetos / Catálogo */}
      <Modal isOpen={!!selectedProject} onClose={handleCloseProject}>
        {selectedProject && (
          <div className="flex flex-col md:flex-row bg-[#e6e2db]">
            <div className="w-full md:w-1/2 h-[300px] md:h-[500px]">
              <img src={selectedProject.image || selectedProject.img} loading="lazy" decoding="async" alt={selectedProject.title} className="w-full h-full object-cover" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#a89078] mb-2">
                {selectedProject.category || 'MIRA PLANEJADOS'}
              </span>
              <h2 className="text-3xl font-serif text-[#2a241f] mb-6 whitespace-pre-line">{selectedProject.title}</h2>
              <p className="text-[#6b6255] font-light text-sm md:text-base leading-relaxed mb-8">
                {selectedProject.description || 'Solução sob medida desenvolvida com excelência, tecnologia e foco absoluto nas necessidades de armazenamento e design do cliente.'}
              </p>
              <button 
                onClick={() => { handleCloseProject(); handleOpenContact(); }}
                className="bg-[#2a241f] text-white px-8 py-3 rounded-full text-xs uppercase tracking-widest w-fit hover:bg-[#a89078] transition-colors"
              >
                Orçar projeto similar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Formulário de Contato */}
      <Modal isOpen={isContactOpen} onClose={handleCloseContact}>
        <div className="p-8 md:p-16 flex flex-col items-center text-center bg-[#e6e2db]">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2a241f] mb-4">Iniciar meu Projeto</h2>
          <p className="text-[#6b6255] font-light mb-8 max-w-md text-sm md:text-base">
            Deixe seus dados e nossa equipe de arquitetos entrará em contato para agendar uma reunião sobre o seu ambiente.
          </p>
          <form className="w-full max-w-md flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
            <input type="text" placeholder="Nome Completo" className="w-full px-5 py-4 bg-white rounded-lg border-none focus:ring-2 focus:ring-[#a89078] outline-none text-sm text-[#4a4238]" />
            <input type="email" placeholder="E-mail" className="w-full px-5 py-4 bg-white rounded-lg border-none focus:ring-2 focus:ring-[#a89078] outline-none text-sm text-[#4a4238]" />
            <input type="tel" placeholder="Telefone / WhatsApp" className="w-full px-5 py-4 bg-white rounded-lg border-none focus:ring-2 focus:ring-[#a89078] outline-none text-sm text-[#4a4238]" />
            <button className="w-full mt-4 bg-[#a89078] text-white px-8 py-4 rounded-lg text-xs uppercase tracking-widest font-bold hover:bg-[#2a241f] transition-colors">
              Enviar Solicitação
            </button>
          </form>
        </div>
      </Modal>
    </div>
  );
}