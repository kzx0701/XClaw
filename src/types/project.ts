export type ProjectType = 'vite-vue' | 'vite-react' | 'vue-cli' | 'react' | 'unknown'

export interface ProjectSummary {
  id: string
  name: string
  path: string
  type: ProjectType
  updatedAt: string
}
