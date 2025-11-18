const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'https://api.odegano.kro.kr'

async function request(path: string, init?: RequestInit) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, init)
  let json: any = null
  try {
    json = await res.json()
  } catch (e) {
    // ignore json parse errors
  }
  return { status: res.status, data: json }
}

export async function postTraits(places: string) {
  const path = `/traits?places=${encodeURIComponent(places)}`
  return request(path, { method: 'POST' })
}

export async function postPerpose(reason: string, id: string) {
  const path = `/perpose?reason=${encodeURIComponent(reason)}&id=${encodeURIComponent(id)}`
  return request(path, { method: 'POST' })
}

export async function postPeople(id: string, people: string) {
  const path = `/people?id=${encodeURIComponent(id)}&people=${encodeURIComponent(people)}`
  return request(path, { method: 'POST' })
}

export async function postDay(id: string, day: string) {
  const path = `/day?id=${encodeURIComponent(id)}&day=${encodeURIComponent(day)}`
  return request(path, { method: 'POST' })
}

export default { postTraits, postPerpose, postPeople, postDay }
