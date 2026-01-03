
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ApplicantProfile, 
  UserProfile, 
  ProjectEvaluationResult, 
  Question, 
  AnalyticalQuestion, 
  FailureSimulation, 
  GovStats 
} from "../types";

/**
 * Shared model constants based on task complexity.
 */
const FLASH_MODEL = "gemini-3-flash-preview";
const PRO_MODEL = "gemini-3-pro-preview";

/**
 * Core internal helper to interact with Gemini API.
 * Handles initialization, prompt execution, and structured data parsing.
 */
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
      try {
        // Clean markdown indicators if the model accidentally includes them despite responseMimeType
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleaned) as T;
      } catch (parseError) {
        console.error("JSON Parsing failed for AI output:", text);
        throw new Error("AI output was not valid JSON.");
      }
    }

    return text as unknown as T;
  } catch (error) {
    console.error(`Gemini Service Error [${model}]:`, error);
    throw error;
  }
}

/**
 * Specialized chat session creator for the Path Finder interview.
 */
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

// --- STARTUP TOOLS ---

export const generateStartupIdea = async (data: { sector: string, interest: string }): Promise<string> => {
  return callGemini({
    prompt: `أنت محرك ابتكار ريادي. بناءً على قطاع ${data.sector} واهتمام المستخدم بـ ${data.interest}، ولد 3 أفكار لمشاريع ناشئة مبتكرة وغير تقليدية. المطلوب: لكل فكرة (اسم جذاب، المشكلة التي تحلها، الحل المقترح، الميزة التنافسية). الرد باللغة العربية بأسلوب احترافي.`,
    systemInstruction: "أنت خبير ابتكار ومصمم أفكار مشاريع ناشئة."
  });
};

export const generateFounderCV = async (data: { name: string, experience: string, skills: string, vision: string }): Promise<string> => {
  return callGemini({
    prompt: `أنت خبير صياغة سير ذاتية للمؤسسين. قم بإنشاء بروفايل مهني جذاب للمؤسس ${data.name}. الخبرات: ${data.experience}. المهارات: ${data.skills}. رؤية المشروع: ${data.vision}. المطلوب: (نبذة احترافية، إبراز المهارات القيادية، ربط الخبرة برؤية المشروع). الرد باللغة العربية.`,
    systemInstruction: "أنت خبير توظيف تقني وكاتب سير ذاتية للمؤسسين."
  });
};

export const generateProjectDetails = async (data: { idea: string }): Promise<string> => {
  return callGemini({
    prompt: `حول الفكرة التالية إلى هيكل مشروع متكامل: "${data.idea}". المطلوب: (الرؤية، الرسالة، الأهداف الاستراتيجية، الهوية المقترحة، شرائح العملاء المستهدفة). الرد باللغة العربية.`,
    systemInstruction: "أنت مستشار تأسيس مشاريع خبير."
  });
};

export const generateProductSpecs = async (data: { projectName: string, description: string }): Promise<string> => {
  return callGemini({
    prompt: `صمم مواصفات المنتج الأولي (MVP) للمشروع: ${data.projectName}. الوصف: ${data.description}. المطلوب: (المزايا الأساسية، رحلة المستخدم، معايير النجاح التقنية). الرد باللغة العربية.`,
    systemInstruction: "أنت مدير منتج (Product Manager) خبير في بناء الـ MVP."
  });
};

export const generateLeanBusinessPlan = async (data: { startupName: string, industry: string, problem: string, solution: string, targetMarket: string }): Promise<string> => {
  return callGemini({
    prompt: `قم بتوليد خطة عمل مرنة لـ ${data.startupName}. المشكلة: ${data.problem}, الحل: ${data.solution}, السوق: ${data.targetMarket}. تشمل: القيمة المقترحة، تحليل السوق، مصادر الإيرادات، وهيكل التكاليف. الرد باللغة العربية.`,
    systemInstruction: "أنت مستشار أعمال متخصص في منهجية Lean Startup."
  });
};

export const generatePitchDeckOutline = async (data: { startupName: string, problem: string, solution: string }): Promise<{ slides: { title: string, content: string }[] }> => {
  return callGemini({
    prompt: `صغ هيكلاً لعرض تقديمي (Pitch Deck) لـ ${data.startupName}. 7 شرائح أساسية. المشكلة: ${data.problem}, الحل: ${data.solution}.`,
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

// --- EVALUATION & ASSESSMENT ---

export const evaluateProjectIdea = async (description: string, profile: ApplicantProfile): Promise<ProjectEvaluationResult> => {
  return callGemini<ProjectEvaluationResult>({
    prompt: `قم بتقييم فكرة المشروع التالية: "${description}" في قطاع ${profile.sector}. قيم من 20 في: Clarity, Value, Innovation, Market, Readiness.`,
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
        classification: { type: Type.STRING, enum: ['Green', 'Yellow', 'Red'] }
      },
      required: ["clarity", "value", "innovation", "market", "readiness", "totalScore", "aiOpinion", "classification"]
    }
  }).catch(() => ({
    clarity: 10, value: 10, innovation: 10, market: 10, readiness: 10,
    totalScore: 50, aiOpinion: "عذراً، فشل التحليل التلقائي.",
    classification: 'Yellow'
  }));
};

export const generateAnalyticalQuestions = async (profile: ApplicantProfile): Promise<AnalyticalQuestion[]> => {
  return callGemini<AnalyticalQuestion[]>({
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

// --- EDUCATION & ACCELERATOR LEVELS ---

export const generateLevelMaterial = async (levelId: number, title: string, user: UserProfile): Promise<{ content: string; exercise: string }> => {
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

export const generateLevelQuiz = async (levelId: number, title: string, user: UserProfile): Promise<Question[]> => {
  return callGemini<Question[]>({
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

// --- ADVANCED PRO FEATURES ---

export const runProjectAgents = async (name: string, description: string, agentIds: string[]): Promise<any> => {
  return callGemini({
    prompt: `حلل مشروع: ${name}. الوصف: ${description}. باستخدام الوكلاء: ${agentIds.join(', ')}.`,
    model: PRO_MODEL,
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
    model: PRO_MODEL,
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

// --- ANALYTICS & EXPORT ---

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

export const simulateBrutalTruth = async (formData: any): Promise<FailureSimulation> => {
  return callGemini<FailureSimulation>({
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

export const getGovInsights = async (): Promise<GovStats> => {
  return callGemini<GovStats>({
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
