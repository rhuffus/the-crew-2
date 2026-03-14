import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { BootstrapWorkflowInput } from '@the-crew/shared-types'
import { EventEmitter } from 'node:events'
import type { ChildProcess } from 'node:child_process'

// Mock spawn
const mockSpawn = vi.hoisted(() => vi.fn())

vi.mock('node:child_process', () => ({
  spawn: mockSpawn,
}))

import {
  generateBootstrapResponse,
  buildCeoPrompt,
  parseResponse,
  loadBootstrapState,
  loadProjectSeed,
  persistAssistantMessage,
} from '../activities/bootstrap.activities'

function makeInput(overrides: Partial<BootstrapWorkflowInput> = {}): BootstrapWorkflowInput {
  return {
    projectId: 'proj-1',
    isKickoff: false,
    userMessage: 'Tell me about the company',
    context: {
      companyName: 'Acme Corp',
      companyMission: 'Build great software',
      companyType: 'saas-startup',
      conversationStatus: 'collecting-context',
      recentMessages: [
        { role: 'assistant', content: 'Hello! Welcome.' },
        { role: 'user', content: 'Tell me about the company' },
      ],
    },
    ...overrides,
  }
}

/** Helper to create a fake ChildProcess that resolves with given stdout/stderr/code */
function fakeChild(stdout: string, stderr: string, code: number) {
  const stdinMock = { write: vi.fn(), end: vi.fn() }
  const stdoutEmitter = new EventEmitter()
  const stderrEmitter = new EventEmitter()
  const child = new EventEmitter()

  Object.assign(child, {
    stdin: stdinMock,
    stdout: stdoutEmitter,
    stderr: stderrEmitter,
    kill: vi.fn(),
  })

  // Emit data and close asynchronously
  setTimeout(() => {
    if (stdout) stdoutEmitter.emit('data', Buffer.from(stdout))
    if (stderr) stderrEmitter.emit('data', Buffer.from(stderr))
    child.emit('close', code)
  }, 5)

  return child as unknown as ChildProcess & { stdin: typeof stdinMock }
}

describe('buildCeoPrompt', () => {
  it('should build a kickoff prompt', () => {
    const prompt = buildCeoPrompt(makeInput({ isKickoff: true }))
    expect(prompt).toContain('Acme Corp')
    expect(prompt).toContain('kickoff')
    expect(prompt).toContain('Introduce yourself')
  })

  it('should build a reply prompt with conversation history', () => {
    const prompt = buildCeoPrompt(makeInput({
      userMessage: 'We focus on fintech',
      context: {
        companyName: 'Acme Corp',
        companyMission: '',
        companyType: '',
        conversationStatus: 'collecting-context',
        recentMessages: [
          { role: 'assistant', content: 'Welcome!' },
          { role: 'user', content: 'We focus on fintech' },
        ],
      },
    }))
    expect(prompt).toContain('We focus on fintech')
    expect(prompt).toContain('[assistant]: Welcome!')
  })
})

describe('parseResponse', () => {
  it('should parse valid JSON response', () => {
    const result = parseResponse(
      JSON.stringify({ content: 'CEO response here', suggestedNextStatus: null }),
      'collecting-context',
    )
    expect(result.content).toBe('CEO response here')
    expect(result.suggestedNextStatus).toBeNull()
  })

  it('should parse JSON with status suggestion', () => {
    const result = parseResponse(
      JSON.stringify({ content: 'Moving to drafting', suggestedNextStatus: 'drafting-foundation-docs' }),
      'collecting-context',
    )
    expect(result.content).toBe('Moving to drafting')
    expect(result.suggestedNextStatus).toBe('drafting-foundation-docs')
  })

  it('should reject backward status suggestions', () => {
    const result = parseResponse(
      JSON.stringify({ content: 'Some response', suggestedNextStatus: 'not-started' }),
      'collecting-context',
    )
    expect(result.suggestedNextStatus).toBeNull()
  })

  it('should reject unknown status values', () => {
    const result = parseResponse(
      JSON.stringify({ content: 'Some response', suggestedNextStatus: 'invalid-status' }),
      'collecting-context',
    )
    expect(result.suggestedNextStatus).toBeNull()
  })

  it('should handle plain text as content', () => {
    const result = parseResponse('Just a plain text response', 'collecting-context')
    expect(result.content).toBe('Just a plain text response')
    expect(result.suggestedNextStatus).toBeNull()
  })

  it('should handle empty response gracefully', () => {
    const result = parseResponse('', 'collecting-context')
    expect(result.content).toContain('unable to generate')
    expect(result.suggestedNextStatus).toBeNull()
  })

  it('should extract JSON embedded in markdown', () => {
    const markdown = 'Some text before\n```json\n{"content":"Extracted","suggestedNextStatus":null}\n```'
    const result = parseResponse(markdown, 'collecting-context')
    expect(result.content).toBe('Extracted')
  })
})

