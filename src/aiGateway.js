// ==============================================================
// AVNIET ARENA — MULTI-PROVIDER AI GATEWAY (WebMCP Router)
// Supports Google Gemini, Groq, OpenAI, OpenRouter, DeepSeek
// ==============================================================

const https = require('https');

function postJson(urlStr, headers, bodyObj, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(urlStr);
      const reqOpts = {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        timeout: timeoutMs
      };

      const req = https.request(reqOpts, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('AI Gateway request timed out'));
      });

      req.on('error', reject);
      req.write(JSON.stringify(bodyObj));
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

const PROVIDER_CONFIGS = {
  groq: {
    name: "Groq (Llama-3.3-70B)",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    format: "openai"
  },
  openai: {
    name: "OpenAI (GPT-4o-mini)",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    format: "openai"
  },
  openrouter: {
    name: "OpenRouter (Llama-3.3)",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct",
    format: "openai"
  },
  deepseek: {
    name: "DeepSeek (V3)",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    format: "openai"
  },
  gemini: {
    name: "Google Gemini 1.5 Flash",
    format: "gemini"
  }
};

function detectProvider(key, selectedProvider) {
  if (selectedProvider && PROVIDER_CONFIGS[selectedProvider] && selectedProvider !== 'auto') {
    return selectedProvider;
  }
  const cleanKey = (key || '').trim();
  if (cleanKey.startsWith('gsk_')) return 'groq';
  if (cleanKey.startsWith('sk-or-')) return 'openrouter';
  if (cleanKey.startsWith('AIza')) return 'gemini';
  if (cleanKey.startsWith('sk-')) {
    if (selectedProvider === 'deepseek') return 'deepseek';
    return 'openai';
  }
  return 'gemini';
}

const SYSTEM_PROMPT = `You are the AVNIET Autonomous Placement AI Controller Copilot.
You assist the examination controller and faculty in managing students, reviewing real-time assessment scores, analyzing branch benchmarks, inspecting anti-cheat proctoring logs, and creating placement exams.
You understand English, Telugu, and Tanglish fluently.
Be warm, professional, helpful, and concise.
When asked about a specific student, exam, or ranking, use your tools to query the live AVNIET database. If the user is just saying hello, asking greetings, or conversing in Telugu/English, converse naturally and warmly with them!`;

// OpenAI-Compatible Tool Schema
const OPENAI_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_student_report",
      description: "Fetch a candidate's complete assessment history, marks, department, and proctoring audit by hall ticket roll number.",
      parameters: {
        type: "object",
        properties: {
          roll: { type: "string", description: "The candidate hall ticket or roll number (e.g. 245U1A67A3)" }
        },
        required: ["roll"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_exam_analytics",
      description: "Fetch aggregate performance metrics, branch averages, highest scores, and malpractice counts across all assessments.",
      parameters: {
        type: "object",
        properties: {
          examId: { type: "string", description: "The examination ID (optional)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_top_performers",
      description: "Retrieve the top-ranked students across placement assessments sorted by merit score and accuracy.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "integer", description: "Number of top candidates to return (default 5)" }
        }
      }
    }
  }
];

// Gemini Tool Schema
const GEMINI_TOOLS = [
  {
    function_declarations: [
      {
        name: "get_student_report",
        description: "Fetch a candidate's complete assessment history, marks, department, and proctoring audit by hall ticket roll number.",
        parameters: {
          type: "OBJECT",
          properties: {
            roll: { type: "STRING", description: "The candidate hall ticket or roll number (e.g. 245U1A67A3)" }
          },
          required: ["roll"]
        }
      },
      {
        name: "get_exam_analytics",
        description: "Fetch aggregate performance metrics, branch averages, highest scores, and malpractice counts across all assessments.",
        parameters: {
          type: "OBJECT",
          properties: {
            examId: { type: "STRING", description: "The examination ID (optional)" }
          }
        }
      },
      {
        name: "get_top_performers",
        description: "Retrieve the top-ranked students across placement assessments sorted by merit score and accuracy.",
        parameters: {
          type: "OBJECT",
          properties: {
            limit: { type: "INTEGER", description: "Number of top candidates to return (default 5)" }
          }
        }
      }
    ]
  }
];

class AiGateway {
  static async query({ prompt, history = [], apiKey, provider = "auto", toolExecutors }) {
    const resolvedKey = (apiKey || '').trim();
    const resolvedProvider = detectProvider(resolvedKey, provider);
    const config = PROVIDER_CONFIGS[resolvedProvider] || PROVIDER_CONFIGS.gemini;

    if (!resolvedKey) {
      throw new Error("No API key provided. Please save an API key in Copilot Brain Settings.");
    }

    if (config.format === "openai") {
      return this.queryOpenAICompatible({
        prompt,
        history,
        apiKey: resolvedKey,
        config,
        toolExecutors
      });
    } else {
      return this.queryGemini({
        prompt,
        history,
        apiKey: resolvedKey,
        toolExecutors
      });
    }
  }

