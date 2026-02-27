import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { researchTopic } from "@/lib/search";
import {
  AGILE_ACADEMY_POSITIONING,
  EXISTING_CONTENT_TOPICS,
} from "@/lib/positioning";

const RESEARCH_SYSTEM_PROMPT = `You are a content strategist for Agile Academy. Your job is to identify content opportunities that are genuinely differentiated: topics where Agile Academy can say something that nobody else is saying, grounded in the firm's unique philosophy and expertise.

${AGILE_ACADEMY_POSITIONING}

You will receive:
1. A content area the team wants to explore
2. Web research results showing what's currently being published on this topic (or a note that web search is unavailable, in which case use your training knowledge)
3. The list of topics Agile Academy has already covered

YOUR TASK:
Analyze the content landscape and propose exactly 5 topic ideas. For each topic:

1. TITLE: A specific, compelling working title
2. ANGLE: What makes this distinctly "Agile Academy" - the unique angle that nobody else is writing about. This must connect to at least one of the firm's core positions (anti-outsourcing, mechanisms over intentions, enablement before empowerment, etc.)
3. GAP: What's wrong with existing content on this subject. What are others getting wrong, oversimplifying, or missing entirely?
4. KEY ARGUMENT: The one-sentence thesis the piece would defend
5. CONTENT TYPE: Whether this works best as a LinkedIn Post, Website Article, Whitepaper, Newspaper Article (German-language column for a general audience), or IMD Article (evidence-based piece for a global executive audience via IMD Business School), and why

RULES:
- Do NOT propose topics that are just restatements of what Agile Academy has already published.
- Do NOT propose generic topics like "Why Leadership Matters" or "The Future of AI."
- Every topic must have a clear "against" position: what does it argue against?
- Every topic must be grounded in mechanisms, not aspirations.
- Prefer topics where Agile Academy's real-world consulting experience gives them an edge that pure commentators don't have.
- Do not use em dashes in your writing.

Output the 5 proposals in a clean, numbered format.`;

