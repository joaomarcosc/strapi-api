'use strict';

/**
 * game service.
 */

const { createCoreService } = require('@strapi/strapi').factories;
const axios = require("axios");
const fetch = require('node-fetch');
const slugify = require("slugify")
const qs = require("querystring")

function timeOut(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getGameInfo(slug) {
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom
  const body = await axios.get(`https://www.gog.com/game/${slug}`)
  const dom = new JSDOM(body.data)

  const description = dom.window.document.querySelector('.description')
  return {
    rating: 'BR0',
    short_description: description?.textContent?.slice(0, 160) ?? "",
    description: description?.innerHTML ?? ""
  }
}

async function getByName(name, entityName, strapi) {
  const query = {
    filters: { name }
  }
  const item = await strapi.service(entityName).find(query)

  return item.results.length ? item.results[0] : null
}

async function create(name, entityName, strapi) {
  const item = await getByName(name, entityName, strapi)
  if (!item) {
    await strapi.service(entityName).create({
      data: {
        name,
        slug: slugify(name, { lower: true })
      }
    })
  }
}

async function createManyToManyData(products, strapi) {
  const developers = {}
  const publishers = {}
  const categories = {}
  const platforms = {}

  products.map((product) => {
    const { developer, publisher, genres, supportedOperatingSystems } = product

    genres && genres.map(item => {
      categories[item] = true
    })
    supportedOperatingSystems.map(item => {
      platforms[item] = true
    })

    developers[developer] = true
    publishers[publisher] = true
  })

  return Promise.all([
    ...Object.keys(developers).map(name => create(name, "api::developer.developer", strapi)),
    ...Object.keys(publishers).map(name => create(name, "api::publisher.publisher", strapi)),
    ...Object.keys(categories).map(name => create(name, "api::category.category", strapi)),
    ...Object.keys(platforms).map(name => create(name, "api::platform.platform", strapi))
  ])
}

async function setImage({ image, game, strapi, field = "cover" }) {
  const url = `https:${image}_bg_crop_1680x655.jpg`
  const { data } = await axios.get(url, { responseType: "arraybuffer" })
  const FormData = require("form-data")
  const formData = new FormData()
  formData.append("refId", game.id)
  formData.append("ref", "api::game.game")
  formData.append("field", field)
  formData.append("files", data, { filename: `${game.slug}.jpg` })

  console.log(`Uploading ${field} image: ${game.slug}.jpg`)

  await fetch(`http://${strapi.config.host}:${strapi.config.port}/api/upload`, {
    method: "post",
    body: formData
  })
}


async function createGames(products, strapi) {
  await Promise.all(products.map(async product => {
    const entityName = "api::game.game"
    const item = await getByName(product.title, entityName, strapi)
    const categories = await Promise.all(
      product.genres.map(name => getByName(name, "api::category.category", strapi))
    )
    const platforms = await Promise.all(
      product.supportedOperatingSystems.map(name => getByName(name, "api::platform.platform", strapi))
    )
    const developers = await getByName(product.developer, "api::developer.developer", strapi)

    if (!item) {
      console.log(`Creating: ${product.title}...`)
      const game = await strapi.service(entityName).create({
        data: {
          name: product.title,
          slug: product.slug.replace(/_/g, "-"),
          price: product.price.amount,
          release_date: new Date(Number(product.globalReleaseDate) * 1000).toISOString(),
          categories: categories,
          platforms: platforms,
          developers: [developers],
          publisher: await getByName(product.publisher, "api::publisher.publisher", strapi),
          ...(await getGameInfo(product.slug))
        }
      })
      await setImage({ image: product.image, game, strapi })
      await Promise.all(
        product.gallery.slice(0, 5).map(url => setImage({ image: url, game, strapi, field: "gallery" }))
      )

      await timeOut(2000)
      return game
    }
  }))
}

module.exports = createCoreService('api::game.game', ({ strapi }) => ({
  async populate(args) {
    const gogApiUrl = `https://www.gog.com/games/ajax/filtered?mediaType=game&${qs.stringify(args)}`

    const { data: { products } } = await axios.get(gogApiUrl)

    await createManyToManyData(products, strapi)
    await createGames(products, strapi)
  }
}));
