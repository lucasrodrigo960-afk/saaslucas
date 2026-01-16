
import React from 'react';
import { EditorialDocument } from '../types';

interface DocumentPreviewProps {
  doc: EditorialDocument;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ doc }) => {
  return (
    <div id="editorial-doc" className="bg-white p-10 md:p-20 shadow-2xl min-h-screen max-w-5xl mx-auto border border-gray-100">
      {/* 1. CAPA EDITORIAL */}
      <header className="mb-24 page-break-avoid">
        <h1 className="serif text-5xl md:text-7xl font-bold tracking-tight mb-4 uppercase text-black leading-tight">
          {doc.title}
        </h1>
        <p className="text-xl text-gray-500 font-light mb-12 tracking-wide uppercase italic">
          {doc.subtitle}
        </p>
        <div className="h-px w-24 bg-black mb-6"></div>
        <p className="text-sm tracking-[0.2em] font-medium text-gray-800 uppercase">
          {doc.positionPhrase}
        </p>
      </header>

      {/* 2. VISÃO GERAL DA SEMANA */}
      <section className="mb-24 page-break-avoid">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-8 flex items-center gap-4">
          Arquitetura Estratégica <span className="h-px flex-1 bg-gray-100"></span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 border-l-2 border-black">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Atmosfera</span>
            <p className="text-base text-gray-800 font-medium leading-relaxed">{doc.architecture.feeling}</p>
          </div>
          <div className="bg-gray-50 p-8 border-l-2 border-black">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Foco de Dor</span>
            <p className="text-base text-gray-800 font-medium leading-relaxed">{doc.architecture.pain}</p>
          </div>
          <div className="bg-gray-50 p-8 border-l-2 border-black">
            <span className="text-[9px] uppercase tracking-widest text-gray-400 block mb-2 font-bold">Autoridade</span>
            <p className="text-base text-gray-800 font-medium leading-relaxed">{doc.architecture.authority}</p>
          </div>
        </div>
      </section>

      {/* 3. ORGANIZAÇÃO POR DIA (CALENDÁRIO OBRIGATÓRIO) */}
      <section className="space-y-32 mb-32">
        <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-0 flex items-center gap-4">
          Calendário de Execução <span className="h-px flex-1 bg-gray-100"></span>
        </h2>
        {doc.days.map((dayPlan, idx) => (
          <div key={idx} className="border-t border-gray-100 pt-16 page-break-avoid overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-12 gap-4">
              <h3 className="serif text-5xl font-bold uppercase tracking-tighter">
                ▪ {dayPlan.day}
              </h3>
              <div className="flex gap-4 items-center">
                <span className="px-4 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                  {dayPlan.format}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-4 space-y-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tema & Estratégia</p>
                    <p className="text-sm font-medium leading-relaxed">{dayPlan.strategicIntent}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Conversão</p>
                    <p className="text-sm font-bold text-gray-900">{dayPlan.approachStrategy}</p>
                  </div>
                </div>

                <div className="bg-black text-white p-8 rounded-sm shadow-xl">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-6 text-gray-500 border-b border-white/10 pb-2">
                    Ecossistema Stories
                  </p>
                  <ul className="space-y-6">
                    {dayPlan.storySuggestions.map((story, sIdx) => (
                      <li key={sIdx} className="text-[11px] leading-relaxed relative pl-4 border-l border-white/20">
                        {story}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-8 space-y-12">
                {dayPlan.reelsScript ? (
                  <div className="space-y-8">
                    <div className="bg-gray-900 text-white p-8 border-b-4 border-blue-500 page-break-avoid shadow-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-4">Master Video Script</p>
                      <div className="mb-6">
                        <p className="text-[9px] uppercase font-bold text-gray-500 mb-1">Hook (0-3 segundos)</p>
                        <p className="text-xl font-bold italic tracking-tight leading-tight">"{dayPlan.reelsScript.hook}"</p>
                      </div>
                      
                      <div className="space-y-4 border-t border-gray-800 pt-6">
                        {dayPlan.reelsScript.scenes.map((scene) => (
                          <div key={scene.sceneNumber} className="grid grid-cols-12 gap-4 border-b border-gray-800 pb-4 last:border-0">
                            <div className="col-span-1 text-[9px] font-bold text-gray-600">#{scene.sceneNumber}</div>
                            <div className="col-span-5">
                              <p className="text-[8px] uppercase text-gray-500 mb-1 font-bold">Visual / Ação</p>
                              <p className="text-[11px] leading-relaxed text-gray-300">{scene.visualAction}</p>
                            </div>
                            <div className="col-span-6">
                              <p className="text-[8px] uppercase text-gray-500 mb-1 font-bold">Áudio / Fala</p>
                              <p className="text-[11px] leading-relaxed italic text-white font-medium">{scene.audioSpeech}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-8 pt-4 border-t border-gray-800">
                        <p className="text-[9px] uppercase font-bold text-gray-500 mb-1">CTA Final</p>
                        <p className="text-sm font-bold tracking-widest">{dayPlan.reelsScript.cta}</p>
                      </div>
                    </div>
                  </div>
                ) : dayPlan.carouselSlides && dayPlan.carouselSlides.length > 0 ? (
                  <div className="space-y-8">
                    {dayPlan.carouselSlides.map((slide) => (
                      <div key={slide.slideNumber} className="bg-gray-50 border border-gray-200 p-8 shadow-sm page-break-avoid">
                        <p className="text-xl font-bold serif text-black mb-6 italic">SLIDE 0{slide.slideNumber}</p>
                        <div className="grid grid-cols-2 gap-8 mb-6">
                          <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Visual</p>
                            <p className="text-[11px] leading-relaxed font-medium">{slide.visualDescription}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Ativo</p>
                            <p className="text-[11px] text-gray-600 italic">{slide.imageSuggestion}</p>
                          </div>
                        </div>
                        <div className="bg-black text-white p-10 text-center relative overflow-hidden">
                           <p className="text-lg font-bold uppercase tracking-tighter italic leading-tight">
                                {slide.textOnCard}
                            </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dayPlan.staticPostInfo ? (
                  <div className="bg-gray-50 border border-gray-200 p-8 shadow-sm page-break-avoid">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">POST ESTÁTICO</p>
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Layout</p>
                          <p className="text-[11px] font-bold">{dayPlan.staticPostInfo.visualComposition}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Imagem</p>
                          <p className="text-[11px] italic">{dayPlan.staticPostInfo.imageSuggestion}</p>
                        </div>
                    </div>
                    <div className="bg-black text-white p-16 text-center shadow-xl">
                        <p className="text-2xl font-bold uppercase tracking-tighter italic leading-tight">
                            {dayPlan.staticPostInfo.headlineOnCard}
                        </p>
                    </div>
                  </div>
                ) : null}

                <div className="page-break-avoid">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Copy da Legenda</p>
                  <div className="border border-gray-100 p-8 text-sm font-light leading-relaxed whitespace-pre-wrap bg-white shadow-inner italic">
                    {dayPlan.caption}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 4. RODAPÉ: IMERSÃO (MATERIAL BÔNUS) */}
      {doc.immersion && (
        <section className="mt-40 mb-32 bg-gray-50 p-12 border border-gray-200 page-break-avoid overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-bold uppercase px-4 py-1 tracking-[0.3em]">
            Asset Extra / Bônus
          </div>
          
          <div className="mb-16">
            <h2 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-4">ESTRATÉGIA DE IMERSÃO</h2>
            <h3 className="serif text-5xl font-bold mb-4 uppercase tracking-tighter">{doc.immersion.title}</h3>
            <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-6">{doc.immersion.concept}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {doc.immersion.steps.map((step, idx) => (
              <div key={idx} className="bg-white p-8 border border-gray-100 shadow-sm page-break-avoid flex flex-col justify-between h-full">
                <div className="space-y-4 mb-6">
                  <p className="text-[9px] font-bold uppercase text-gray-400">PASSO 0{idx + 1}</p>
                  <p className="text-xs font-bold text-gray-800 leading-tight">{step.visualStep}</p>
                  <p className="text-[9px] text-gray-500 italic uppercase tracking-wider">{step.objective}</p>
                </div>
                <div className="bg-gray-900 text-white p-6 text-center min-h-[100px] flex items-center justify-center">
                  <p className="text-[10px] leading-relaxed italic font-bold uppercase tracking-tighter">"{step.cardText}"</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-10 border-t border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Legenda Sugerida</p>
              <div className="text-sm font-light leading-relaxed whitespace-pre-wrap bg-white p-10 italic shadow-inner">
                {doc.immersion.caption}
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-6 border border-gray-100">
                  <p className="text-[9px] font-bold uppercase text-gray-400 mb-2">Capa do Reels</p>
                  <p className="text-xs font-medium italic">{doc.immersion.reelsCover}</p>
               </div>
               <div className="bg-black text-white p-6">
                  <p className="text-[9px] font-bold uppercase text-gray-500 mb-2">Estratégia de Abordagem</p>
                  <p className="text-xs font-bold">{doc.immersion.approachStrategy}</p>
               </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. FECHAMENTO */}
      <footer className="mt-40 pt-16 border-t-2 border-black page-break-avoid">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-8">Veredito Editorial</p>
        <div className="flex flex-col md:flex-row gap-12 items-baseline">
            <p className="serif text-3xl leading-relaxed flex-1 text-gray-900 italic font-medium">
            "{doc.observation}"
            </p>
            <div className="text-[8px] font-bold uppercase tracking-[0.5em] text-gray-300">
                PROPRIETARY ARCHITECTURE V10.0
            </div>
        </div>
      </footer>
    </div>
  );
};

export default DocumentPreview;
