
import { GoogleGenAI, Type } from "@google/genai";
import { 
  NominationData,
  NominationResult,
  NominationAIResponse,
  ProjectEvaluationResult,
  OpportunityAnalysis
} from "../types";

const FLASH_MODEL = "gemini-3-flash-preview";

async function callGemini<T = string>(params: {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  json?: boolean;
  schema?: any;
  temperature?: number;
}): Promise<T> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = params.model || FLASH_MODEL;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: params.prompt,
      config: {
        systemInstruction: params.systemInstruction,
        responseMimeType: params.json ? "application/json" : "text/plain",
        responseSchema: params.schema,
        temperature: params.temperature ?? 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("The AI returned an empty response.");

    if (params.json) {
      return JSON.parse(text.replace(/```json|```/g, '').trim()) as T;
    }

    return text as unknown as T;
  } catch (error) {
    console.error(`Gemini Service Error:`, error);
    throw error;
  }
}

/**
 * وظيفة الذكاء الاصطناعي لاقتراح أيقونات ذات صلة بكل مستوى بناءً على المحتوى
 * تم إصلاح المخطط ليتوافق مع قيود Gemini API
 */
export const suggestIconsForLevels = async (levels: any[]): Promise<Record<number, string>> => {
  const levelsSummary = levels.map(l => `ID: ${l.id}, Title: ${l.title}, Description: ${l.description}`).join('\n');
  
  const prompt = `Based on the following levels in an entrepreneurship accelerator bootcamp, suggest exactly one appropriate and modern emoji icon for each level ID. Ensure the icon reflects the strategic essence of the title and description.\n\n${levelsSummary}`;

  try {
    const res = await callGemini<{ iconMappings: { levelId: number, emoji: string }[] }>({
      prompt,
      systemInstruction: "You are a creative UI/UX iconographer. Return a JSON object containing an array of mappings between level IDs and relevant emojis.",
      json: true,
      schema: {
        type: Type.OBJECT,
        properties: {
          iconMappings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                levelId: { type: Type.NUMBER, description: "The ID of the level" },
                emoji: { type: Type.STRING, description: "The suggested emoji icon" }
              },
              required: ["levelId", "emoji"]
            }
          }
        },
        required: ["iconMappings"]
      }
    });

    const final: Record<number, string> = {};
    if (res.iconMappings && Array.isArray(res.iconMappings)) {
      res.iconMappings.forEach(mapping => {
        if (mapping.levelId) final[mapping.levelId] = mapping.emoji;
      });
    }
    return final;
  } catch (error) {
    console.warn("AI Icon suggestion failed, using defaults:", error);
    return {};
  }
};

/**
 * اكتشاف فرص التوسع والأسواق الجديدة
 */
export const discoverOpportunities = async (startupName: string, description: string, industry: string): Promise<OpportunityAnalysis> => {
  const prompt = `حلل مشروع: ${startupName} في قطاع ${industry}. 
  الوصف: ${description}.
  المطلوب: 
  1. حدد 3 أسواق جغرافية (دول أو مدن) ذات إمكانات عالية للتوسع.
  2. حدد شريحتين من العملاء غير مخدومين حالياً (Untapped Segments).
  3. اقترح فكرة "المحيط الأزرق" (Blue Ocean) للتميز.
  4. قدم إجراءً واحداً سريعاً للبدء (Quick Win).`;

  return callGemini<OpportunityAnalysis>({
    prompt,
    systemInstruction: `أنت "مستكشف الفرص" في مسرعة أعمال. مهمتك إيجاد مجالات نمو غير تقليدية.
    أجب بتنسيق JSON:
    {
      "newMarkets": [{"region": "string", "reasoning": "string", "entryBarrier": "Low|Medium|High", "potentialROI": "string"}],
      "untappedSegments": [{"segmentName": "string", "needs": "string", "strategy": "string"}],
      "blueOceanIdea": "string",
      "quickWinAction": "string"
    }`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        newMarkets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              region: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              entryBarrier: { type: Type.STRING },
              potentialROI: { type: Type.STRING }
            },
            required: ["region", "reasoning", "entryBarrier", "potentialROI"]
          }
        },
        untappedSegments: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              segmentName: { type: Type.STRING },
              needs: { type: Type.STRING },
              strategy: { type: Type.STRING }
            },
            required: ["segmentName", "needs", "strategy"]
          }
        },
        blueOceanIdea: { type: Type.STRING },
        quickWinAction: { type: Type.STRING }
      },
      required: ["newMarkets", "untappedSegments", "blueOceanIdea", "quickWinAction"]
    }
  });
};