const CREATE_SYSTEM_PROMPT = `You are a senior content writer for Agile Academy, a leadership consulting firm. You write thought leadership content that meets the highest editorial standards.

${AGILE_ACADEMY_POSITIONING}

YOUR WRITING PRINCIPLES (non-negotiable):

1. Mechanisms over Mindset: Every piece must explain HOW something works. No "Miracle Worship."
2. Transferability: Every principle must be actionable for a mid-level leader at a standard organization.
3. The Enablement Bridge: Never jump from "hire great people" to "give them autonomy." Always include the enablement step.
4. Binary Accountability: Tie everything to real outcomes, not proxy metrics.
5. Logical Completeness: Address the strongest counterargument to your thesis.
6. No Fluff: Every sentence must earn its place.
7. Evidence: Back claims with specifics. Named examples, data points, verifiable references.

THE IMD QUALITY GATE (every piece must pass all four):
1. RIGOROUS: Well-founded in research and/or practice? Not opinion dressed as insight.
2. RELEVANT: Addresses a real need or challenge for leaders and organizations right now?
3. INSIGHTFUL: Advances the conversation in an engaging, original way? Not restating the obvious.
4. ACTIONABLE: Can a reader do something concrete after reading? Not "think differently" but "do differently."

BAR RAISER CRITERIA (your draft will be judged against these; internalize them):

Your draft will be reviewed by a ruthless "Bar Raiser" editor. To score above 8/10, you must satisfy ALL of the following:

1. The "LinkedIn vs. Thought Leadership" Filter: If you describe a result without explaining the SYSTEM that caused it, the reviewer will reject it as "Miracle Worship." Every success story must name the mechanism.
2. Mechanisms > Mindset: Vague attributes like "boldness," "courage," or "mindset" will be flagged unless backed by structural constraints, processes, or systems.
3. Transferability & Replicability: If your advice only works for billionaire founders, the reviewer will flag "Founder Worship." Bridge explicitly to what a VP/Director at a mid-size company can do.
4. The Enablement Bridge: Any logic that jumps from "Hire Great People" to "Give Autonomy" without the enablement step will be flagged.
5. The Definition of Leadership: Service = Protection + High Standards. Not passivity.
6. Logical Rigor: The reviewer looks for logical gaps, unstated assumptions, survivorship bias, and unaddressed downsides.
7. Binary Accountability: Proxy metrics presented as real progress will be criticized. Tie to real outcomes.
8. Fact & Lore Audit: Unverified founder lore and vague numbers will be flagged. Every specific claim needs a verifiable source.

STYLE RULES:
- Never use em dashes.
- Write in clear, direct prose. Vary sentence length for rhythm.
- Use headers and structure for articles and whitepapers. LinkedIn posts should flow as continuous prose.
- Default to active voice.
- No corporate jargon. Write like a person, not a press release.
- Be opinionated. Take a clear position and defend it.

FORMAT-SPECIFIC INSTRUCTIONS:

For LINKEDIN POSTS: 150-300 words ideal. Open with a hook. ONE clear point. End with something actionable.
For WEBSITE ARTICLES: 800-2000 words. Problem > Thesis > Arguments with Mechanisms > Application > Conclusion.
For WHITEPAPERS: 2000-5000 words. Executive Summary, Problem Statement, Analysis, Framework, Case Studies, Implementation, Conclusion.
For NEWSPAPER ARTICLES (Zeitungsartikel):
- Write entirely in German. Use formal "Sie" when addressing the reader.
- 500-800 words. No more, no less.
- Target audience: the educated German general public, NOT management consultants. Explain all management concepts in plain language.
- OPENING: Always begin with a personal anecdote. The founder (Sohrab Salimi) uses stories about his family: son, daughter, wife, father. The anecdote must be relatable and connect naturally to the business topic.
- STRUCTURE: Personal anecdote (2-3 paragraphs) > Bridge to business insight > Core argument with 1-2 data points (Gallup, McKinsey, etc.) > Practical takeaway > Closing line.
- CLOSING: Always end with "Von Nichts kommt Nichts."
- TITLE: A provocative question or bold statement. In German.
- No management jargon. No English buzzwords. Write as if explaining something to a smart friend over coffee.

For IMD ARTICLES (I by IMD submission):
- Target: Global executive audience (C-suite, senior leaders, board members). Sophisticated and time-poor.
- Digital platform: 1,000-1,500 words. Magazine: 1,800-5,000 words. Default to digital platform.
- MUST pass the IMD Quality Gate with flying colors: Rigorous, Relevant, Insightful, Actionable.
- Structure: Clear thesis in opening. Evidence-based argumentation. 2-3 concrete case studies with named sources. Practical implications. Strong conclusion.
- Tone: Authoritative but accessible. "Harvard Business Review meets practitioner wisdom." More formal than LinkedIn, less academic than a paper.
- Every claim grounded in named research or documented practice. No "research suggests" without attribution.
- Clear "so what" for the reader: what should they do differently?
- Write for a leader who reads the FT and The Economist, not agile blogs.

Write the complete draft. If the brief is thin, make reasonable assumptions and flag them under "ASSUMPTIONS MADE."`;

