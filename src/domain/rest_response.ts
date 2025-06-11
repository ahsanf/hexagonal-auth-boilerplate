import { Stats } from "./stats"

export type RestResponse = {
  success: boolean
  message: string
  data?: any
  stats?: Stats
}