/**
 * تقييم نموذج ترشيح الشركات
 */
export const evaluateNominationForm = async (data: NominationData): Promise<NominationAIResponse> => {
  const prompt = `حلل بيانات التقدم لمسرعة الأعمال التالية:
  - اسم المشروع: ${data.companyName}
  - المشكلة: ${data.problemStatement}
  - لماذا الآن: ${data.whyNow}
  - خطة التنفيذ: ${data.executionPlan}
  - العوائق: ${data.potentialObstacles}
  
  المطلوب: 
  1. تقييم جودة الإجابات النصية من 20 (تضاف لاحقاً للدرجة التقنية).
  2. تحديد "رايات حمراء" (Red Flags) إذا كان الكلام عاماً جداً، أو يفتقر للأرقام، أو إذا كان العائق المذكور يمنع النجاح.
  3. تقديم رأي موجز كخبير استثماري.`;

  return callGemini<NominationAIResponse>({
    prompt,
    systemInstruction: `أنت مقيّم محترف في مسرعة أعمال عالمية. قم بتحليل الطلب بدقة.
    يجب أن تعيد النتيجة بتنسيق JSON حصراً:
    {
      "aiScore": number (0-20),
      "redFlags": string[],
      "aiAnalysis": string,
      "categorySuggestion": "DIRECT_ADMISSION" | "INTERVIEW" | "PRE_INCUBATION" | "REJECTION"
    }`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        aiScore: { type: Type.NUMBER },
        redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
        aiAnalysis: { type: Type.STRING },
        categorySuggestion: { type: Type.STRING }
      },
      required: ["aiScore", "redFlags", "aiAnalysis", "categorySuggestion"]
    }
  });
};

export const createPathFinderChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: FLASH_MODEL,
    config: {
      systemInstruction: `أنت "مستشار المسار" الذكي في مسرعة بيزنس ديفلوبرز. 
      مهمتك هي إجراء مقابلة ريادية قصيرة (3-5 أسئلة) لتقييم عقلية المستخدم وجاهزيته.
      1. ابدأ بترحيب حماسي واسأل عن جوهر الفكرة.
      2. اطرح سؤالاً واحداً في كل مرة.
      3. ركز على: حل المشكلة، نموذج الربح، والشغف.
      4. عندما تنتهي، أرسل بلوك JSON بالقرار النهائي:
      { "decision": "APPROVED", "reason": "...", "feedback": "..." }`,
    }
  });
};

export const generateStartupIdea = async (data: { sector: string, interest: string }): Promise<string> => {
  return callGemini({
    prompt: `أنت محرك ابتكار ريادي. بناءً على قطاع ${data.sector} واهتمام المستخدم بـ ${data.interest}، ولد 3 أفكار لمشاريع ناشئة مبتكرة وغير تقليدية. المطلوب: لكل فكرة (اسم جذاب، المشكلة التي تحلها، الحل المقترح، الميزة التنافسية). الرد باللغة العربية بأسلوب احترافي.`,
    systemInstruction: "أنت خبير ابتكار ومصمم أفكار مشاريع ناشئة."
  });
};

