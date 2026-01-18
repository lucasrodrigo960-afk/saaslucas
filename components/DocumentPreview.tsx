
import React from 'react';
import { EditorialDocument, LayoutSettings } from '../types';

interface DocumentPreviewProps {
  doc: EditorialDocument;
  settings: LayoutSettings;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc, settings }) => {
  const accentStyle = { color: settings.accentColor };
  const accentBgStyle = { backgroundColor: settings.accentColor };
  const accentBorderStyle = { borderColor: settings.accentColor };
  
  const isDark = settings.backgroundColor === '#0a0a0a';
  const textColor = isDark ? 'text-white' : 'text-black';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100';

  const densityClasses = {
    compact: 'py-8 space-y-16',
    elegant: 'py-16 space-y-24',
    spacious: 'py-24 space-y-40'
  };

  const familyClasses = {
    playfair: 'serif',
    syne: 'syne',
    inter: 'font-sans',
    montserrat: 'montserrat'
  };

  const styleSettings = {
    classic: {
      heading: `${familyClasses[settings.fontFamily]} font-bold uppercase tracking-tight`,
      border: `border-l-8 pl-12`,
      decoration: true,
      cardPadding: 'p-8'
    },
    modern: {
      heading: `syne font-black uppercase tracking-tighter scale-y-110`,
      border: `border-t-8 pt-12`,
      decoration: true,
      cardPadding: 'p-10'
    },
    minimal: {
      heading: `font-sans font-light uppercase tracking-[0.4em]`,
      border: `pl-6 border-l`,
      decoration: false,
      cardPadding: 'p-6'
    }
  };

  const currentStyle = styleSettings[settings.fontStyle];

  return (
    <div 
      id="editorial-doc" 
      className={`shadow-2xl min-h-screen max-w-5xl mx-auto border transition-all duration-500 overflow-hidden ${densityClasses[settings.contentDensity]} ${textColor}`}
      style={{ 
        padding: '20mm', 
        backgroundColor: settings.backgroundColor,
        borderColor: isDark ? '#333' : '#eee'
      }}
    >
      {/* 1. CAPA DO PLANEJAMENTO */}
      {settings.showCover && (
        <header className={`mb-24 page-break-avoid ${currentStyle.border}`} style={accentBorderStyle}>
          <h1 className={`${currentStyle.heading} text-5xl md:text-7xl mb-4 leading-tight`}>
            {doc.title}
          </h1>
          <p className={`text-xl font-light mb-12 tracking-wide uppercase italic ${subTextColor}`}>
            {doc.subtitle}
          </p>
          {currentStyle.decoration && <div className="h-px w-24 mb-6" style={accentBgStyle}></div>}
          <p className={`text-sm tracking-[0.3em] font-black uppercase ${textColor}`}>
            {doc.positionPhrase}
          </p>
        </header>
      )}

      {/* 2. ARQUITETURA ESTRATÉGICA */}
      {settings.showArchitecture && (
        <section className="mb-24 page-break-avoid">
          <h2 className={`text-[10px] font-black tracking-[0.4em] uppercase mb-8 flex items-center gap-4 ${subTextColor}`}>
            ESTRATÉGIA BASE <span className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['Atmosfera', 'Foco de Dor', 'Autoridade'].map((key, i) => (
              <div key={i} className={`${cardBg} ${currentStyle.cardPadding} border`}>
                <span className={`text-[9px] uppercase tracking-widest block mb-3 font-black ${subTextColor}`}>{key}</span>
                <p className="text-base font-medium leading-relaxed">
                  {i === 0 ? doc.architecture.feeling : i === 1 ? doc.architecture.pain : doc.architecture.authority}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. CALENDÁRIO DIÁRIO */}
      {settings.showDays && (
        <section className="space-y-32 mb-32">
          <h2 className={`text-[10px] font-black tracking-[0.4em] uppercase mb-0 flex items-center gap-4 ${subTextColor}`}>
            PLANO DE EXECUÇÃO <span className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}></span>
          </h2>
          {doc.days.map((dayPlan, idx) => (
            <div key={idx} className={`border-t pt-16 page-break-avoid overflow-hidden ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
                <h3 className={`${currentStyle.heading} text-5xl font-black`}>
                  {dayPlan.day}
                </h3>
                <div className="flex gap-4 items-center">
                  <span className="px-5 py-2 text-white text-[10px] font-black uppercase tracking-[0.3em]" style={accentBgStyle}>
                    {dayPlan.format}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* LADO ESQUERDO: ESTRATÉGIA */}
                <div className="lg:col-span-4 space-y-10">
                  <div className="space-y-8">
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${subTextColor}`}>Tema Principal</p>
                      <p className="text-sm font-bold leading-relaxed">{dayPlan.theme}</p>
                    </div>
                    <div className={`${cardBg} p-6 border-l-4`} style={accentBorderStyle}>
                      <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${subTextColor}`}>Briefing Criativo</p>
                      <p className={`text-[11px] font-medium leading-relaxed ${subTextColor}`}>{dayPlan.creativeDirection}</p>
                    </div>
                  </div>

                  <div className={`${isDark ? 'bg-white text-black' : 'bg-black text-white'} p-8 shadow-2xl`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-6 border-b pb-2 ${isDark ? 'text-gray-400 border-black/10' : 'text-gray-500 border-white/10'}`}>
                      STORIES SUGERIDOS
                    </p>
                    <ul className="space-y-5">
                      {dayPlan.storySuggestions.map((story, sIdx) => (
                        <li key={sIdx} className={`text-[11px] leading-relaxed relative pl-4 border-l ${isDark ? 'border-black/20' : 'border-white/20'}`}>
                          {story}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* LADO DIREITO: DESIGN E CONTEÚDO */}
                <div className="lg:col-span-8 space-y-12">
                  
                  {dayPlan.reelsScript ? (
                    <div className={`bg-gray-950 text-white p-8 border-b-8 shadow-2xl`} style={accentBorderStyle}>
                      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={accentStyle}>REELS SCRIPT</p>
                        <span className="text-[9px] text-gray-600 font-mono">ID: {idx+1}</span>
                      </div>
                      
                      <div className="mb-10 bg-white/5 p-6 border-l-4" style={accentBorderStyle}>
                        <p className="text-[9px] uppercase font-black text-gray-500 mb-2 tracking-[0.2em]">GANCHO (0-3s)</p>
                        <p className={`${currentStyle.heading.includes('syne') ? 'syne' : 'serif'} text-2xl italic tracking-tighter`}>
                          "{dayPlan.reelsScript.hook}"
                        </p>
                      </div>
                      
                      <div className="space-y-12">
                        {dayPlan.reelsScript.scenes.map((scene) => (
                          <div key={scene.sceneNumber} className="relative pl-12 border-l border-gray-800">
                            <span className="absolute -left-3 top-0 text-[36px] font-black text-white/10 leading-none">
                              {scene.sceneNumber}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-4">
                                <p className="text-[8px] uppercase text-gray-500 font-black">AÇÃO VISUAL</p>
                                <p className="text-[12px] leading-relaxed text-gray-200">{scene.visualAction}</p>
                              </div>
                              <div className="space-y-4">
                                <p className="text-[8px] uppercase text-gray-500 font-black">LOCUÇÃO</p>
                                <p className="text-[12px] leading-relaxed italic text-white font-semibold bg-gray-900 p-4 border border-gray-800">
                                  {scene.audioSpeech}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-12 pt-8 border-t border-gray-800">
                         <p className="text-xl font-black uppercase tracking-tighter" style={accentStyle}>{dayPlan.reelsScript.cta}</p>
                      </div>
                    </div>
                  ) : dayPlan.carouselSlides && dayPlan.carouselSlides.length > 0 ? (
                    <div className="space-y-10">
                      <div className="flex items-center gap-4 mb-6">
                        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${subTextColor}`}>TELA DO CARROSSEL</p>
                        <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}></div>
                      </div>
                      {dayPlan.carouselSlides.map((slide) => (
                        <div key={slide.slideNumber} className={`${cardBg} border shadow-sm hover:shadow-2xl transition-all page-break-avoid`}>
                          <div className="flex justify-between items-center p-5 bg-gray-950 text-white">
                            <span className="text-[10px] font-black">TELA 0{slide.slideNumber}</span>
                          </div>
                          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <p className={`text-[10px] uppercase font-black ${subTextColor}`}>DESIGNER BRIEF</p>
                              <p className="text-[13px] font-bold leading-relaxed">{slide.visualDescription}</p>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-white shadow-2xl min-h-[220px]" style={accentBgStyle}>
                                 <p className={`${currentStyle.heading} text-2xl italic leading-none z-10 drop-shadow-xl`}>
                                      {slide.textOnCard}
                                  </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dayPlan.staticPostInfo ? (
                    <div className={`${cardBg} border shadow-2xl page-break-avoid overflow-hidden border-t-8`} style={accentBorderStyle}>
                      <div className="p-10 grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div className="md:col-span-5 space-y-6">
                           <p className={`text-[10px] uppercase font-black ${subTextColor}`}>VISUAL CONCEPT</p>
                           <p className="text-[14px] font-black leading-snug">{dayPlan.staticPostInfo.visualComposition}</p>
                        </div>
                        <div className="md:col-span-7">
                          <div className="flex-1 p-20 flex flex-col items-center justify-center text-center shadow-2xl text-white relative min-h-[300px]" style={accentBgStyle}>
                              <p className={`${currentStyle.heading} text-4xl italic leading-none z-10 drop-shadow-2xl`}>
                                  {dayPlan.staticPostInfo.headlineOnCard}
                              </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* LEGENDA */}
                  <div className="page-break-avoid pt-12 border-t mt-12 border-gray-100">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-6 ${subTextColor}`}>LEGENDA FINAL</p>
                    <div className={`${cardBg} border p-10 text-[16px] font-light leading-relaxed whitespace-pre-wrap italic`}>
                      {dayPlan.caption}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 5. VEREDITO */}
      {settings.showFooter && (
        <footer className={`mt-40 pt-16 border-t-8 border-black page-break-avoid ${textColor}`}>
          <div className="flex flex-col md:flex-row gap-16 items-baseline">
              <p className={`${currentStyle.heading} text-4xl leading-snug flex-1 italic font-medium tracking-tight`}>
              "{doc.observation}"
              </p>
              <div className="flex flex-col items-end">
                  <div className={`text-[9px] font-black uppercase tracking-[0.8em] ${subTextColor} mb-3`}>
                      STUDIO OS V16
                  </div>
                  <div className={`w-32 h-2 ${isDark ? 'bg-white' : 'bg-black'}`}></div>
              </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default DocumentPreview;
