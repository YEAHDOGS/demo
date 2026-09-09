import { describe, expect, it } from 'vitest'
import { parseRoute } from './router.js'

describe('parseRoute', () => {
  it('maps empty / root hashes to home', () => {
    expect(parseRoute('')).toEqual({ page: 'home' })
    expect(parseRoute('#')).toEqual({ page: 'home' })
    expect(parseRoute('#/')).toEqual({ page: 'home' })
  })

  it('maps top-level pages', () => {
    expect(parseRoute('#/work')).toEqual({ page: 'work' })
    expect(parseRoute('#/demos')).toEqual({ page: 'demos' })
    expect(parseRoute('#/about')).toEqual({ page: 'about' })
  })

  it('maps case-study routes with the slug', () => {
    expect(parseRoute('#/work/icecream')).toEqual({ page: 'work-detail', slug: 'icecream' })
    expect(parseRoute('#/work/phoenix/')).toEqual({ page: 'work-detail', slug: 'phoenix' })
  })

  it('rejects junk slugs and unknown paths as not-found', () => {
    expect(parseRoute('#/nope').page).toBe('not-found')
    expect(parseRoute('#/work/UPPER CASE').page).toBe('not-found')
    expect(parseRoute('#/work/../etc').page).toBe('not-found')
  })
})
