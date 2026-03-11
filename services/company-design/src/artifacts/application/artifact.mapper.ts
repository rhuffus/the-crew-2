import type { ArtifactDto } from '@the-crew/shared-types'
import type { Artifact } from '../domain/artifact'

export class ArtifactMapper {
  static toDto(artifact: Artifact): ArtifactDto {
    return {
      id: artifact.id,
      projectId: artifact.projectId,
      name: artifact.name,
      description: artifact.description,
      type: artifact.type,
      status: artifact.status,
      producerId: artifact.producerId,
      producerType: artifact.producerType,
      consumerIds: [...artifact.consumerIds],
      tags: [...artifact.tags],
      createdAt: artifact.createdAt.toISOString(),
      updatedAt: artifact.updatedAt.toISOString(),
    }
  }
}