export const evaluateProjectIdea = async (description: string, profile: any): Promise<ProjectEvaluationResult> => {
  return callGemini<ProjectEvaluationResult>({
    prompt: `قم بتقييم فكرة المشروع التالية بصرامة واحترافية: "${description}" في قطاع ${profile.sector}.
    حدد بوضوح نقاط القوة (Strengths) ونقاط الضعف أو المخاطر (Weaknesses/Risks).
    قيم من 20 في: Clarity, Value, Innovation, Market, Readiness.`,
    systemInstruction: "أنت مستشار استثماري خبير في تقييم الأفكار الريادية. كن صريحاً وذكياً في تحليلك.",
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        clarity: { type: Type.NUMBER },
        value: { type: Type.NUMBER },
        innovation: { type: Type.NUMBER },
        market: { type: Type.NUMBER },
        readiness: { type: Type.NUMBER },
        totalScore: { type: Type.NUMBER },
        aiOpinion: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        classification: { type: Type.STRING, enum: ['Green', 'Yellow', 'Red'] }
      },
      required: ["clarity", "value", "innovation", "market", "readiness", "totalScore", "aiOpinion", "strengths", "weaknesses", "classification"]
    }
  }).catch(() => ({
    clarity: 10, value: 10, innovation: 10, market: 10, readiness: 10,
    totalScore: 50, aiOpinion: "عذراً، فشل التحليل التلقائي.",
    strengths: ["الفكرة قابلة للتنفيذ مبدئياً"],
    weaknesses: ["نقص في التفاصيل الجوهرية للحل"],
    classification: 'Yellow'
  }));
};

export const generateAnalyticalQuestions = async (profile: any): Promise<any[]> => {
  return callGemini<any[]>({
    prompt: `أنتج 3 أسئلة تحليلية ذكية لتقييم رائد أعمال في قطاع ${profile.sector}.`,
    json: true,
    schema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.NUMBER },
          difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] }
        },
        required: ["text", "options", "correctIndex", "difficulty"]
      }
    }
  });
};

export const generateLevelMaterial = async (levelId: number, title: string, user: any): Promise<{ content: string; exercise: string }> => {
  return callGemini<{ content: string; exercise: string }>({
    prompt: `أنتج مادة تعليمية وتمرين تطبيقي للمستوى ${levelId}: ${title} لمشروع ${user.startupName}.`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        content: { type: Type.STRING },
        exercise: { type: Type.STRING }
      },
      required: ["content", "exercise"]
    }
  });
};

export const generateLevelQuiz = async (levelId: number, title: string, user: any): Promise<any[]> => {
  return callGemini<any[]>({
    prompt: `أنتج اختباراً من 3 أسئلة اختيار من متعدد للمستوى ${levelId}: ${title}.`,
    json: true,
    schema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          text: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["id", "text", "options", "correctIndex", "explanation"]
      }
    }
  });
};

export const evaluateExerciseResponse = async (prompt: string, answer: string): Promise<{ passed: boolean; feedback: string }> => {
  return callGemini<{ passed: boolean; feedback: string }>({
    prompt: `بصفتك مقيم مشاريع، قيّم هذه الإجابة على التمرين: ${prompt}. الإجابة: ${answer}.`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        passed: { type: Type.BOOLEAN },
        feedback: { type: Type.STRING }
      },
      required: ["passed", "feedback"]
    }
  });
};

export const runProjectAgents = async (name: string, description: string, agentIds: string[]): Promise<any> => {
  return callGemini({
    prompt: `حلل مشروع: ${name}. الوصف: ${description}. باستخدام الوكلاء: ${agentIds.join(', ')}.`,
    model: "gemini-3-pro-preview",
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        vision: { type: Type.STRING },
        market: { type: Type.STRING },
        users: { type: Type.STRING },
        hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["vision", "market", "users", "hypotheses"]
    }
  });
};

export const generatePitchDeck = async (name: string, description: string, results: any): Promise<{ title: string; content: string }[]> => {
  return callGemini<{ title: string; content: string }[]>({
    prompt: `حول نتائج مشروع ${name} إلى عرض تقديمي (Pitch Deck) احترافي. النتائج: ${JSON.stringify(results)}`,
    model: "gemini-3-pro-preview",
    json: true,
    schema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    }
  });
};

export const analyzeExportOpportunity = async (formData: any): Promise<any> => {
  return callGemini({
    prompt: `حلل فرصة التصدير للمنتج: ${formData.productType} في السوق ${formData.targetMarket}.`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        decision: { type: Type.STRING, enum: ['EXPORT_NOW', 'WAIT', 'REJECT'] },
        analysis: {
          type: Type.OBJECT,
          properties: {
            demand: { type: Type.STRING },
            regulations: { type: Type.STRING },
            risks: { type: Type.STRING },
            seasonality: { type: Type.STRING }
          },
          required: ["demand", "regulations", "risks", "seasonality"]
        },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["decision", "analysis", "recommendations"]
    }
  });
};