  // Generic OpenAI-compatible runner (Groq, OpenAI, OpenRouter, DeepSeek)
  static async queryOpenAICompatible({ prompt, history, apiKey, config, toolExecutors }) {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT }
    ];

    if (Array.isArray(history)) {
      history.forEach(h => {
        messages.push({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.text || h.content || ""
        });
      });
    }
    messages.push({ role: "user", content: prompt });

    const payload = {
      model: config.model,
      messages: messages,
      tools: OPENAI_TOOLS,
      tool_choice: "auto",
      temperature: 0.4
    };

    const res = await postJson(config.url, {
      "Authorization": `Bearer ${apiKey}`
    }, payload);

    if (res.status !== 200) {
      const errMsg = res.data?.error?.message || res.raw || `HTTP ${res.status}`;
      throw new Error(`${config.name} API error: ${errMsg}`);
    }

    const choice = res.data?.choices?.[0]?.message;
    if (!choice) throw new Error("Empty response received from AI model.");

    // Check if tool/function called
    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const tc = choice.tool_calls[0];
      const fnName = tc.function.name;
      let fnArgs = {};
      try { fnArgs = JSON.parse(tc.function.arguments); } catch(e) {}

      let toolResult = null;
      if (toolExecutors && typeof toolExecutors[fnName] === 'function') {
        toolResult = toolExecutors[fnName](fnArgs);
      }

      // Send tool response back to synthesize final answer
      messages.push(choice);
      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: JSON.stringify(toolResult || {})
      });

      const secondRes = await postJson(config.url, {
        "Authorization": `Bearer ${apiKey}`
      }, {
        model: config.model,
        messages: messages,
        temperature: 0.4
      });

      const finalContent = secondRes.data?.choices?.[0]?.message?.content || "Database tool executed successfully.";
      return {
        response: finalContent,
        provider: config.name,
        toolExecuted: fnName,
        toolData: toolResult
      };
    }

    return {
      response: choice.content || "Hello! How can I assist you with examinations or student performance?",
      provider: config.name
    };
  }

  // Google Gemini Runner
  static async queryGemini({ prompt, history, apiKey, toolExecutors }) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const contents = [
      { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\nFaculty Question: ${prompt}` }] }
    ];

    const payload = {
      contents: contents,
      tools: GEMINI_TOOLS
    };

    const res = await postJson(url, {}, payload);
    if (res.status !== 200) {
      const errMsg = res.data?.error?.message || res.raw || `HTTP ${res.status}`;
      throw new Error(`Google Gemini API error: ${errMsg}`);
    }

    const part = res.data?.candidates?.[0]?.content?.parts?.[0];
    if (!part) throw new Error("Empty response received from Gemini.");

    if (part.functionCall) {
      const fnName = part.functionCall.name;
      const fnArgs = part.functionCall.args || {};
      let toolResult = null;
      if (toolExecutors && typeof toolExecutors[fnName] === 'function') {
        toolResult = toolExecutors[fnName](fnArgs);
      }

      const followUp = {
        contents: [
          { role: "user", parts: [{ text: prompt }] },
          { role: "model", parts: [{ functionCall: part.functionCall }] },
          { role: "user", parts: [{ functionResponse: { name: fnName, response: { content: toolResult } } }] }
        ]
      };

      const secondRes = await postJson(url, {}, followUp);
      const text = secondRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "Tool executed successfully.";
      return {
        response: text,
        provider: "Google Gemini 1.5 Flash",
        toolExecuted: fnName,
        toolData: toolResult
      };
    }

    return {
      response: part.text || "Hello! How can I assist you today?",
      provider: "Google Gemini 1.5 Flash"
    };
  }

  // Universal Question Generation for AI Exam Creator
  static async generateQuestions({ type = "aptitude", difficulty = "Medium", count = 10, prompt = "", apiKey, provider = "auto" }) {
    const resolvedKey = (apiKey || '').trim();
    const resolvedProvider = detectProvider(resolvedKey, provider);
    const config = PROVIDER_CONFIGS[resolvedProvider] || PROVIDER_CONFIGS.gemini;

    const systemPrompt = `You are a Senior University Examination Architect for AVNIET Autonomous Engineering College.
Generate exactly ${count} multiple-choice questions (MCQs) for an institutional placement examination.

Assessment Category: ${type}
Difficulty: ${difficulty}
Curriculum Instructions: ${prompt || "Comprehensive curriculum examination"}

CRITICAL JSON SCHEMA:
Return ONLY a valid JSON array of objects with no conversational text:
[
  {
    "id": 1,
    "topic": "Topic Name",
    "section": "Quant/Reasoning/Tech/Verbal/Coding",
    "difficulty": "${difficulty}",
    "question": "Rigorous question text with all formulas or code snippets.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "solution": "Step-by-step mathematical proof or technical explanation.",
    "marks": 1.0
  }
]`;

    function cleanAndParse(raw) {
      if (!raw) return null;
      let clean = raw.trim();
      if (clean.startsWith('```json')) clean = clean.slice(7);
      else if (clean.startsWith('```')) clean = clean.slice(3);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
      clean = clean.trim();
      return JSON.parse(clean);
    }

    if (config.format === 'openai') {
      const res = await postJson(config.url, {
        "Authorization": `Bearer ${resolvedKey}`
      }, {
        model: config.model,
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.3
      });
      if (res.status === 200) {
        const text = res.data?.choices?.[0]?.message?.content;
        const parsed = cleanAndParse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { questions: parsed.slice(0, count), engine: config.name };
        }
      }
      throw new Error(res.data?.error?.message || 'OpenAI provider question generation failed');
    } else {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${resolvedKey}`;
      const res = await postJson(url, {}, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 8192 }
      });
      if (res.status === 200) {
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = cleanAndParse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { questions: parsed.slice(0, count), engine: "Google Gemini 1.5 Flash" };
        }
      }
      throw new Error(res.data?.error?.message || 'Gemini question generation failed');
    }
  }
}

module.exports = {
  AiGateway,
  detectProvider,
  PROVIDER_CONFIGS
};