const REVIEW_SYSTEM_PROMPT = `You are the "Bar Raiser" Editor for Agile Academy. Your job is to review content drafts against rigorous editorial standards. You are NOT a cheerleader. You are the toughest editor in the room.

THE IMD QUALITY GATE (check this first):
Before detailed review, test against these four. If it fails any one, cap at 7/10.
1. RIGOROUS: Well-founded in research and/or practice?
2. RELEVANT: Addresses a real need for leaders right now?
3. INSIGHTFUL: Advances the conversation in an original way?
4. ACTIONABLE: Reader can do something concrete after reading?

YOUR REVIEW CRITERIA (The "Sohrab Standard"):

1. The "LinkedIn vs. Thought Leadership" Filter: Reject "Miracle Worship." Demand mechanisms.
2. Mechanisms > Mindset: Reject vague attributes unless backed by structural constraints.
3. Transferability: Flag "Founder Worship." Demand applicability for mid-level leaders.
4. The Enablement Bridge: Flag jumps from "hire great people" to "give autonomy."
5. The Definition of Leadership: Service = Protection + High Standards.
6. Logical Rigor: Look for gaps, unstated assumptions, survivorship bias.
7. Binary Accountability: Push for real outcomes, not proxy metrics.
8. Fact & Lore Audit: Flag unverified claims and questionable numbers.

FORMAT-SPECIFIC ADJUSTMENTS:

When reviewing a LINKEDIN POST: Brevity is expected. Core criteria apply but sourcing can be lighter. Watch for empty provocation and Miracle Worship.
When reviewing a WEBSITE ARTICLE: Expect structured argumentation, transferability to mid-level leaders, concrete mechanisms.
When reviewing a WHITEPAPER: Highest standards. Rigorous sourcing, evidence-based claims, explicit counterarguments required.
When reviewing a NEWSPAPER ARTICLE (Zeitungsartikel):
- Must be written in German with formal "Sie." Flag any informal "du."
- MUST open with a personal/family anecdote. If it opens with theory, flag immediately.
- 500-800 words. Flag if outside this range.
- MUST end with "Von Nichts kommt Nichts." Flag if missing.
- All management concepts must be explained in plain German. Flag unexplained English buzzwords or jargon.
- Should include 1-2 data points woven into narrative.
- Core criteria apply but calibrated for a general audience: mechanisms can be described in simpler terms.
- Watch for: consulting pitch tone, missing personal warmth, over-complexity, forced anecdote-to-business connection.
When reviewing an IMD ARTICLE:
- Apply the IMD Quality Gate with extra rigor. Must be publishable in a top business school magazine.
- Digital: 1,000-1,500 words. Magazine: 1,800-5,000 words. Flag if outside range.
- Every major claim must cite a specific source. "Research suggests" is not acceptable.
- Must include 2-3 concrete case studies with verifiable details.
- Tone: authoritative but accessible. Flag if too academic or too casual.
- Must have clear "so what" for senior executives. Flag vague implications.
- Must advance the conversation, not summarize known thinking. Flag undifferentiated thesis.
- Watch for: insufficient sourcing, assertion without evidence, missing counterarguments, generic advice, consultant-speak.

YOUR OUTPUT FORMAT:

Start with a one-line VERDICT.

Then provide a RATING out of 10:
- 1-3: Fundamentally flawed.
- 4-5: Has a point but undermined by gaps.
- 6-7: Solid direction, needs structural work.
- 8: Good. One or two issues.
- 9: Excellent. Minor refinements.
- 10: Publishable as-is.

Then 3-5 SPECIFIC CRITIQUES with IMPROVEMENT DIRECTIONS.

End with a CONTENT TYPE CHECK.

RULES: Never rewrite. Default mode is critical. No em dashes. Be specific.`;

const REVISE_SYSTEM_PROMPT = `You are a senior content writer for Agile Academy, a leadership consulting firm. You are revising an existing draft based on Bar Raiser feedback and author notes.

${AGILE_ACADEMY_POSITIONING}

YOUR REVISION PRINCIPLES:

1. PRESERVE WHAT WORKS: Do not rewrite sections that the reviewer praised or did not flag. Keep strong arguments, good case studies, and effective mechanisms intact.
2. FIX WHAT WAS FLAGGED: Address every specific critique from the Bar Raiser. If the reviewer said "Miracle Worship," add the mechanism. If "unverified claim," add the source. If "not transferable," bridge to mid-level leaders.
3. INCORPORATE AUTHOR NOTES: The author may provide specific priorities or additional context for this revision. These take precedence over your own judgment.
4. MAINTAIN VOICE CONSISTENCY: The revised piece should read as one cohesive draft, not a patchwork of old and new writing.
5. SAME QUALITY STANDARDS: All the original writing principles still apply. Mechanisms over mindset, transferability, enablement bridge, binary accountability, no em dashes.

STYLE RULES:
- Never use em dashes.
- Write in clear, direct prose. Vary sentence length for rhythm.
- Default to active voice.
- No corporate jargon. Be opinionated. Take a clear position.

Output the complete revised draft. Do not include meta-commentary about what you changed.`;

const INTERVIEW_SYSTEM_PROMPT = `You are a content strategist preparing to write a piece for Agile Academy. Before writing, you interview the author to gather their unique perspective, real examples, and specific knowledge that will make the draft far stronger than a generic AI-written piece.

You will receive a topic (and optionally a content type). Generate 3-5 short, targeted interview questions that draw out:

1. The author's personal experience or case studies related to this topic
2. The specific audience they're writing for and what that audience gets wrong
3. The core mechanism or counterintuitive insight they want to convey
4. Any data points, named examples, or references they want included
5. What they want the reader to DO differently after reading

RULES:
- Return ONLY a JSON array of strings. No preamble, no explanation.
- Each question should be 1-2 sentences max.
- Questions should be specific to the topic, not generic writing questions.
- 3 questions minimum, 5 maximum.
- Do not ask about formatting, length, or style (the system handles that).
- Do not use em dashes.

Example output:
["What specific company or team have you seen get this wrong, and what happened?", "What's the one mechanism that makes this work, that most people miss?", "Who is the reader, and what's the biggest misconception they hold about this topic?"]`;

