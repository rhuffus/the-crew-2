export type AiAuthType = 'api-key' | 'oauth-token'

export interface AiProviderConfigDto {
  providerId: string
  name: string
  apiKeyMasked: string
  authType: AiAuthType
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export interface UpsertAiProviderConfigDto {
  name: string
  apiKey: string
  authType?: AiAuthType
  enabled: boolean
}

export interface AiProviderValidationDto {
  providerId: string
  configured: boolean
}

export interface ActiveCredentialDto {
  apiKey: string
  authType: AiAuthType
}
