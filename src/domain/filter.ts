export type Filter = {
  perPage?: number
  currentPage?: number
  query?: string
  sortBy?: string
  sortOrder?: number | string
  isActive?: boolean
  fields?: string[]
}