export const simulateBrutalTruth = async (formData: any): Promise<any> => {
  return callGemini<any>({
    prompt: `قدم "الحقيقة القاسية" حول فشل تصدير ${formData.productType} إلى ${formData.targetMarket}.`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        brutalTruth: { type: Type.STRING },
        probability: { type: Type.NUMBER },
        financialLoss: { type: Type.STRING },
        operationalImpact: { type: Type.STRING },
        missingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        recoveryPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["brutalTruth", "probability", "financialLoss", "operationalImpact", "missingQuestions", "recoveryPlan"]
    }
  });
};

export const getGovInsights = async (): Promise<any> => {
  return callGemini<any>({
    prompt: `ولد إحصائيات ورؤى وطنية حول سوق التصدير بناءً على بيانات افتراضية واقعية للمنطقة العربية.`,
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        riskyMarkets: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              failRate: { type: Type.NUMBER }
            },
            required: ["name", "failRate"]
          }
        },
        readySectors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.NUMBER }
            },
            required: ["name", "score"]
          }
        },
        commonFailReasons: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              reason: { type: Type.STRING },
              percentage: { type: Type.NUMBER }
            },
            required: ["reason", "percentage"]
          }
        },
        regulatoryGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["riskyMarkets", "readySectors", "commonFailReasons", "regulatoryGaps"]
    }
  });
};

export const generateProjectDetails = async (data: any): Promise<string> => {
  return callGemini({
    prompt: `حلل تفاصيل المشروع بناءً على المعطيات: ${JSON.stringify(data)}. الرد بالعربية.`,
    systemInstruction: "أنت خبير في تطوير الأعمال والتحليل الاستراتيجي."
  });
};

export const generateProductSpecs = async (data: any): Promise<string> => {
  return callGemini({
    prompt: `حدد ميزات Core MVP ورحلة المستخدم التقنية لمشروع: ${data.projectName}. الوصف: ${data.description}. الرد بالعربية بأسلوب مهني تقني.`,
    systemInstruction: "أنت مهندس منتج وخبير في بناء المنتجات الأولية (MVP)."
  });
};

export const generateLeanBusinessPlan = async (data: any): Promise<string> => {
  return callGemini({
    prompt: `ابنِ خطة عمل استراتيجية مرنة لمشروع ${data.startupName} in قطاع ${data.industry}. 
    المشكلة: ${data.problem}
    الحل: ${data.solution}
    السوق المستهدف: ${data.targetMarket}
    تأكد من تغطية نموذج الربح، قنوات التوزيع، وتحليل التكاليف. الرد بالعربية.`,
    systemInstruction: "أنت مستشار استراتيجي متخصص في نماذج الأعمال المرنة."
  });
};

export const generatePitchDeckOutline = async (data: any): Promise<{ slides: { title: string; content: string }[] }> => {
  return callGemini<{ slides: { title: string; content: string }[] }>({
    prompt: `صغ هيكلاً لعرض تقديمي (Pitch Deck) لمشروع ${data.startupName}. 
    المشكلة: ${data.problem}
    الحل: ${data.solution}
    المطلوب 7 شرائح استراتيجية تغطي (المشكلة، الحل، السوق، المنتج، الفريق، النموذج المالي، الطلب الاستثماري). الرد بالعربية.`,
    systemInstruction: "أنت خبير في تصميم العروض التقديمية للمستثمرين وجذب التمويل. عد النتيجة بتنسيق JSON حصراً.",
    json: true,
    schema: {
      type: Type.OBJECT,
      properties: {
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      },
      required: ["slides"]
    }
  });
};

export const generateFounderCV = async (data: any): Promise<string> => {
  return callGemini({
    prompt: `صمم سيرة ذاتية احترافية ومقنعة لمؤسس شركة ناشئة:
    الاسم: ${data.name}
    الخبرة: ${data.experience}
    المهارات: ${data.skills}
    رؤية المشروع: ${data.vision}
    الهدف هو إبراز القدرات القيادية والتقنية والمواءمة الاستثمارية مع المشروع. الرد بالعربية.`,
    systemInstruction: "أنت خبير في كتابة السير الذاتية لرواد الأعمال والمؤسسين التنفيذيين."
  });
};
