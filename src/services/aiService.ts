import { GoogleGenAI, Type, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function classifyProblem(content: string | Part[], existingProblems: string[] = []) {
  let prompt = "Extract all potential problem data from the following NGO report/input. ";
  prompt += "Strictly return an array of JSON objects, each with: title (1-2 lines), location (city in Maharashtra), level (High, Mid, or Low), severity (a number from 1-10, where 10 is most severe), and a 'field' that represents the specific sector (e.g., Sanitation, Environment, Education, Infrastructure, Healthcare, Agriculture, Women's Safety, Animal Welfare, etc.). ";
  prompt += "Do NOT limit the 'field' to a few predefined categories; use the most descriptive specific sector based on the context. ";
  prompt += "High level if involves life/death or extreme urgency. Mid if serious but not immediate threat. Low for minor community improvements. ";
  prompt += "Severity should represent the intensity within that level (e.g., a High level problem with massive casualties is a 10, whereas a basic urgent clinic need might be a 7). ";
  prompt += "Default to 'Social Welfare' if the sector is broad or ambiguous. ";
  
  if (existingProblems.length > 0) {
    prompt += `IMPORTANT: Do NOT include problems that are already logged. Existing logged problems are: ${existingProblems.join(", ")}. Only extract NEW problems mentioned in the document. `;
  }

  const textPart: Part = { text: prompt };
  
  let contents: Part[];
  if (typeof content === 'string') {
    contents = [textPart, { text: content }];
  } else {
    contents = [textPart, ...content];
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            level: { type: Type.STRING },
            severity: { type: Type.NUMBER },
            field: { type: Type.STRING }
          },
          required: ["title", "location", "level", "severity", "field"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function synthesizeProblems(sources: (string | Part[])[], existingProblems: string[] = []) {
  let prompt = "You are an NGO data analyst. I am giving you multiple reports (text or images) from different sources. ";
  prompt += "Your task is to SYNTHESIZE these reports into a unified list of unique problems. ";
  prompt += "If multiple sources describe the same issue in the same locality, MERGE them into a single entry. ";
  prompt += "Strictly return an array of JSON objects, each with: title (specific), location (city/district), level (High, Mid, or Low), severity (1-10), and field (Specific sector like Sanitation, Education, etc.). ";
  
  if (existingProblems.length > 0) {
    prompt += `IMPORTANT: Cross-reference with our existing registry. If a problem already exists there, EXCLUDE it from the results. Existing registry: ${existingProblems.join(", ")}. `;
  }

  // We combine sources into a single interaction for the model to see everything at once
  const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
  
  sources.forEach((s, idx) => {
    contents.push({
      role: 'user',
      parts: typeof s === 'string' ? [{ text: `Source ${idx + 1}:\n${s}` }] : s 
    });
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            level: { type: Type.STRING },
            severity: { type: Type.NUMBER },
            field: { type: Type.STRING }
          },
          required: ["title", "location", "level", "severity", "field"]
        }
      }
    }
  });

  return JSON.parse(response.text || "[]");
}

export async function reanalyzeProblem(title: string, location: string) {
  const prompt = `Analyze the scale and urgency of this problem: "${title}" in "${location}". 
  Return a JSON object with: 
  'field' (specific sector like Sanitation, etc.),
  'severity' (a number 1-10 based on intensity/scale).
  'level' (High, Mid, or Low based on life-threat/urgency).`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING },
          severity: { type: Type.NUMBER },
          level: { type: Type.STRING }
        },
        required: ["field", "severity", "level"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
