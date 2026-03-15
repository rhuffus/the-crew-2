import { spawn } from 'node:child_process'
import type {
  BootstrapWorkflowInput,
  BootstrapWorkflowOutput,
  ActiveCredentialDto,
} from '@the-crew/shared-types'

const VALID_STATUSES = [
  'not-started',
  'collecting-context',
  'drafting-foundation-docs',
  'reviewing-foundation-docs',
  'ready-to-grow',
  'growth-started',
]

const CLI_TIMEOUT_MS = 60_000

/**
 * Build the CEO persona prompt for the bootstrap conversation.
 */
export function buildCeoPrompt(input: BootstrapWorkflowInput): string {
  const { isKickoff, userMessage, context } = input
  const { companyName, companyMission, companyType, conversationStatus, recentMessages } = context

  const persona = [
    `You are the CEO agent for "${companyName || 'a new company'}".`,
    companyMission ? `Company mission: "${companyMission}"` : '',
    companyType ? `Company type: ${companyType}` : '',
    `Current bootstrap phase: ${conversationStatus}`,
    '',
    'YOUR ROLE AND BOUNDARIES:',
    '- You are a CEO: your domain is strategy, vision, people, organization, and market.',
    '- You are NOT a CTO, architect, or developer. You do NOT know about code, frameworks, APIs, databases, or any technical implementation detail.',
    '- NEVER ask about or suggest: programming languages, tech stacks, code examples, architecture patterns, tooling, CI/CD, or any implementation detail.',
    '- If the user mentions technical details, acknowledge briefly and steer back to business/strategy topics.',
    '- Keep every question and answer at the executive/strategic level.',
  ].filter(Boolean).join('\n')

  let task: string
  if (isKickoff) {
    task = [
      'Generate a kickoff message to start the bootstrap conversation with the company founder.',
      'Your goals:',
      '1. Introduce yourself briefly and acknowledge what you know about the company',
      '2. Ask 2-3 strategic discovery questions covering: what the company does, who it serves, and what the founder\'s vision is',
      '3. Be warm, professional, and action-oriented',
      '4. Keep your response under 300 words',
      '5. Do NOT ask about technology, implementation, or technical details',
    ].join('\n')
  } else {
    const history = recentMessages
      .slice(-10)
      .map((m) => `[${m.role}]: ${m.content}`)
      .join('\n\n')

    const messageCount = recentMessages.length

    task = [
      'Continue the bootstrap conversation.',
      '',
      history ? `Conversation so far:\n${history}` : '',
      '',
      `User's latest message: "${userMessage}"`,
      `Total messages in conversation: ${messageCount}`,
      '',
      'YOUR GOAL: Collect ONLY what is needed to create the company\'s foundation documents and initial organizational structure. You need to understand:',
      '1. **Company overview** — What the company does, what problem it solves, target audience',
      '2. **Mission and vision** — Where the company is heading, its purpose',
      '3. **Founder constraints** — Budget preferences, autonomy level, culture, priorities',
      '4. **Initial objectives** — What the company should achieve first, key milestones',
      '',
      'You do NOT need to know (and must NOT ask about):',
      '- Technical architecture, code, frameworks, databases, APIs',
      '- Detailed product specifications or feature lists',
      '- Marketing campaigns, pricing models, or sales strategies',
      '- Legal, HR policies, or compliance details',
      '- Anything that departments/teams will figure out themselves once created',
      '',
      'PHASE-SPECIFIC BEHAVIOR:',
      '',
      `**collecting-context** (current: ${conversationStatus === 'collecting-context' ? 'YES' : 'no'}):`,
      '- Ask focused questions ONLY about the 4 topics above.',
      '- Ask at most 2 questions per message. Do NOT overwhelm the user.',
      '- Once you have a reasonable understanding of the 4 topics (typically after 3-5 exchanges), you MUST suggest "drafting-foundation-docs".',
      `- You are at exchange ${Math.ceil(messageCount / 2)}. ${messageCount >= 8 ? 'You have MORE than enough context. Suggest "drafting-foundation-docs" NOW unless critical information is truly missing.' : ''}`,
      '- Do NOT keep asking indefinitely. Be decisive. Imperfect information is fine — departments will refine later.',
      '',
      '**drafting-foundation-docs** (current: ' + (conversationStatus === 'drafting-foundation-docs' ? 'YES' : 'no') + '):',
      '- Present a structured summary of what you\'ve learned as document outlines.',
      '- Do NOT ask more discovery questions. Synthesize what you have.',
      '- After presenting the summary, suggest "reviewing-foundation-docs".',
      '',
      '**reviewing-foundation-docs** (current: ' + (conversationStatus === 'reviewing-foundation-docs' ? 'YES' : 'no') + '):',
      '- Address specific feedback from the user.',
      '- If the user approves (says "ok", "approve", "looks good", "lgtm", "go ahead", or similar), suggest "ready-to-grow".',
      '',
      '**ready-to-grow** (current: ' + (conversationStatus === 'ready-to-grow' ? 'YES' : 'no') + '):',
      '- Propose an initial organizational structure: departments and teams based on the company\'s needs.',
      '- Be concrete: suggest specific department names and their purpose.',
      '',
      'GUIDELINES:',
      '- Be concise (under 300 words)',
      '- Move the conversation forward decisively — do NOT stall',
      '- When in doubt, ADVANCE to the next phase rather than asking more questions',
    ].filter(Boolean).join('\n')
  }

  const format = [
    '',
    'IMPORTANT: You MUST respond with ONLY a valid JSON object, no other text:',
    '{',
    '  "content": "Your message in Markdown format",',
    '  "suggestedNextStatus": "next-status" or null',
    '}',
    '',
    `Valid statuses: ${VALID_STATUSES.join(', ')}`,
    'Only suggest a status that comes AFTER the current status in the progression.',
    'Set suggestedNextStatus to null if no transition is warranted.',
  ].join('\n')

  return `${persona}\n\n${task}\n${format}`
}

