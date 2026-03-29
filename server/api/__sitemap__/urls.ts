import { defineSitemapEventHandler, queryCollection } from '#imports'

export default defineSitemapEventHandler(async (e) => {
  const docs = await queryCollection(e, 'docs').select('path').all()

  return docs.map((doc) => ({
    loc: doc.path,
  }))
})
