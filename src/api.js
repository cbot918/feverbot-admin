const AUTH_KEY = 'fever_admin_auth'

function readStoredAuth() {
  return sessionStorage.getItem(AUTH_KEY) || ''
}

function promptForAuth() {
  const username = window.prompt('Admin 帳號')
  if (!username) return ''
  const password = window.prompt('Admin 密碼')
  if (password === null) return ''
  const token = btoa(`${username}:${password}`)
  sessionStorage.setItem(AUTH_KEY, token)
  return token
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY)
}

async function request(method, path, body) {
  let token = readStoredAuth() || promptForAuth()
  if (!token) throw new Error('未提供帳密')

  const headers = { Authorization: `Basic ${token}` }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const resp = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (resp.status === 401) {
    clearAuth()
    throw new Error('帳密錯誤，請重新整理頁面再試')
  }
  if (!resp.ok) {
    let detail = ''
    try {
      detail = (await resp.json()).error || ''
    } catch (_) {}
    throw new Error(`${resp.status} ${resp.statusText}${detail ? ' — ' + detail : ''}`)
  }
  return resp.json()
}

export const api = {
  getConfig: () => request('GET', '/admin/api/config'),
  updateConfig: (patch) => request('PUT', '/admin/api/config', patch),
}