describe('generateBootstrapResponse', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete process.env.PLATFORM_SERVICE_URL
  })

  it('should fetch Claude Max credential, spawn CLI with OAuth token, and pipe prompt via stdin', async () => {
    const cliOutput = JSON.stringify({ content: 'CEO says hello', suggestedNextStatus: null })
    const child = fakeChild(cliOutput, '', 0)
    mockSpawn.mockReturnValue(child)

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'my-oauth-token', authType: 'oauth-token' }),
    })

    const result = await generateBootstrapResponse(makeInput())

    // Verify credential fetch for claude-max only
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    expect((globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]![0]).toBe(
      'http://localhost:4010/ai-provider-configs/claude-max/secret',
    )

    // Verify spawn was called with correct args
    expect(mockSpawn).toHaveBeenCalledTimes(1)
    const [cmd, args, opts] = mockSpawn.mock.calls[0]!
    expect(cmd).toBe('claude')
    expect(args).toEqual(['-p', '--output-format', 'text'])
    expect((opts as { env: Record<string, string> }).env.CLAUDE_CODE_OAUTH_TOKEN).toBe('my-oauth-token')

    // Verify prompt was written to stdin
    expect(child.stdin!.write).toHaveBeenCalledTimes(1)
    expect(child.stdin!.end).toHaveBeenCalledTimes(1)

    expect(result.content).toBe('CEO says hello')
  })

  it('should throw when Claude Max is not configured', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 })

    await expect(generateBootstrapResponse(makeInput())).rejects.toThrow(
      'Claude Max not configured',
    )
  })

  it('should throw on CLI non-zero exit with stderr', async () => {
    const child = fakeChild('', 'authentication failed', 1)
    mockSpawn.mockReturnValue(child)

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'token', authType: 'oauth-token' }),
    })

    await expect(generateBootstrapResponse(makeInput())).rejects.toThrow(
      'Claude CLI execution failed',
    )
  })

  it('should use PLATFORM_SERVICE_URL env var', async () => {
    process.env.PLATFORM_SERVICE_URL = 'http://platform:4010'
    const child = fakeChild(JSON.stringify({ content: 'ok', suggestedNextStatus: null }), '', 0)
    mockSpawn.mockReturnValue(child)

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'token', authType: 'oauth-token' }),
    })
    globalThis.fetch = mockFetch

    await generateBootstrapResponse(makeInput())

    expect(mockFetch.mock.calls[0]![0]).toBe(
      'http://platform:4010/ai-provider-configs/claude-max/secret',
    )
  })

  it('should set CI and NONINTERACTIVE env vars', async () => {
    const child = fakeChild(JSON.stringify({ content: 'ok', suggestedNextStatus: null }), '', 0)
    mockSpawn.mockReturnValue(child)

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ apiKey: 'token', authType: 'oauth-token' }),
    })

    await generateBootstrapResponse(makeInput())

    const opts = mockSpawn.mock.calls[0]![2] as { env: Record<string, string> }
    expect(opts.env.CI).toBe('1')
    expect(opts.env.NONINTERACTIVE).toBe('1')
  })
})

describe('legacy bootstrap activities', () => {
  it('loadBootstrapState returns pending status', async () => {
    const result = await loadBootstrapState('project-1')
    expect(result).toEqual({ projectId: 'project-1', status: 'pending' })
  })

  it('loadProjectSeed returns empty seed', async () => {
    const result = await loadProjectSeed('project-1')
    expect(result).toEqual({ projectId: 'project-1', name: '', description: '' })
  })

  it('persistAssistantMessage returns message id', async () => {
    const result = await persistAssistantMessage('project-1', 'hello')
    expect(result.projectId).toBe('project-1')
    expect(result.messageId).toMatch(/^msg-/)
  })
})
