import type { LucideIcon } from 'lucide-react'
import {
  FolderOpen,
  LayoutDashboard,
  Building2,
  Network,
  Zap,
  UserCog,
  Bot,
  Wrench,
  FileText,
  GitBranch,
  Shield,
  Tag,
  ClipboardCheck,
  History,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const platformNavItems: NavItem[] = [
  { label: 'Projects', to: '/', icon: FolderOpen },
]

export const projectNavSections: NavSection[] = [
  {
    title: 'General',
    items: [
      { label: 'Overview', to: '/projects/$projectId/admin/overview', icon: LayoutDashboard },
      { label: 'Company Model', to: '/projects/$projectId/admin/company-model', icon: Building2 },
    ],
  },
  {
    title: 'Design Studio',
    items: [
      { label: 'Departments', to: '/projects/$projectId/admin/departments', icon: Network },
      { label: 'Capabilities', to: '/projects/$projectId/admin/capabilities', icon: Zap },
      { label: 'Roles', to: '/projects/$projectId/admin/roles', icon: UserCog },
      { label: 'Agents', to: '/projects/$projectId/admin/agents', icon: Bot },
      { label: 'Skills', to: '/projects/$projectId/admin/skills', icon: Wrench },
      { label: 'Contracts', to: '/projects/$projectId/admin/contracts', icon: FileText },
      { label: 'Workflows', to: '/projects/$projectId/admin/workflows', icon: GitBranch },
      { label: 'Policies', to: '/projects/$projectId/admin/policies', icon: Shield },
    ],
  },
  {
    title: 'Governance',
    items: [
      { label: 'Releases', to: '/projects/$projectId/admin/releases', icon: Tag },
      { label: 'Validations', to: '/projects/$projectId/admin/validations', icon: ClipboardCheck },
      { label: 'Audit', to: '/projects/$projectId/admin/audit', icon: History },
    ],
  },
]

export const projectNavItems: NavItem[] = projectNavSections.flatMap((s) => s.items)
