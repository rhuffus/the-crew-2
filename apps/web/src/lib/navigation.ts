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
      { label: 'Overview', to: '/projects/$projectSlug/admin/overview', icon: LayoutDashboard },
      { label: 'Company Model', to: '/projects/$projectSlug/admin/company-model', icon: Building2 },
    ],
  },
  {
    title: 'Design Studio',
    items: [
      { label: 'Departments', to: '/projects/$projectSlug/admin/departments', icon: Network },
      { label: 'Capabilities', to: '/projects/$projectSlug/admin/capabilities', icon: Zap },
      { label: 'Roles', to: '/projects/$projectSlug/admin/roles', icon: UserCog },
      { label: 'Agents', to: '/projects/$projectSlug/admin/agents', icon: Bot },
      { label: 'Skills', to: '/projects/$projectSlug/admin/skills', icon: Wrench },
      { label: 'Contracts', to: '/projects/$projectSlug/admin/contracts', icon: FileText },
      { label: 'Workflows', to: '/projects/$projectSlug/admin/workflows', icon: GitBranch },
      { label: 'Policies', to: '/projects/$projectSlug/admin/policies', icon: Shield },
    ],
  },
  {
    title: 'Governance',
    items: [
      { label: 'Releases', to: '/projects/$projectSlug/admin/releases', icon: Tag },
      { label: 'Validations', to: '/projects/$projectSlug/admin/validations', icon: ClipboardCheck },
      { label: 'Audit', to: '/projects/$projectSlug/admin/audit', icon: History },
    ],
  },
]

export const projectNavItems: NavItem[] = projectNavSections.flatMap((s) => s.items)
