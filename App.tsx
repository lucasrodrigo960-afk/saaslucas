
import React, { useState, useCallback, useRef } from 'react';
import { EditorialDocument } from './types';
import { structureContent } from './services/geminiService';
import DocumentPreview from './components/DocumentPreview';
import { toPng } from 'html-to-image';

// @ts-ignore
const html2pdf = window.html2pdf;

type PDFFormat = 'a0' | 'a2' | 'a3' | 'a4';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [reference, setReference] = useState('');
  const [showRef, setShowRef] = useState(false);
  const [doc, setDoc] = useState<EditorialDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<PDFFormat>('a4');
  const docRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const structuredDoc = await structureContent(input, reference);
      setDoc(structuredDoc);
    } catch (err: any) {
      console.error(err);
      setError('Erro na geração estratégica. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, [input, reference]);

  const exportAsPDF = async () => {
    const element = document.getElementById('editorial-doc');
    if (!element || !doc) return;
    
    setExporting(true);
    setError(null);
    
    const originalOverflow = document.body.style.overflow;
    
    try {
      // 1. ATIVAR MODO PDF COM FORMATO ESPECÍFICO
      const formatClass = `pdf-mode-${selectedFormat}`;
      element.classList.add('pdf-export-mode', formatClass);
      document.body.style.overflow = 'visible';
      
      // 2. TIMEOUT PARA REPAINT (Essencial para leitura das novas dimensões)
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mapeamento de larguras em pixels (96 DPI approx) para html2canvas
      const formatWidths: Record<PDFFormat, number> = {
        'a4': 794,
        'a3': 1122,
        'a2': 1587,
        'a0': 3178
      };

      const windowWidth = formatWidths[selectedFormat];

      const opt = {
        margin: 0,
        filename: `${doc.title.toLowerCase().replace(/\s/g, '-')}-${selectedFormat}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: selectedFormat === 'a0' ? 1.5 : 2, // A0 é massivo, escala 2 pode estourar memória em alguns browsers
          useCORS: true, 
          letterRendering: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: windowWidth,
        },
        jsPDF: { 
          unit: 'mm', 
          format: selectedFormat, 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // 3. EXECUTAR RENDERIZAÇÃO
      await html2pdf().set(opt).from(element).save();

    } catch (err: any) {
      console.error('Erro no processamento do PDF:', err);
      setError(`Erro ao materializar o arquivo em ${selectedFormat.toUpperCase()}.`);
    } finally {
      // 4. LIMPEZA
      element.classList.remove('pdf-export-mode', 'pdf-mode-a0', 'pdf-mode-a2', 'pdf-mode-a3', 'pdf-mode-a4');
      document.body.style.overflow = originalOverflow;
      setExporting(false);
    }
  };

  const exportAsImage = async () => {
    if (!docRef.current || !doc) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(docRef.current, { 
        pixelRatio: 2, 
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `${doc.title.toLowerCase().replace(/\s/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      setError('Erro na captura da imagem.');
    } finally {
      setExporting(false);
    }
  };

  const reset = () => {
    setDoc(null);
    setInput('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#fcfcfc]">
      <aside className={`no-print w-full md:w-[450px] border-r border-gray-200 p-8 flex flex-col sticky top-0 h-screen overflow-y-auto bg-white z-10 ${doc ? 'hidden lg:flex' : 'flex'}`}>
        <div className="mb-12">
          <h1 className="serif text-3xl font-bold italic mb-2 tracking-tight text-black">Editorial Architect</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.4em] font-bold">PRECISION PDF V9.0 — FULL ISO RANGE</p>
        </div>

        <div className="flex-1 flex flex-col space-y-8">
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => setShowRef(!showRef)}
              className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors flex items-center justify-between"
            >
              <span>{showRef ? '[-] Estilo Ativo' : '[+] Tom de Voz & Estética'}</span>
            </button>
            {showRef && (
              <textarea
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: Minimalismo, luxo, fontes serifadas..."
                className="w-full h-32 p-4 text-xs border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none font-light leading-relaxed"
              />
            )}
          </div>

          <div className="flex flex-col space-y-3 flex-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Input Estratégico Bruto</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Cole o seu roteiro ou as ideias soltas aqui..."
              className="flex-1 min-h-[350px] p-5 text-sm border border-gray-100 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none font-light leading-relaxed shadow-inner"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className={`w-full py-5 text-[11px] font-bold uppercase tracking-[0.4em] transition-all border ${
              loading 
              ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-wait' 
              : 'bg-black text-white border-black hover:bg-transparent hover:text-black shadow-2xl'
            }`}
          >
            {loading ? 'Arquitetando...' : 'Gerar Planejamento'}
          </button>

          {error && (
            <div className="p-4 bg-red-50 border-l-2 border-red-500">
              <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-100/50 relative p-6 md:p-12 flex justify-center">
        {doc ? (
          <div className="w-full max-w-5xl">
            <div className="no-print mb-10 flex flex-wrap items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-5 rounded-sm border border-gray-200 sticky top-0 z-20 shadow-xl">
              <button onClick={reset} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border border-gray-200 hover:border-black transition-all">
                Reiniciar
              </button>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-bold uppercase text-gray-400 tracking-widest">Formato PDF</span>
                  <select 
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as PDFFormat)}
                    className="bg-gray-50 border border-gray-200 text-[10px] font-bold py-1 px-3 focus:outline-none focus:ring-1 focus:ring-black uppercase tracking-widest cursor-pointer"
                  >
                    <option value="a4">A4 (Padrão)</option>
                    <option value="a3">A3 (Portfólio)</option>
                    <option value="a2">A2 (Expandido)</option>
                    <option value="a0">A0 (Canvas Gigante)</option>
                  </select>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                <button onClick={exportAsImage} disabled={exporting} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-white border border-gray-200 hover:bg-gray-50">
                  PNG
                </button>
                <button
                  onClick={exportAsPDF}
                  disabled={exporting}
                  className="px-8 py-2 text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-gray-800 transition-all shadow-xl disabled:bg-gray-400 min-w-[200px]"
                >
                  {exporting ? 'RENDERIZANDO...' : `EXPORTAR ${selectedFormat.toUpperCase()}`}
                </button>
              </div>
            </div>
            
            <div ref={docRef}>
              <DocumentPreview doc={doc} />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="max-w-lg space-y-8 p-12 bg-white border border-gray-100 shadow-2xl">
              <div className="w-20 h-1 bg-black mx-auto"></div>
              <h2 className="serif text-3xl italic font-light text-black tracking-tight leading-snug">
                Insira o input estratégico para materializar um documento de elite.
              </h2>
              <p className="text-xs uppercase tracking-widest text-gray-400">Agora com suporte para formatos A4, A3, A2 e A0.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
