
import { GoogleGenAI, Type } from "@google/genai";
import { EditorialDocument } from "../types";

const SYSTEM_INSTRUCTION_BASE = `Você é uma IA proprietária de uma agência de Social Media de elite.
Seu trabalho é traduzir o input estratégico do usuário em um guia de produção visual e textual irrefutável.

REGRAS DE OURO DE PLANEJAMENTO:
1. CRONOGRAMA COMPLETO: Se o usuário não sugerir dias específicos, você DEVE gerar um cronograma para TODOS os 7 dias da semana (Segunda a Domingo).
2. IMERSÃO COMO BÔNUS: O bloco de "Imersão" NÃO é um dia do cronograma. Ele é um material de apoio, um "asset" extra no rodapé para que o cliente use como material rico ou série especial.
3. FIDELIDADE AO TEXTO: O texto que vai no card DEVE ser extraído diretamente das ideias enviadas pelo usuário.
4. FORMATO REELS/VÍDEO: Para todo post de vídeo, você DEVE gerar um "reelsScript" técnico (Hook, Cenas, CTA).
5. CARROSSÉIS: Detalhe cada slide com descrição visual, imagem e texto exato.
6. LINGUAGEM "ELITE ACTIONABLE": Use comandos diretos de direção de arte e fotografia.

ESTRUTURA DE STORIES:
- Todo dia precisa de 3 a 5 passos de stories que criem antecipação ou reforcem a mensagem do feed.`;

export const structureContent = async (rawText: string, referenceContext?: string): Promise<EditorialDocument> => {
  // Always create a new GoogleGenAI instance right before making an API call to ensure up-to-date API key usage.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let instruction = SYSTEM_INSTRUCTION_BASE;
  
  if (referenceContext && referenceContext.trim()) {
    instruction += `\n\nBIBLIOTECA DE REFERÊNCIA (ESTILO E TOM):
    ${referenceContext}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use the Pro model for complex reasoning and structured planning.
      contents: rawText,
      config: {
        systemInstruction: instruction,
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

    // Access the text property directly from the GenerateContentResponse object.
    const text = response.text;
    if (!text) throw new Error("A IA retornou um conteúdo vazio.");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Erro detalhado no GeminiService:", error);
    throw error;
  }
};
