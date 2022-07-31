/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateCakeRequest {
  name: string
  dueDate: string
  done: boolean
}