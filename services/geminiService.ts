
import { GoogleGenAI, Type } from "@google/genai";
import { EditorialDocument } from "../types";

export type AIWorkflowMode = 'generative' | 'structural';

const SYSTEM_INSTRUCTION_GENERATIVE = `Você é um Estrategista de Social Media de Elite. 
Sua missão é pegar um input básico e EXPANDIR em uma estratégia completa de 7 dias. 
Crie ganchos (hooks) magnéticos, legendas persuasivas e direções criativas que o usuário talvez não tenha pensado. 
Mantenha o tom de autoridade e sofisticação.`;

const SYSTEM_INSTRUCTION_STRUCTURAL = `Você é um Arquiteto Editorial de Precisão. 
Sua missão é APENAS ORGANIZAR o texto bruto do usuário no formato de documento profissional. 
NÃO invente novos temas ou estratégias. Seja 100% fiel às informações fornecidas. 
Seu valor está na hierarquia, clareza e formatação do pensamento do usuário.`;

const COMMON_RULES = `
REGRAS DE OURO:
1. CRONOGRAMA: Gere sempre para os 7 dias da semana (Segunda a Domingo).
2. FIDELIDADE VISUAL: Use linguagem de direção de arte (fotografia, enquadramento).
3. ESTRUTURA: Siga rigorosamente o schema JSON fornecido.
4. STORIES: Todo dia deve ter um plano de 3-5 stories.`;

export const structureContent = async (
  rawText: string, 
  referenceContext?: string, 
  workflow: AIWorkflowMode = 'generative'
): Promise<EditorialDocument> => {
  // Initialize Gemini AI client with the provided API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const baseInstruction = workflow === 'generative' 
    ? SYSTEM_INSTRUCTION_GENERATIVE 
    : SYSTEM_INSTRUCTION_STRUCTURAL;

  let finalInstruction = `${baseInstruction}\n${COMMON_RULES}`;
  
  if (referenceContext && referenceContext.trim()) {
    finalInstruction += `\n\nBIBLIOTECA DE REFERÊNCIA (ESTILO E TOM):\n${referenceContext}`;
  }

  try {
    // Fix: Using gemini-3-pro-preview for complex reasoning tasks and removed thinkingBudget to use model defaults
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', 
      contents: rawText,
      config: {
        systemInstruction: finalInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            positionPhrase: { type: Type.STRING },
            architecture: {
              type: Type.OBJECT,
              properties: {
                feeling: { type: Type.STRING },
                pain: { type: Type.STRING },
                authority: { type: Type.STRING }
              },
              required: ["feeling", "pain", "authority"]
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  format: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  strategicIntent: { type: Type.STRING },
                  creativeDirection: { type: Type.STRING },
                  carouselSlides: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        slideNumber: { type: Type.INTEGER },
                        visualDescription: { type: Type.STRING },
                        imageSuggestion: { type: Type.STRING },
                        textOnCard: { type: Type.STRING }
                      },
                      required: ["slideNumber", "visualDescription", "imageSuggestion", "textOnCard"]
                    }
                  },
                  reelsScript: {
                    type: Type.OBJECT,
                    properties: {
                      hook: { type: Type.STRING },
                      scenes: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            sceneNumber: { type: Type.INTEGER },
                            visualAction: { type: Type.STRING },
                            audioSpeech: { type: Type.STRING }
                          },
                          required: ["sceneNumber", "visualAction", "audioSpeech"]
                        }
                      },
                      cta: { type: Type.STRING }
                    }
                  },
                  staticPostInfo: {
                    type: Type.OBJECT,
                    properties: {
                      visualComposition: { type: Type.STRING },
                      imageSuggestion: { type: Type.STRING },
                      headlineOnCard: { type: Type.STRING }
                    }
                  },
                  visualElements: {
                    type: Type.OBJECT,
                    properties: {
                      cards: { type: Type.STRING },
                      reels: { type: Type.STRING },
                      stories: { type: Type.STRING }
                    }
                  },
                  caption: { type: Type.STRING },
                  viewerPsychology: { type: Type.STRING },
                  approachStrategy: { type: Type.STRING },
                  storySuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  executionNotes: { type: Type.STRING }
                },
                required: ["day", "format", "theme", "strategicIntent", "creativeDirection", "caption", "viewerPsychology", "approachStrategy", "storySuggestions"]
              }
            },
            immersion: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                concept: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      visualStep: { type: Type.STRING },
                      imageRef: { type: Type.STRING },
                      cardText: { type: Type.STRING },
                      objective: { type: Type.STRING },
                      expectedResult: { type: Type.STRING }
                    },
                    required: ["visualStep", "imageRef", "cardText", "objective", "expectedResult"]
                  }
                },
                caption: { type: Type.STRING },
                reelsCover: { type: Type.STRING },
                approachStrategy: { type: Type.STRING }
              },
              required: ["title", "concept", "steps", "caption", "reelsCover", "approachStrategy"]
            },
            observation: { type: Type.STRING }
          },
          required: ["title", "subtitle", "positionPhrase", "architecture", "days", "observation"]
        }
      }
    });

    // Fix: Correctly access the .text property from the GenerateContentResponse object
    const text = response.text;
    if (!text) throw new Error("A IA retornou um conteúdo vazio.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Erro detalhado no GeminiService:", error);
    throw error;
  }
};
