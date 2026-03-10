import reactConfig from '@the-crew/eslint-config/react'

export default [
  ...reactConfig,
  {
    ignores: ['src/routeTree.gen.ts'],
  },
]