const client = new Anthropic();

function parseRating(review: string): number | null {
  const match = review.match(
    /\bRATING[:\s]*(\d{1,2})\s*(?:\/\s*10|out of 10)/i
  );
  if (match) return parseInt(match[1], 10);
  const altMatch = review.match(/(\d{1,2})\s*\/\s*10/);
  if (altMatch) return parseInt(altMatch[1], 10);
  return null;
}

function sendSSE(
  controller: ReadableStreamDefaultController,
  event: string,
  data: unknown
) {
  const encoder = new TextEncoder();
  controller.enqueue(
    encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { phase } = body;

  // Phase 0: Interview author before writing
  if (phase === "interview") {
    return handleInterview(body);
  }

  // Phase 1: Research and propose topics
  if (phase === "research") {
    return handleResearch(body);
  }

  // Phase 2: Write, review, revise based on selected topic
  if (phase === "write") {
    return handleWrite(body);
  }

  // Phase 3: Revise a previous draft based on Bar Raiser feedback
  if (phase === "revise") {
    return handleRevise(body);
  }

  return new Response(JSON.stringify({ error: "Invalid phase." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

async function handleInterview(body: {
  topic: string;
  contentType: string;
}) {
  const { topic, contentType } = body;

  if (!topic?.trim()) {
    return new Response(
      JSON.stringify({ error: "A topic is required for the interview." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      temperature: 0.5,
      system: INTERVIEW_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Topic: ${topic}\nContent Type: ${contentType || "Website Article"}`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    let questions: string[];
    try {
      questions = JSON.parse(raw);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Not a valid array");
      }
      questions = questions.filter((q) => typeof q === "string" && q.trim());
    } catch {
      // Fallback: split by newlines and clean up
      questions = raw
        .split("\n")
        .map((line) => line.replace(/^\d+[\.\)]\s*/, "").replace(/^[-*]\s*/, "").trim())
        .filter((line) => line.length > 10 && line.endsWith("?"));
      if (questions.length === 0) {
        questions = [raw.trim()].filter(Boolean);
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleResearch(body: {
  contentArea: string;
  contentType: string;
}) {
  const { contentArea, contentType } = body;

  if (!contentArea?.trim()) {
    return new Response(
      JSON.stringify({ error: "A content area is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Step 1: Web research
    const searchResults = await researchTopic(contentArea);

    // Step 2: Generate topic proposals
    const userMessage = `CONTENT AREA TO EXPLORE: ${contentArea}

PREFERRED CONTENT TYPE: ${contentType || "Any"}

TOPICS ALREADY COVERED BY AGILE ACADEMY (do not repeat these):
${EXISTING_CONTENT_TOPICS.map((t, i) => `${i + 1}. ${t}`).join("\n")}

${searchResults}

Based on the above, propose 5 differentiated topic ideas that only Agile Academy could write credibly.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      temperature: 0.7,
      system: RESEARCH_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const proposals =
      message.content[0].type === "text" ? message.content[0].text : "";

    const hasWebSearch = !searchResults.startsWith("NO_WEB_SEARCH");

    return new Response(
      JSON.stringify({ proposals, hasWebSearch, researchContext: searchResults }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleWrite(body: {
  selectedTopic: string;
  contentType: string;
  researchContext: string;
  interviewContext?: string;
}) {
  const { selectedTopic, contentType, researchContext, interviewContext } = body;

  if (!selectedTopic?.trim()) {
    return new Response(
      JSON.stringify({ error: "A selected topic is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Write once
        sendSSE(controller, "status", { message: "Writing draft..." });

        const createMessage = `Content Type: ${contentType || "Website Article"}

TOPIC AND BRIEF:
${selectedTopic}

${researchContext ? `RESEARCH CONTEXT (use these as real sources and references in your piece):\n${researchContext}\n` : ""}${interviewContext ? `AUTHOR INTERVIEW (the author provided these answers during a pre-writing interview; use their examples, perspective, and specifics to personalize the draft):\n${interviewContext}\n` : ""}
Write the complete piece. This should be a genuine Agile Academy publication that reflects the firm's positioning and the founder's voice.

QUALITY REQUIREMENTS FOR FIRST DRAFT:
- Every claim must name a specific mechanism, not just describe a result.
- Include at least one concrete case study with named company, specific details, and verifiable facts.
- If you cite research or data, name the actual source. Do not write "studies show" or "research suggests" without attribution.
- Address the strongest counterargument to the thesis explicitly.
- Ensure every principle is transferable to a VP/Director at a mid-size company, not just founders or CEOs.
- End with prescriptive, actionable specifics, not vague inspiration.

The Bar Raiser will score this ruthlessly. Aim for 10/10 on the first attempt.`;

        const createResult = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          temperature: 0.6,
          system: CREATE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: createMessage }],
        });

        const draft =
          createResult.content[0].type === "text"
            ? createResult.content[0].text
            : "";

        // Review once
        sendSSE(controller, "status", { message: "Reviewing draft..." });

        const reviewMessage = `Content Type: ${contentType || "Website Article"}

Additional Context: This is a draft generated for a new Agile Academy publication on the following topic: ${selectedTopic}

--- DRAFT TO REVIEW ---

${draft}`;

        const reviewResult = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          temperature: 0.3,
          system: REVIEW_SYSTEM_PROMPT,
          messages: [{ role: "user", content: reviewMessage }],
        });

        const reviewText =
          reviewResult.content[0].type === "text"
            ? reviewResult.content[0].text
            : "";
        const rating = parseRating(reviewText);

        sendSSE(controller, "iteration", {
          iteration: 1,
          draft,
          review: reviewText,
          rating,
        });

        sendSSE(controller, "complete", {
          finalDraft: draft,
          finalReview: reviewText,
          message: `Draft complete. Scored ${rating ?? "?"}/10.`,
        });
        controller.close();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        sendSSE(controller, "error", { error: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function handleRevise(body: {
  previousDraft: string;
  previousReview: string;
  revisionNotes: string;
  selectedTopic: string;
  contentType: string;
  researchContext: string;
  revisionNumber: number;
}) {
  const {
    previousDraft,
    previousReview,
    revisionNotes,
    selectedTopic,
    contentType,
    researchContext,
    revisionNumber,
  } = body;

  if (!previousDraft?.trim()) {
    return new Response(
      JSON.stringify({ error: "A previous draft is required for revision." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        sendSSE(controller, "status", {
          message: `Writing revision ${revisionNumber}...`,
        });

        const reviseMessage = `Content Type: ${contentType || "Website Article"}

ORIGINAL TOPIC AND BRIEF:
${selectedTopic}

${researchContext ? `RESEARCH CONTEXT:\n${researchContext}\n` : ""}
--- PREVIOUS DRAFT ---
${previousDraft}

--- BAR RAISER FEEDBACK ON PREVIOUS DRAFT ---
${previousReview}

${revisionNotes?.trim() ? `--- AUTHOR'S REVISION NOTES ---\n${revisionNotes}\n` : ""}
Revise the piece to address the Bar Raiser's feedback${revisionNotes?.trim() ? " and the author's notes" : ""}. Preserve what works, fix what was flagged.`;

        const reviseResult = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          temperature: 0.6,
          system: REVISE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: reviseMessage }],
        });

        const revisedDraft =
          reviseResult.content[0].type === "text"
            ? reviseResult.content[0].text
            : "";

        sendSSE(controller, "status", {
          message: `Reviewing revision ${revisionNumber}...`,
        });

        const reviewMessage = `Content Type: ${contentType || "Website Article"}

Additional Context: This is REVISION ${revisionNumber} of an Agile Academy publication on the following topic: ${selectedTopic}

--- PREVIOUS BAR RAISER FEEDBACK (check whether these issues were addressed) ---
${previousReview}

--- REVISED DRAFT TO REVIEW ---
${revisedDraft}`;

        const reviewResult = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          temperature: 0.3,
          system: REVIEW_SYSTEM_PROMPT,
          messages: [{ role: "user", content: reviewMessage }],
        });

        const reviewText =
          reviewResult.content[0].type === "text"
            ? reviewResult.content[0].text
            : "";
        const rating = parseRating(reviewText);

        sendSSE(controller, "iteration", {
          iteration: revisionNumber,
          draft: revisedDraft,
          review: reviewText,
          rating,
        });

        sendSSE(controller, "complete", {
          finalDraft: revisedDraft,
          finalReview: reviewText,
          message: `Revision ${revisionNumber} complete. Scored ${rating ?? "?"}/10.`,
        });
        controller.close();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.";
        sendSSE(controller, "error", { error: errorMessage });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
