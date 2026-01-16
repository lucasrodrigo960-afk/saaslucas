
import React, { useState, useCallback, useRef } from 'react';
import { EditorialDocument, LayoutSettings, DayPlan } from './types';
import { structureContent, AIWorkflowMode } from './services/geminiService';
import DocumentPreview from './components/DocumentPreview';

// @ts-ignore
const html2pdf = window.html2pdf;

type PDFFormat = 'a0' | 'a2' | 'a3' | 'a4';
type WorkflowStep = 'selection' | 'input-ai' | 'input-raw' | 'studio';
type StudioTab = 'content' | 'layout';

const App: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('selection');
  const [studioTab, setStudioTab] = useState<StudioTab>('content');
  const [input, setInput] = useState('');
  const [reference, setReference] = useState('');
  const [doc, setDoc] = useState<EditorialDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<PDFFormat>('a4');
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    accentColor: '#000000',
    fontStyle: 'classic',
    showCover: true,
    showArchitecture: true,
    showDays: true,
    showImmersion: true,
    showFooter: true,
    contentDensity: 'elegant'
  });

  const docRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async (mode: AIWorkflowMode) => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const structuredDoc = await structureContent(input, reference, mode);
      setDoc(structuredDoc);
      setStep('studio');
    } catch (err: any) {
      setError(`Erro no processamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [input, reference]);

  const updateLayout = (key: keyof LayoutSettings, value: any) => {
    setLayoutSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateDoc = (key: keyof EditorialDocument, value: any) => {
    if (!doc) return;
    setDoc(prev => prev ? ({ ...prev, [key]: value }) : null);
  };

  const updateArchitecture = (key: keyof EditorialDocument['architecture'], value: string) => {
    if (!doc) return;
    setDoc(prev => prev ? ({
      ...prev,
      architecture: { ...prev.architecture, [key]: value }
    }) : null);
  };

  const updateDay = (idx: number, key: keyof DayPlan, value: any) => {
    if (!doc) return;
    const newDays = [...doc.days];
    newDays[idx] = { ...newDays[idx], [key]: value };
    setDoc({ ...doc, days: newDays });
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('editorial-doc');
    if (!element || !doc) return;
    setExporting(true);
    try {
      const formatClass = `pdf-mode-${selectedFormat}`;
      element.classList.add('pdf-export-mode', formatClass);
      await new Promise(resolve => setTimeout(resolve, 600));
      const formatWidths: Record<PDFFormat, number> = { 'a4': 794, 'a3': 1122, 'a2': 1587, 'a0': 3178 };
      const opt = {
        margin: 0,
        filename: `${doc.title.toLowerCase().replace(/\s/g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: formatWidths[selectedFormat] },
        jsPDF: { unit: 'mm', format: selectedFormat, orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      setError('Erro ao exportar PDF.');
    } finally {
      element.classList.remove('pdf-export-mode', 'pdf-mode-a4', 'pdf-mode-a3', 'pdf-mode-a2', 'pdf-mode-a0');
      setExporting(false);
    }
  };

  const resetAll = () => {
    setDoc(null);
    setStep('selection');
    setInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a]">
      {/* HEADER GLOBAL */}
      <header className="no-print h-20 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={resetAll} className="serif text-2xl font-bold italic tracking-tight">Editorial Architect</button>
          <span className="text-[9px] font-bold text-gray-300 tracking-[0.3em] mt-1 uppercase">Studio v16.1</span>
        </div>
        
        {doc && (
          <div className="flex items-center gap-6">
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as PDFFormat)}
              className="bg-gray-50 border border-gray-200 text-[10px] font-bold py-2 px-4 uppercase tracking-widest cursor-pointer outline-none"
            >
              <option value="a4">PDF A4</option>
              <option value="a3">PDF A3</option>
              <option value="a2">PDF A2</option>
            </select>
            <button
              onClick={exportAsPDF}
              disabled={exporting}
              className="px-10 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400"
            >
              {exporting ? 'GERANDO PDF...' : 'EXPORTAR ARQUIVO'}
            </button>
          </div>
        )}
      </header>

      <main className="flex h-[calc(100vh-5rem)]">
        
        {/* LADO ESQUERDO: PAINEL DE CONTROLE DINÂMICO */}
        <aside className="no-print w-full md:w-[550px] border-r border-gray-100 bg-white flex flex-col overflow-y-auto z-40">
          
          {/* TELA DE SELEÇÃO INICIAL (DUAS SESSÕES DISTINTAS) */}
          {step === 'selection' && (
            <div className="p-12 space-y-12 animate-in fade-in zoom-in duration-500">
              <div className="space-y-4">
                <h2 className="serif text-4xl font-light italic">Selecione seu Ponto de Partida</h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed">Defina se quer inteligência de criação ou precisão de diagramação.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* SESSÃO 01: IA */}
                <button 
                  onClick={() => setStep('input-ai')}
                  className="group p-8 border border-gray-100 text-left hover:border-black transition-all hover:shadow-2xl bg-gray-50/50 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 group-hover:text-black">Sessão Estratégica</span>
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs">→</span>
                    </div>
                  </div>
                  <h3 className="serif text-2xl font-bold italic mb-3">GERADOR DE CONTEUDO PREMIUM</h3>
                  <p className="text-xs font-light text-gray-500 leading-relaxed">Input de briefing bruto para expansão criativa com nossa IA proprietária. Ideal para novos projetos.</p>
                </button>

                {/* SESSÃO 02: TEXTO BRUTO */}
                <button 
                  onClick={() => setStep('input-raw')}
                  className="group p-8 border border-gray-100 text-left hover:border-black transition-all hover:shadow-2xl bg-gray-50/50 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 group-hover:text-black">Sessão de Layout</span>
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs">→</span>
                    </div>
                  </div>
                  <h3 className="serif text-2xl font-bold italic mb-3">CONTEUDO PRONTO PARA LAYOUT</h3>
                  <p className="text-xs font-light text-gray-500 leading-relaxed">Já tem o texto final? Cole aqui para materializar no layout editorial automático de elite.</p>
                </button>
              </div>
            </div>
          )}

          {/* FLUXO 01: INPUT GERADOR IA */}
          {step === 'input-ai' && (
            <div className="p-12 space-y-10 animate-in slide-in-from-left duration-500">
              <button onClick={() => setStep('selection')} className="text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-colors flex items-center gap-2">
                <span>←</span> Voltar para Escolha
              </button>
              <div className="space-y-6">
                <div>
                  <h2 className="serif text-4xl italic mb-2">Gerador Premium</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Inteligência Estratégica Ativa</p>
                </div>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Descreva o que deseja vender, para quem e qual a sensação que quer passar..."
                  className="w-full h-[400px] p-6 text-sm bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none transition-all resize-none font-light leading-relaxed shadow-inner"
                />
                <button 
                  onClick={() => handleGenerate('generative')}
                  disabled={loading || !input.trim()}
                  className="w-full py-6 bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-gray-900 disabled:bg-gray-200 transition-all"
                >
                  {loading ? 'EXPANDINDO ARQUITETURA...' : 'GERAR CONTEÚDO AGORA'}
                </button>
              </div>
            </div>
          )}

          {/* FLUXO 02: INPUT LAYOUT BRUTO */}
          {step === 'input-raw' && (
            <div className="p-12 space-y-10 animate-in slide-in-from-left duration-500">
              <button onClick={() => setStep('selection')} className="text-[10px] font-bold uppercase text-gray-400 hover:text-black transition-colors flex items-center gap-2">
                <span>←</span> Voltar para Escolha
              </button>
              <div className="space-y-6">
                <div>
                  <h2 className="serif text-4xl italic mb-2">Preparar Layout</h2>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Fidelidade Estrutural Estrita</p>
                </div>
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Cole seu planejamento completo aqui. Manteremos cada palavra, formatando no padrão Agency OS."
                  className="w-full h-[400px] p-6 text-sm bg-gray-50 border border-gray-100 focus:bg-white focus:outline-none transition-all resize-none font-light leading-relaxed shadow-inner"
                />
                <button 
                  onClick={() => handleGenerate('structural')}
                  disabled={loading || !input.trim()}
                  className="w-full py-6 bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-gray-900 disabled:bg-gray-200 transition-all"
                >
                  {loading ? 'DIAGRAMANDO ESTRUTURA...' : 'APLICAR NO LAYOUT'}
                </button>
              </div>
            </div>
          )}

          {/* MODO STUDIO: PÓS-GERAÇÃO (EDIÇÃO DE CONTEÚDO + LAYOUT) */}
          {step === 'studio' && doc && (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-500 bg-white">
              <nav className="flex border-b border-gray-100 bg-gray-50 shadow-sm">
                <button 
                  onClick={() => setStudioTab('content')}
                  className={`flex-1 py-6 text-[10px] font-bold uppercase tracking-[0.2em] border-r border-gray-100 transition-all relative ${studioTab === 'content' ? 'bg-white text-black font-extrabold' : 'text-gray-400 hover:text-black'}`}
                >
                  1. Edição do Conteúdo
                  {studioTab === 'content' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
                <button 
                  onClick={() => setStudioTab('layout')}
                  className={`flex-1 py-6 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative ${studioTab === 'layout' ? 'bg-white text-black font-extrabold' : 'text-gray-400 hover:text-black'}`}
                >
                  2. Edição do Layout
                  {studioTab === 'layout' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
              </nav>

              <div className="p-10 flex-1 overflow-y-auto space-y-12">
                
                {/* STUDIO: ABA DE CONTEÚDO (MUDANÇA DE TEXTOS) */}
                {studioTab === 'content' && (
                  <div className="space-y-10 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Títulos de Capa</label>
                      <div className="space-y-4">
                        <input 
                          type="text" 
                          value={doc.title} 
                          onChange={(e) => updateDoc('title', e.target.value)} 
                          className="w-full p-4 text-xs border bg-gray-50 focus:bg-white font-bold uppercase tracking-widest outline-none transition-all" 
                          placeholder="Título Principal"
                        />
                        <textarea 
                          value={doc.subtitle} 
                          onChange={(e) => updateDoc('subtitle', e.target.value)} 
                          className="w-full h-24 p-4 text-xs border bg-gray-50 focus:bg-white outline-none transition-all" 
                          placeholder="Subtítulo Descritivo"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6 pt-10 border-t">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Estrutura Semanal</label>
                      <div className="space-y-3">
                        {doc.days.map((day, idx) => (
                          <div key={idx} className="border border-gray-100 group">
                            <button 
                              onClick={() => setEditingDayIdx(editingDayIdx === idx ? null : idx)}
                              className={`w-full p-4 text-left text-[11px] font-bold flex justify-between items-center transition-all ${editingDayIdx === idx ? 'bg-black text-white' : 'bg-white group-hover:bg-gray-50'}`}
                            >
                              <span className="flex items-center gap-3">
                                <span className="text-[9px] opacity-40 uppercase">D0{idx+1}</span>
                                {day.day}: {day.theme}
                              </span>
                              <span className="text-lg">{editingDayIdx === idx ? '−' : '+'}</span>
                            </button>
                            {editingDayIdx === idx && (
                              <div className="p-6 bg-gray-50 space-y-6 animate-in slide-in-from-top duration-300">
                                <div className="space-y-2">
                                  <label className="text-[9px] font-bold uppercase text-gray-400">Tema do Post</label>
                                  <input value={day.theme} onChange={(e) => updateDay(idx, 'theme', e.target.value)} className="w-full p-3 text-xs border bg-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] font-bold uppercase text-gray-400">Copy / Legenda</label>
                                  <textarea value={day.caption} onChange={(e) => updateDay(idx, 'caption', e.target.value)} className="w-full h-48 p-3 text-xs border bg-white font-mono outline-none" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-10 border-t">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-4 block">Veredito do Especialista</label>
                      <textarea
                        value={doc.observation}
                        onChange={(e) => updateDoc('observation', e.target.value)}
                        className="w-full h-40 p-5 text-xs border border-gray-100 bg-gray-50 italic outline-none focus:bg-white transition-all"
                        placeholder="Observações finais e notas de execução..."
                      />
                    </div>
                  </div>
                )}

                {/* STUDIO: ABA DE LAYOUT (DESIGN SYSTEM) */}
                {studioTab === 'layout' && (
                  <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Identidade Visual (Cor de Destaque)</label>
                      <div className="flex flex-wrap gap-4">
                        {['#000000', '#D4AF37', '#1E3A8A', '#7F1D1D', '#065F46', '#4C1D95'].map(color => (
                          <button 
                            key={color} 
                            onClick={() => updateLayout('accentColor', color)}
                            className={`w-14 h-14 rounded-full border-4 transition-all hover:scale-105 ${layoutSettings.accentColor === color ? 'border-black scale-110 shadow-2xl' : 'border-transparent opacity-80'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <div className="relative group">
                          <input type="color" value={layoutSettings.accentColor} onChange={(e) => updateLayout('accentColor', e.target.value)} className="w-14 h-14 p-0 border-0 bg-transparent cursor-pointer relative z-10" />
                          <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center pointer-events-none text-[8px] font-bold">CUSTOM</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Família Tipográfica</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['classic', 'modern', 'minimal'] as const).map(style => (
                          <button 
                            key={style}
                            onClick={() => updateLayout('fontStyle', style)}
                            className={`py-5 text-[9px] font-bold uppercase border tracking-widest transition-all ${layoutSettings.fontStyle === style ? 'bg-black text-white border-black shadow-lg' : 'border-gray-100 text-gray-400 hover:border-black'}`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Configuração de Seções</label>
                      <div className="space-y-4">
                        {[
                          { key: 'showCover', label: 'Capa Editorial' },
                          { key: 'showArchitecture', label: 'Resumo Estratégico' },
                          { key: 'showDays', label: 'Calendário Semanal' },
                          { key: 'showImmersion', label: 'Bloco de Imersão' },
                          { key: 'showFooter', label: 'Veredito Final' },
                        ].map(toggle => (
                          <div key={toggle.key} className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-sm">
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">{toggle.label}</span>
                            <button 
                              onClick={() => updateLayout(toggle.key as any, !layoutSettings[toggle.key as keyof LayoutSettings])}
                              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${layoutSettings[toggle.key as keyof LayoutSettings] ? 'bg-black' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${layoutSettings[toggle.key as keyof LayoutSettings] ? 'left-8' : 'left-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300">Densidade de Conteúdo</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['compact', 'elegant', 'spacious'] as const).map(density => (
                          <button 
                            key={density}
                            onClick={() => updateLayout('contentDensity', density)}
                            className={`py-5 text-[9px] font-bold uppercase border tracking-widest transition-all ${layoutSettings.contentDensity === density ? 'bg-black text-white border-black' : 'border-gray-100 text-gray-400 hover:border-black'}`}
                          >
                            {density}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="p-8 bg-red-50 border-t border-red-100 animate-pulse">
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-[0.2em] leading-relaxed">{error}</p>
            </div>
          )}
        </aside>

        {/* LADO DIREITO: PREVIEW EM TEMPO REAL (FOLHA DE PAPEL) */}
        <section className="flex-1 bg-gray-100/40 p-12 overflow-y-auto flex justify-center items-start shadow-inner">
          {doc ? (
            <div className="animate-in fade-in slide-in-from-bottom duration-700 w-full max-w-5xl shadow-2xl origin-top">
              <DocumentPreview doc={doc} settings={layoutSettings} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 pointer-events-none select-none">
              <div className="w-40 h-px bg-black mb-12"></div>
              <h4 className="serif text-3xl italic">Aguardando Arquitetura</h4>
              <p className="text-[10px] uppercase tracking-[0.6em] mt-6 font-bold">Nenhum Asset Disponível para Preview</p>
              <div className="w-40 h-px bg-black mt-12"></div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