/**
 * Parse the Claude runner output to extract the assistant response.
 * Handles JSON responses and falls back to treating raw text as content.
 */
export function parseResponse(text: string, currentStatus: string): BootstrapWorkflowOutput {
  if (!text || text.trim().length === 0) {
    return {
      content: 'I apologize, but I was unable to generate a response. Please try again.',
      suggestedNextStatus: null,
    }
  }

  // Try to parse as JSON
  try {
    const parsed = JSON.parse(text.trim())
    if (typeof parsed.content === 'string' && parsed.content.length > 0) {
      const suggestedStatus = typeof parsed.suggestedNextStatus === 'string'
        && VALID_STATUSES.includes(parsed.suggestedNextStatus)
        && VALID_STATUSES.indexOf(parsed.suggestedNextStatus) > VALID_STATUSES.indexOf(currentStatus)
        ? parsed.suggestedNextStatus
        : null
      return {
        content: parsed.content,
        suggestedNextStatus: suggestedStatus,
      }
    }
  } catch {
    // Not JSON — fall through to plain text handling
  }

  // Try to extract JSON from within the text (Claude sometimes wraps JSON in markdown)
  const jsonMatch = text.match(/\{[\s\S]*"content"\s*:\s*"[\s\S]*"\s*[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0])
      if (typeof parsed.content === 'string' && parsed.content.length > 0) {
        const suggestedStatus = typeof parsed.suggestedNextStatus === 'string'
          && VALID_STATUSES.includes(parsed.suggestedNextStatus)
          && VALID_STATUSES.indexOf(parsed.suggestedNextStatus) > VALID_STATUSES.indexOf(currentStatus)
          ? parsed.suggestedNextStatus
          : null
        return {
          content: parsed.content,
          suggestedNextStatus: suggestedStatus,
        }
      }
    } catch {
      // Still not valid JSON
    }
  }

  // Fallback: treat raw text as content
  return {
    content: text.trim(),
    suggestedNextStatus: null,
  }
}

