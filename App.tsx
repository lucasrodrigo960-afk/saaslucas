
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EditorialDocument, LayoutSettings, DayPlan, SavedProject } from './types';
import { structureContent, AIWorkflowMode } from './services/geminiService';
import DocumentPreview from './components/DocumentPreview';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { logout } from './services/authService';

const html2pdf = (window as any).html2pdf;

type WorkflowStep = 'inicio' | 'entrada-ia' | 'entrada-texto' | 'studio';
type StudioTab = 'conteudo' | 'estilo';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(true); // Bypass temporário para desenvolvimento
  const [showDashboard, setShowDashboard] = useState(false);
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
    colorBackground: '#ffffff',
    colorText: '#1a1a1a',
    colorTitle: '#000000',
    colorCard: '#f9f9f9',
    colorCardText: '#1a1a1a',
    colorCardAccent: '#000000',
    fontStyle: 'classic',
    fontTitle: 'playfair',
    fontBody: 'inter',
    baseFontSize: 16,
    showCover: true,
    showArchitecture: true,
    showDays: true,
    showImmersion: true,
    showFooter: true,
    backgroundPattern: 'none',
    contentDensity: 'elegant',
    companyName: 'STUDIO OS',
    designerSignature: '',
    socialMediaSignature: '',
    watermarkOpacity: 0.1,
    watermarkGrayscale: true
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

  const handleLoginSuccess = () => {
    setAuthenticated(true);
    setShowDashboard(false);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setShowDashboard(false);
    setDoc(null);
    setStep('inicio');
  };

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
      element.classList.add('pdf-export-mode', 'pdf-mode-a3');
      await new Promise(resolve => setTimeout(resolve, 800));

      const opt = {
        margin: 0,
        filename: `${doc.title.toLowerCase().replace(/\s/g, '-')}-a3-elite.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowWidth: 1122, 
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a3', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      setError('Erro ao exportar PDF.');
    } finally {
      element.classList.remove('pdf-export-mode', 'pdf-mode-a3');
      setExporting(false);
    }
  };

  const resetAll = () => {
    setDoc(null);
    setStep('inicio');
    setInput('');
    setError(null);
  };

  const renderColorPicker = (label: string, key: keyof LayoutSettings) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</label>
        <span className="text-[9px] font-mono text-gray-300 uppercase">{layoutSettings[key] as string}</span>
      </div>
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={layoutSettings[key] as string} 
          onChange={(e) => updateLayout(key, e.target.value)}
          className="w-10 h-10 rounded-full border-none p-0 cursor-pointer overflow-hidden bg-transparent"
        />
        <div className="flex-1 h-px bg-gray-100" />
      </div>
    </div>
  );

  const renderFontSelector = (label: string, key: keyof LayoutSettings) => (
    <div className="space-y-4">
      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">{label}</label>
      <select 
        value={layoutSettings[key] as string} 
        onChange={(e) => updateLayout(key, e.target.value)}
        className="w-full p-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 outline-none"
      >
        <option value="playfair">Playfair Display (Serif)</option>
        <option value="syne">Syne (Modern)</option>
        <option value="inter">Inter (Sans)</option>
        <option value="montserrat">Montserrat</option>
        <option value="caveat">Caveat (Handwriting)</option>
        <option value="cormorant">Cormorant Garamond</option>
        <option value="jetbrains">JetBrains Mono</option>
      </select>
    </div>
  );

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
              <span className="text-[10px] font-black uppercase text-black">A3 ESTRATÉGICO</span>
            </div>
            <button
              onClick={exportAsPDF}
              disabled={exporting}
              className="px-12 py-3.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-800 transition-all shadow-2xl disabled:bg-gray-400"
            >
              {exporting ? 'GERANDO PDF...' : 'EXPORTAR EM A3'}
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
              
              {history.length > 0 && (
                <div className="space-y-5">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-300">PROJETOS RECENTES</h3>
                  <div className="space-y-3">
                    {history.map(project => (
                      <div 
                        key={project.id} 
                        onClick={() => loadFromHistory(project)}
                        className="p-5 border border-gray-100 bg-gray-50/50 hover:border-black cursor-pointer transition-all flex justify-between items-center group"
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest group-hover:underline">{project.doc.title}</p>
                          <p className="text-[8px] text-gray-400 uppercase font-bold">{new Date(project.timestamp).toLocaleString('pt-BR')}</p>
                        </div>
                        <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-all">ABRIR →</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  1. CONTEÚDO
                </button>
                <button onClick={() => setStudioTab('estilo')} className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] relative ${studioTab === 'estilo' ? 'bg-white text-black' : 'text-gray-400'}`}>
                  2. PERSONALIZAÇÃO
                </button>
              </nav>

              <div className="p-8 flex-1 overflow-y-auto space-y-12">
                {studioTab === 'conteudo' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">TÍTULO PRINCIPAL</label>
                      <input type="text" value={doc.title} onChange={(e) => updateDoc('title', e.target.value)} className="w-full p-4 text-xs border bg-gray-50 font-black uppercase tracking-widest outline-none" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">SUBTÍTULO / PROMESSA</label>
                      <input type="text" value={doc.subtitle} onChange={(e) => updateDoc('subtitle', e.target.value)} className="w-full p-4 text-xs border bg-gray-50 outline-none" />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">FRASE DE POSICIONAMENTO</label>
                      <input type="text" value={doc.positionPhrase} onChange={(e) => updateDoc('positionPhrase', e.target.value)} className="w-full p-4 text-xs border bg-gray-50 outline-none" />
                    </div>

                    <div className="p-6 bg-gray-50 space-y-6 border border-gray-100">
                       <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">ARQUITETURA ESTRATÉGICA</label>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-gray-400 uppercase">ATMOSFERA (FEELING)</label>
                             <input type="text" value={doc.architecture.feeling} onChange={(e) => updateDoc('architecture', { ...doc.architecture, feeling: e.target.value })} className="w-full p-3 text-[10px] border" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-gray-400 uppercase">FOCO DE DOR</label>
                             <input type="text" value={doc.architecture.pain} onChange={(e) => updateDoc('architecture', { ...doc.architecture, pain: e.target.value })} className="w-full p-3 text-[10px] border" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-gray-400 uppercase">AUTORIDADE</label>
                             <input type="text" value={doc.architecture.authority} onChange={(e) => updateDoc('architecture', { ...doc.architecture, authority: e.target.value })} className="w-full p-3 text-[10px] border" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-5">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">DIAS DA SEMANA</label>
                      {doc.days.map((day, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-sm overflow-hidden mb-2">
                          <button onClick={() => setEditingDayIdx(editingDayIdx === idx ? null : idx)} className={`w-full p-5 text-left text-[11px] font-black flex justify-between transition-all ${editingDayIdx === idx ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'}`}>
                            <span>D0{idx + 1} • {day.day}</span>
                            <span className="opacity-40">{editingDayIdx === idx ? '−' : '+'}</span>
                          </button>
                          {editingDayIdx === idx && (
                            <div className="p-6 bg-gray-50 space-y-6 animate-in slide-in-from-top duration-300">
                               <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                      <label className="text-[8px] font-black text-gray-400 uppercase">FORMATO</label>
                                      <input type="text" value={day.format} onChange={(e) => updateDay(idx, 'format', e.target.value)} className="w-full p-3 text-[10px] border" />
                                  </div>
                                  <div className="space-y-2">
                                      <label className="text-[8px] font-black text-gray-400 uppercase">TEMA</label>
                                      <input type="text" value={day.theme} onChange={(e) => updateDay(idx, 'theme', e.target.value)} className="w-full p-3 text-[10px] border" />
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[8px] font-black text-gray-400 uppercase">BRIEFING CRIATIVO</label>
                                  <textarea value={day.creativeDirection} onChange={(e) => updateDay(idx, 'creativeDirection', e.target.value)} className="w-full h-24 p-3 text-[10px] border" />
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[8px] font-black text-gray-400 uppercase">LEGENDA</label>
                                  <textarea value={day.caption} onChange={(e) => updateDay(idx, 'caption', e.target.value)} className="w-full h-48 p-4 text-xs border bg-white outline-none font-light leading-relaxed" />
                               </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">VEREDITO / OBSERVAÇÃO FINAL</label>
                      <textarea value={doc.observation} onChange={(e) => updateDoc('observation', e.target.value)} className="w-full h-32 p-4 text-xs border bg-gray-50 outline-none font-light leading-relaxed" />
                    </div>
                  </div>
                )}

                {studioTab === 'estilo' && (
                  <div className="space-y-12 pb-20">
                    <div className="p-8 border border-gray-100 bg-gray-50/50 space-y-8">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em]">IDENTIDADE E MARCA</h4>
                       <div className="space-y-6">
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">NOME DA EMPRESA (FOOTER)</label>
                            <input type="text" value={layoutSettings.companyName} onChange={e => updateLayout('companyName', e.target.value)} className="w-full p-4 text-[10px] border outline-none font-bold" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ASSINATURA DESIGNER</label>
                              <input type="text" value={layoutSettings.designerSignature} onChange={e => updateLayout('designerSignature', e.target.value)} className="w-full p-4 text-[10px] border outline-none" />
                            </div>
                            <div className="space-y-3">
                              <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">ASSINATURA S.M.</label>
                              <input type="text" value={layoutSettings.socialMediaSignature} onChange={e => updateLayout('socialMediaSignature', e.target.value)} className="w-full p-4 text-[10px] border outline-none" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">URL MARCA D'ÁGUA (IMAGEM)</label>
                            <input type="text" value={layoutSettings.watermarkImage} onChange={e => updateLayout('watermarkImage', e.target.value)} className="w-full p-4 text-[10px] border outline-none font-mono" placeholder="https://..." />
                          </div>
                       </div>
                    </div>

                     <div className="space-y-8">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">PALETA ESTRATÉGICA</label>
                        <div className="grid grid-cols-1 gap-8">
                           {renderColorPicker('Cor de Fundo (Papel)', 'colorBackground')}
                           {renderColorPicker('Cor do Texto Geral', 'colorText')}
                           {renderColorPicker('Cor dos Títulos (Destaque)', 'colorTitle')}
                           <div className="h-px bg-gray-100 my-4" />
                           {renderColorPicker('Fundo dos Cards', 'colorCard')}
                           {renderColorPicker('Texto dentro dos Cards', 'colorCardText')}
                           {renderColorPicker('Destaque dos Cards', 'colorCardAccent')}
                        </div>
                     </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">ESTILO DO CONJUNTO</label>
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

                    <div className="grid grid-cols-1 gap-8">
                       {renderFontSelector('Fonte dos Títulos', 'fontTitle')}
                       {renderFontSelector('Fonte do Corpo', 'fontBody')}
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">PADRÃO DE FUNDO</label>
                      <select 
                        value={layoutSettings.backgroundPattern} 
                        onChange={(e) => updateLayout('backgroundPattern', e.target.value)}
                        className="w-full p-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 bg-gray-50 outline-none"
                      >
                        <option value="none">SÓLIDO (SEM PADRÃO)</option>
                        <option value="morangos">DIAGONAIS SUTIS</option>
                        <option value="pontinhos">PONTINHOS MINIMALISTAS</option>
                        <option value="grid">GRID TÉCNICO</option>
                        <option value="ondas">ONDAS DINÂMICAS</option>
                      </select>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">DENSIDADE DO CONTEÚDO</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'compact', label: 'COMPACTO' },
                          { id: 'elegant', label: 'ELEGANTE' },
                          { id: 'spacious', label: 'ESPAÇADO' }
                        ].map(d => (
                          <button
                            key={d.id}
                            onClick={() => updateLayout('contentDensity', d.id)}
                            className={`py-4 border text-[9px] font-black transition-all ${layoutSettings.contentDensity === d.id ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">ESCALA DA FONTE</label>
                          <span className="text-[10px] font-black">{layoutSettings.baseFontSize}px</span>
                       </div>
                       <input 
                          type="range" min="12" max="24" step="1" 
                          value={layoutSettings.baseFontSize} 
                          onChange={e => updateLayout('baseFontSize', parseInt(e.target.value))}
                          className="w-full h-1 bg-gray-100 appearance-none outline-none cursor-pointer"
                       />
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
