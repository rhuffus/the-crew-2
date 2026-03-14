import { describe, it, expect, beforeEach } from 'vitest'
import { AiProviderConfigService } from './ai-provider-config.service'
import { InMemoryAiProviderConfigRepository } from '../infra/in-memory-ai-provider-config.repository'

describe('AiProviderConfigService', () => {
  let service: AiProviderConfigService
  let repo: InMemoryAiProviderConfigRepository

  beforeEach(() => {
    repo = new InMemoryAiProviderConfigRepository()
    service = new AiProviderConfigService(repo)
  })

  describe('upsert', () => {
    it('should create a new provider config', async () => {
      const result = await service.upsert('anthropic', {
        name: 'Anthropic',
        apiKey: 'sk-ant-test-key-1234567890',
        enabled: true,
      })

      expect(result.providerId).toBe('anthropic')
      expect(result.name).toBe('Anthropic')
      expect(result.apiKeyMasked).toBe('sk-ant***890')
      expect(result.enabled).toBe(true)
    })

    it('should update an existing provider config', async () => {
      await service.upsert('anthropic', {
        name: 'Anthropic',
        apiKey: 'sk-ant-old-key-1234567890',
        enabled: true,
      })

      const result = await service.upsert('anthropic', {
        name: 'Anthropic Updated',
        apiKey: 'sk-ant-new-key-9999999999',
        enabled: false,
      })

      expect(result.name).toBe('Anthropic Updated')
      expect(result.apiKeyMasked).toBe('sk-ant***999')
      expect(result.enabled).toBe(false)
    })
  })

  describe('list', () => {
    it('should return empty array when no configs exist', async () => {
      const result = await service.list()
      expect(result).toEqual([])
    })

    it('should list all providers with masked keys', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-test-key-123', enabled: true })
      await service.upsert('openai', { name: 'OpenAI', apiKey: 'sk-openai-test-key-456', enabled: false })

      const result = await service.list()
      expect(result).toHaveLength(2)
      expect(result.map((r) => r.providerId).sort()).toEqual(['anthropic', 'openai'])
    })
  })

  describe('get', () => {
    it('should return a provider config', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-key-123', enabled: true })

      const result = await service.get('anthropic')
      expect(result.providerId).toBe('anthropic')
      expect(result.apiKeyMasked).not.toContain('sk-ant-key-123')
    })

    it('should throw NotFoundException for unknown provider', async () => {
      await expect(service.get('unknown')).rejects.toThrow('not configured')
    })
  })

  describe('remove', () => {
    it('should delete provider config', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-key-123', enabled: true })
      await service.remove('anthropic')

      const result = await service.list()
      expect(result).toHaveLength(0)
    })
  })

  describe('validate', () => {
    it('should return configured=true when provider has key and is enabled', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-key', enabled: true })

      const result = await service.validate('anthropic')
      expect(result).toEqual({ providerId: 'anthropic', configured: true })
    })

    it('should return configured=false when provider not found', async () => {
      const result = await service.validate('anthropic')
      expect(result).toEqual({ providerId: 'anthropic', configured: false })
    })

    it('should return configured=false when provider is disabled', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-key', enabled: false })

      const result = await service.validate('anthropic')
      expect(result).toEqual({ providerId: 'anthropic', configured: false })
    })
  })

  describe('getActiveApiKey', () => {
    it('should return the API key when provider is configured and enabled', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-secret', enabled: true })

      const key = await service.getActiveApiKey('anthropic')
      expect(key).toBe('sk-ant-secret')
    })

    it('should return null when provider not found', async () => {
      const key = await service.getActiveApiKey('anthropic')
      expect(key).toBeNull()
    })

    it('should return null when provider is disabled', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-secret', enabled: false })

      const key = await service.getActiveApiKey('anthropic')
      expect(key).toBeNull()
    })
  })

  describe('getActiveCredential', () => {
    it('should return credential with default authType api-key', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-secret', enabled: true })

      const cred = await service.getActiveCredential('anthropic')
      expect(cred).toEqual({ apiKey: 'sk-ant-secret', authType: 'api-key' })
    })

    it('should return credential with oauth-token authType', async () => {
      await service.upsert('claude-max', { name: 'Claude Max', apiKey: 'oauth-token-xyz', authType: 'oauth-token', enabled: true })

      const cred = await service.getActiveCredential('claude-max')
      expect(cred).toEqual({ apiKey: 'oauth-token-xyz', authType: 'oauth-token' })
    })

    it('should return null when provider not found', async () => {
      const cred = await service.getActiveCredential('nonexistent')
      expect(cred).toBeNull()
    })

    it('should return null when provider is disabled', async () => {
      await service.upsert('anthropic', { name: 'Anthropic', apiKey: 'sk-ant-secret', enabled: false })

      const cred = await service.getActiveCredential('anthropic')
      expect(cred).toBeNull()
    })
  })

  describe('authType in upsert and toDto', () => {
    it('should include authType in the returned DTO', async () => {
      const result = await service.upsert('claude-max', {
        name: 'Claude Max',
        apiKey: 'oauth-token-1234567890',
        authType: 'oauth-token',
        enabled: true,
      })

      expect(result.authType).toBe('oauth-token')
    })

    it('should default authType to api-key when not specified', async () => {
      const result = await service.upsert('anthropic', {
        name: 'Anthropic',
        apiKey: 'sk-ant-test-key-1234567890',
        enabled: true,
      })

      expect(result.authType).toBe('api-key')
    })

    it('should update authType on existing config', async () => {
      await service.upsert('test-provider', {
        name: 'Test',
        apiKey: 'key-1234567890abcdef',
        authType: 'api-key',
        enabled: true,
      })

      const updated = await service.upsert('test-provider', {
        name: 'Test',
        apiKey: 'oauth-new-token-abcdef',
        authType: 'oauth-token',
        enabled: true,
      })

      expect(updated.authType).toBe('oauth-token')
    })
  })
})