/**
 * Fetch Claude Max OAuth credential from the platform service.
 * Only supports claude-max provider (subscription-based auth).
 */
async function fetchCredential(platformUrl: string): Promise<ActiveCredentialDto> {
  try {
    const res = await fetch(`${platformUrl}/ai-provider-configs/claude-max/secret`)
    if (res.ok) {
      return (await res.json()) as ActiveCredentialDto
    }
  } catch {
    // Provider not configured or unreachable
  }
  throw new Error(
    'Claude Max not configured. Go to Settings and configure your Claude Max subscription.',
  )
}

/**
 * Execute Claude Code CLI via spawn with the prompt piped through stdin.
 * Uses CLAUDE_CODE_OAUTH_TOKEN for Claude Max authentication.
 * Returns { stdout, stderr } on success, throws on failure.
 */
function execClaude(prompt: string, oauthToken: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const env: Record<string, string> = {
      ...(process.env as Record<string, string>),
      CLAUDE_CODE_OAUTH_TOKEN: oauthToken,
      // Ensure CLI doesn't try to open a browser or interactive auth
      CI: '1',
      NONINTERACTIVE: '1',
    }

    const child = spawn('claude', ['-p', '--output-format', 'text'], {
      env,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: CLI_TIMEOUT_MS,
    })

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk))

    // Write prompt to stdin and close it
    child.stdin.write(prompt)
    child.stdin.end()

    // Timeout guard
    const timer = setTimeout(() => {
      child.kill('SIGTERM')
      const stderr = Buffer.concat(stderrChunks).toString()
      reject(new Error(
        `Claude CLI timed out after ${CLI_TIMEOUT_MS / 1000}s.` +
        (stderr ? ` stderr: ${stderr.slice(0, 500)}` : ''),
      ))
    }, CLI_TIMEOUT_MS)

    child.on('close', (code) => {
      clearTimeout(timer)
      const stdout = Buffer.concat(stdoutChunks).toString()
      const stderr = Buffer.concat(stderrChunks).toString()

      if (code !== 0) {
        reject(new Error(
          `Claude CLI exited with code ${code}.` +
          (stderr ? ` stderr: ${stderr.slice(0, 500)}` : '') +
          (!stderr && stdout ? ` stdout: ${stdout.slice(0, 500)}` : ''),
        ))
        return
      }
      resolve({ stdout, stderr })
    })

    child.on('error', (err) => {
      clearTimeout(timer)
      reject(new Error(`Claude CLI spawn failed: ${err.message}`))
    })
  })
}

/**
 * Main activity: executes Claude Code CLI to generate a CEO bootstrap response.
 * Uses Claude Max OAuth token for authentication.
 */
export async function generateBootstrapResponse(
  input: BootstrapWorkflowInput,
): Promise<BootstrapWorkflowOutput> {
  const platformUrl = process.env.PLATFORM_SERVICE_URL ?? 'http://localhost:4010'
  const prompt = buildCeoPrompt(input)

  // 1. Get Claude Max OAuth credential
  const credential = await fetchCredential(platformUrl)

  // 2. Execute Claude Code CLI with OAuth token
  try {
    const { stdout } = await execClaude(prompt, credential.apiKey)
    return parseResponse(stdout, input.context.conversationStatus)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Claude CLI execution failed: ${message}`)
  }
}

// Legacy stubs kept for other workflows that may use them
export async function loadBootstrapState(
  projectId: string,
): Promise<{ projectId: string; status: string }> {
  return { projectId, status: 'pending' }
}

export async function loadProjectSeed(
  projectId: string,
): Promise<{ projectId: string; name: string; description: string }> {
  return { projectId, name: '', description: '' }
}

export async function persistAssistantMessage(
  projectId: string,
  _message: string,
): Promise<{ projectId: string; messageId: string }> {
  return { projectId, messageId: `msg-${Date.now()}` }
}
