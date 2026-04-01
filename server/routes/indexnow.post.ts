const INDEXNOW_KEY = '16e430d9e352240914cbeab6c28630bf'
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'
const SITE_HOST = 'frontskill.ru'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ urls: string[] }>(event)

  if (!body?.urls?.length) {
    throw createError({ statusCode: 400, statusMessage: 'urls array is required' })
  }

  const response = await $fetch.raw(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${SITE_HOST}/${INDEXNOW_KEY}.txt`,
      urlList: body.urls,
    },
  })

  return { success: true, submitted: body.urls.length, status: response.status }
})
