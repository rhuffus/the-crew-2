import type { AiAuthType } from '@the-crew/shared-types'

export interface AiProviderConfigProps {
  providerId: string
  name: string
  apiKey: string
  authType: AiAuthType
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

export class AiProviderConfig {
  constructor(
    public readonly id: string,
    private props: AiProviderConfigProps,
  ) {}

  get providerId() { return this.props.providerId }
  get name() { return this.props.name }
  get apiKey() { return this.props.apiKey }
  get authType() { return this.props.authType }
  get enabled() { return this.props.enabled }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get maskedApiKey(): string {
    const key = this.props.apiKey
    if (key.length <= 6) return '***'
    return key.slice(0, 6) + '***' + key.slice(-3)
  }

  static create(props: { providerId: string; name: string; apiKey: string; authType?: AiAuthType; enabled?: boolean }): AiProviderConfig {
    if (!props.providerId.trim()) throw new Error('providerId cannot be empty')
    if (!props.apiKey.trim()) throw new Error('apiKey cannot be empty')
    const now = new Date()
    return new AiProviderConfig(crypto.randomUUID(), {
      providerId: props.providerId.trim(),
      name: props.name.trim() || props.providerId,
      apiKey: props.apiKey,
      authType: props.authType ?? 'api-key',
      enabled: props.enabled ?? true,
      createdAt: now,
      updatedAt: now,
    })
  }

  static reconstitute(id: string, props: AiProviderConfigProps): AiProviderConfig {
    return new AiProviderConfig(id, props)
  }

  update(props: { name?: string; apiKey?: string; authType?: AiAuthType; enabled?: boolean }): void {
    if (props.name !== undefined) this.props.name = props.name.trim()
    if (props.apiKey !== undefined) this.props.apiKey = props.apiKey
    if (props.authType !== undefined) this.props.authType = props.authType
    if (props.enabled !== undefined) this.props.enabled = props.enabled
    this.props.updatedAt = new Date()
  }
}
