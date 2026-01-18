
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorialDocument, LayoutSettings, DayPlan, SavedProject } from './types';
import { structureContent, AIWorkflowMode } from './services/geminiService';
import DocumentPreview from './components/DocumentPreview';

const html2pdf = (window as any).html2pdf;

type WorkflowStep = 'inicio' | 'entrada-ia' | 'entrada-texto' | 'studio';
type StudioTab = 'conteudo' | 'estilo';

const App: React.FC = () => {
  const [step, setStep] = useState<WorkflowStep>('inicio');
  const [studioTab, setStudioTab] = useState<StudioTab>('conteudo');
  const [input, setInput] = useState('');
  const [reference, setReference] = useState('');
  const [doc, setDoc] = useState<EditorialDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<SavedProject[]>([]);

  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({
    accentColor: '#000000',
    backgroundColor: '#ffffff',
    fontStyle: 'classic',
    fontFamily: 'playfair',
    showCover: true,
    showArchitecture: true,
    showDays: true,
    showImmersion: true,
    showFooter: true,
    contentDensity: 'elegant'
  });

  useEffect(() => {
    const saved = localStorage.getItem('editorial_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar histórico");
      }
    }
  }, []);

  const saveToHistory = (newDoc: EditorialDocument, settings: LayoutSettings) => {
    const newProject: SavedProject = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      doc: newDoc,
      settings: settings
    };
    const updatedHistory = [newProject, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('editorial_history', JSON.stringify(updatedHistory));
  };

  const loadFromHistory = (project: SavedProject) => {
    setDoc(project.doc);
    setLayoutSettings(project.settings);
    setStep('studio');
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(p => p.id !== id);
    setHistory(updated);
    localStorage.setItem('editorial_history', JSON.stringify(updated));
  };

  const handleGenerate = useCallback(async (mode: AIWorkflowMode) => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const structuredDoc = await structureContent(input, reference, mode);
      setDoc(structuredDoc);
      saveToHistory(structuredDoc, layoutSettings);
      setStep('studio');
    } catch (err: any) {
      setError(`Erro no processamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [input, reference, layoutSettings, history]);

  const updateLayout = (key: keyof LayoutSettings, value: any) => {
    setLayoutSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateDoc = (key: keyof EditorialDocument, value: any) => {
    if (!doc) return;
    setDoc(prev => prev ? ({ ...prev, [key]: value }) : null);
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
      element.classList.add('pdf-export-mode', 'pdf-mode-a2');
      await new Promise(resolve => setTimeout(resolve, 800));

      const opt = {
        margin: 0,
        filename: `${doc.title.toLowerCase().replace(/\s/g, '-')}-a2-elite.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          windowWidth: 1587,
          letterRendering: true 
        },
        jsPDF: { unit: 'mm', format: 'a2', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      setError('Erro ao exportar PDF.');
    } finally {
      element.classList.remove('pdf-export-mode', 'pdf-mode-a2');
      setExporting(false);
    }
  };

  const resetAll = () => {
    setDoc(null);
    setStep('inicio');
    setInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a]">
      <header className="no-print h-20 border-b border-gray-100 bg-white flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button onClick={resetAll} className="serif text-2xl font-black italic tracking-tight">Arquitetura Editorial</button>
          <span className="text-[9px] font-black text-gray-300 tracking-[0.4em] mt-1 uppercase">ESTÚDIO ELITE V16</span>
        </div>
        
        {doc && (
          <div className="flex items-center gap-6">
            <button 
              onClick={resetAll}
              className="text-[10px] font-black uppercase tracking-widest text-black border border-black/10 px-6 py-2.5 hover:bg-gray-50 transition-all"
            >
              NOVO PROJETO
            </button>
            <div className="w-px h-6 bg-gray-100" />
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded border border-gray-100">
               <span className="text-[9px] font-black uppercase text-gray-400">FORMATO:</span>
               <span className="text-[10px] font-black uppercase text-black">A2 PROFISSIONAL</span>
            </div>
            <button
              onClick={exportAsPDF}
              disabled={exporting}
              className="px-12 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-2xl disabled:bg-gray-400"
            >
              {exporting ? 'GERANDO PDF...' : 'EXPORTAR EM A2'}
            </button>
          </div>
        )}
      </header>

      <main className="flex h-[calc(100vh-5rem)]">
        <aside className="no-print w-full md:w-[500px] border-r border-gray-100 bg-white flex flex-col overflow-y-auto">
          {step === 'inicio' && (
            <div className="p-10 space-y-12 animate-in fade-in duration-500">
              <div className="space-y-4">
                <h2 className="serif text-4xl font-light italic">Seja bem-vindo.</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] leading-relaxed">Transforme estratégia bruta em design irrefutável.</p>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <button onClick={() => setStep('entrada-ia')} className="group p-10 border border-gray-100 text-left hover:border-black transition-all hover:shadow-2xl bg-gray-50/50">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 group-hover:text-black mb-6 block">FLUXO CRIATIVO</span>
                  <h3 className="serif text-2xl font-black italic mb-3">GERAR COM IA</h3>
                  <p className="text-xs font-light text-gray-500 leading-relaxed">A inteligência planeja os 7 dias para você com base no seu briefing.</p>
                </button>
                <button onClick={() => setStep('entrada-texto')} className="group p-10 border border-gray-100 text-left hover:border-black transition-all hover:shadow-2xl bg-gray-50/50">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300 group-hover:text-black mb-6 block">FLUXO TÉCNICO</span>
                  <h3 className="serif text-2xl font-black italic mb-3">FORMATAR MEU TEXTO</h3>
                  <p className="text-xs font-light text-gray-500 leading-relaxed">Já tem o conteúdo? Organizamos ele no layout de agência elite.</p>
                </button>
              </div>
            </div>
          )}

          {(step === 'entrada-ia' || step === 'entrada-texto') && (
            <div className="p-10 space-y-10 animate-in slide-in-from-left duration-500">
              <button onClick={() => setStep('inicio')} className="text-[10px] font-black uppercase text-gray-400 hover:text-black flex items-center gap-2 tracking-widest">← VOLTAR AO INÍCIO</button>
              <div className="space-y-6">
                <h2 className="serif text-4xl italic">{step === 'entrada-ia' ? 'Briefing IA' : 'Colar Planejamento'}</h2>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="..." className="w-full h-[350px] p-8 text-sm bg-gray-50 border border-gray-100 outline-none resize-none font-light leading-relaxed shadow-inner" />
                <button onClick={() => handleGenerate(step === 'entrada-ia' ? 'generative' : 'structural')} disabled={loading || !input.trim()} className="w-full py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl disabled:bg-gray-200 transition-all">
                  {loading ? 'ARQUITETANDO...' : 'GERAR PLANEJAMENTO'}
                </button>
              </div>
            </div>
          )}

          {step === 'studio' && doc && (
            <div className="flex flex-col h-full bg-white">
              <nav className="flex border-b border-gray-100 bg-gray-50">
                <button onClick={() => setStudioTab('conteudo')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] relative ${studioTab === 'conteudo' ? 'bg-white text-black' : 'text-gray-400'}`}>
                  1. TEXTOS E CÓPIAS
                </button>
                <button onClick={() => setStudioTab('estilo')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] relative ${studioTab === 'estilo' ? 'bg-white text-black' : 'text-gray-400'}`}>
                  2. DESIGN E ESTILO
                </button>
              </nav>

              <div className="p-8 flex-1 overflow-y-auto space-y-12">
                {studioTab === 'conteudo' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">TÍTULO PRINCIPAL</label>
                      <input type="text" value={doc.title} onChange={(e) => updateDoc('title', e.target.value)} className="w-full p-4 text-xs border bg-gray-50 font-black uppercase tracking-widest outline-none" />
                    </div>
                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">DIAS DA SEMANA</label>
                      {doc.days.map((day, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-sm overflow-hidden mb-2">
                          <button onClick={() => setEditingDayIdx(editingDayIdx === idx ? null : idx)} className={`w-full p-5 text-left text-[11px] font-black flex justify-between transition-all ${editingDayIdx === idx ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}>
                            <span>D0{idx+1} • {day.day}</span>
                            <span className="opacity-40">{editingDayIdx === idx ? '−' : '+'}</span>
                          </button>
                          {editingDayIdx === idx && (
                            <div className="p-6 bg-gray-50 space-y-6 animate-in slide-in-from-top duration-300">
                              <textarea value={day.caption} onChange={(e) => updateDay(idx, 'caption', e.target.value)} className="w-full h-48 p-4 text-xs border bg-white outline-none font-light leading-relaxed" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {studioTab === 'estilo' && (
                  <div className="space-y-12">
                    {/* ESTILO DE LAYOUT */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">CONCEITO VISUAL</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'classic', label: 'CLÁSSICO' },
                          { id: 'modern', label: 'MODERNO' },
                          { id: 'minimal', label: 'MINIMAL' }
                        ].map(st => (
                          <button 
                            key={st.id} 
                            onClick={() => updateLayout('fontStyle', st.id)}
                            className={`py-4 border text-[9px] font-black transition-all ${layoutSettings.fontStyle === st.id ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* FONTES */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">FAMÍLIA DE FONTES</label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'playfair', label: 'Playfair Display', class: 'serif' },
                          { id: 'syne', label: 'Syne (Bold)', class: 'syne' },
                          { id: 'inter', label: 'Inter (Sans)', class: 'font-sans' },
                          { id: 'montserrat', label: 'Montserrat', class: 'montserrat' }
                        ].map(f => (
                          <button 
                            key={f.id} 
                            onClick={() => updateLayout('fontFamily', f.id)}
                            className={`p-4 border text-left transition-all ${layoutSettings.fontFamily === f.id ? 'border-black bg-black text-white' : 'border-gray-100 bg-white text-gray-600'}`}
                          >
                            <span className={`${f.class} text-xs font-bold`}>{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* COR DE ACENTO */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">COR DE DESTAQUE</label>
                      <div className="flex flex-wrap gap-3">
                        {['#000000', '#D4AF37', '#7F1D1D', '#065F46', '#1E3A8A', '#4F46E5'].map(color => (
                          <button 
                            key={color} 
                            onClick={() => updateLayout('accentColor', color)}
                            className={`w-10 h-10 rounded-full border-2 transition-all ${layoutSettings.accentColor === color ? 'border-black scale-110 shadow-lg' : 'border-transparent opacity-60'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* COR DE FUNDO */}
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">COR DO PAPEL (FUNDO)</label>
                      <div className="flex flex-wrap gap-3">
                        {[
                          { id: '#ffffff', label: 'Branco' },
                          { id: '#fcf8f0', label: 'Vintage' },
                          { id: '#f2f2f2', label: 'Estúdio' },
                          { id: '#0a0a0a', label: 'Dark' }
                        ].map(bg => (
                          <button 
                            key={bg.id} 
                            onClick={() => updateLayout('backgroundColor', bg.id)}
                            className={`w-12 h-12 rounded border-2 transition-all flex items-center justify-center ${layoutSettings.backgroundColor === bg.id ? 'border-black' : 'border-gray-100'}`}
                            style={{ backgroundColor: bg.id }}
                          >
                            <span className={`text-[8px] font-black ${bg.id === '#0a0a0a' ? 'text-white' : 'text-black'}`}>{bg.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-gray-100/40 p-12 overflow-y-auto flex justify-center items-start">
          {doc ? (
            <div className="w-full max-w-5xl shadow-2xl">
              <DocumentPreview doc={doc} settings={layoutSettings} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-10">
              <h4 className="serif text-4xl italic">Agência de Elite</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.8em] mt-8">SELECIONE UM FLUXO PARA COMEÇAR</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
