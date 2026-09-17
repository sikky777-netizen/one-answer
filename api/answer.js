// Vercel Serverless Function: /api/answer
// OPENAI_API_KEY must be configured in Vercel Environment Variables.

const ALLOWED_ORIGINS = new Set([
  "https://answer.onentop.art",
  "https://sikky777-netizen.github.io"
]);

module.exports = async function handler(req, res) {
  const origin = req.headers.origin || "";

  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 지원합니다." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY가 설정되지 않았습니다." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const question = String(body.question || "").trim();
    const category = String(body.category || "전체").trim();

    if (!question) {
      return res.status(400).json({ error: "질문을 입력해주세요." });
    }

    if (question.length > 200) {
      return res.status(400).json({ error: "질문은 200자 이하로 입력해주세요." });
    }

    const instructions = `
너는 '한 장의 답'이라는 짧은 자기성찰 앱의 답변 작성자다.
사용자의 질문에 한국어로 답한다.

규칙:
- 답변은 1~2문장, 최대 70자 정도로 매우 짧게 쓴다.
- 간결하고 여운 있는 문장으로 쓴다.
- 단정적인 예언, 점괘, 미래 보장은 하지 않는다.
- 질문을 그대로 반복하지 않는다.
- 장황한 설명, 목록, 제목, 이모지, 따옴표는 쓰지 않는다.
- 법률·의료·투자·안전처럼 중요한 판단이면 랜덤한 확신을 주지 말고 확인·검토·전문가 조언이 필요하다는 방향으로 짧게 답한다.
- 사용자가 스스로 결정할 수 있도록 생각할 방향을 제시한다.
`;

    const apiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        reasoning: { effort: "none" },
        instructions,
        input: `카테고리: ${category}\n질문: ${question}`,
        max_output_tokens: 100
      })
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("OpenAI error:", data);
      return res.status(apiResponse.status).json({
        error: data?.error?.message || "AI 응답을 생성하지 못했습니다."
      });
    }

    let answer = "";
    for (const item of data.output || []) {
      for (const content of item.content || []) {
        if (content.type === "output_text" && content.text) {
          answer += content.text;
        }
      }
    }

    answer = answer.trim();

    if (!answer) {
      return res.status(502).json({ error: "AI 답변이 비어 있습니다." });
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "서버 처리 중 오류가 발생했습니다." });
  }
};
