import { createOrderPayload } from '../acme/newOrder'
import { newAccountPayload } from '../acme/newAccount'

export type PayloadType =
  | null
  | newAccountPayload
  | createOrderPayload