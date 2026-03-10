import type { VisualNodeDto } from '@the-crew/shared-types'

export interface PropertiesTabProps {
  node: VisualNodeDto
}

interface PropertyField {
  label: string
  value: string
}

function getNodeProperties(node: VisualNodeDto): PropertyField[] {
  const props: PropertyField[] = [
    { label: 'Visual ID', value: node.id },
    { label: 'Entity ID', value: node.entityId },
    { label: 'Node Type', value: node.nodeType },
    { label: 'Status', value: node.status },
    { label: 'Collapsed', value: node.collapsed ? 'Yes' : 'No' },
    { label: 'Layers', value: node.layerIds.join(', ') || 'None' },
  ]

  if (node.position) {
    props.push({ label: 'Position', value: `(${node.position.x}, ${node.position.y})` })
  } else {
    props.push({ label: 'Position', value: 'Auto-layout' })
  }

  if (node.parentId) {
    props.push({ label: 'Parent ID', value: node.parentId })
  }

  return props
}

export function PropertiesTab({ node }: PropertiesTabProps) {
  const properties = getNodeProperties(node)

  return (
    <div data-testid="properties-tab" className="space-y-2">
      {properties.map((prop) => (
        <div
          key={prop.label}
          className="flex items-start justify-between gap-2 rounded border border-border px-2 py-1.5"
        >
          <span className="text-xs font-medium text-muted-foreground">{prop.label}</span>
          <span className="text-right text-xs text-foreground">{prop.value}</span>
        </div>
      ))}
    </div>
  )
}
