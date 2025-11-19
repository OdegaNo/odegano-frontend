import axios, { type AxiosRequestConfig } from 'axios'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.odegano.kro.kr'

const client = axios.create({
  baseURL: BASE_URL,
})

type ApiResponse<T = any> = {
  status: number
  data: T | null
}

async function request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response = await client.request<T>(config)
    
    return { status: response.status, data: response.data }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status ?? 0,
        data: error.response?.data ?? null,
      }
    }

    return { status: 0, data: null }
  }
}

export async function postTraits(places: string) {
  return request({
    url: '/traits',
    method: 'POST',
    params: { places },
  })
}

export async function postPerpose(reason: string, id: string) {
  return request({
    url: '/perpose',
    method: 'POST',
    params: { reason, id },
  })
}

export async function postPeople(id: string, people: string) {
  return request({
    url: '/people',
    method: 'POST',
    params: { id, people },
  })
}

export async function postDay(id: string, day: string) {
  return request({
    url: '/day',
    method: 'POST',
    params: { id, day },
  })
}

export async function postRecommend(id: string, limit: number = 5) {
  return request({
    url: '/recommend',
    method: 'POST',
    params: { id, limit },
  })
}

export async function getPlans(id: string) {
  return request({
    url: `/planner/${id}`,
    method: 'GET'
  })
}

export async function postPlanner(id: string, body: unknown) {
  return request({
    url: '/planner',
    method: 'POST',
    params: { id },
    data: body,
  })
}

export default { postTraits, postPerpose, postPeople, postDay, postRecommend, postPlanner, getPlans }
