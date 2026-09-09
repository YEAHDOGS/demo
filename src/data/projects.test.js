import { describe, expect, it } from 'vitest'
import projects from './projects.json'

const REQUIRED = ['slug', 'name', 'pitch', 'problem', 'build', 'result', 'stack', 'status']
const STATUSES = new Set(['live', 'in-progress', 'archived'])

describe('projects.json', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })

  it('gives every project all required fields', () => {
    for (const p of projects) {
      for (const field of REQUIRED) {
        expect(p[field], `${p.slug ?? '?'} missing ${field}`).toBeDefined()
      }
    }
  })

  it('uses unique, URL-safe slugs', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/)
    }
  })

  it('uses only known statuses', () => {
    for (const p of projects) {
      expect(STATUSES.has(p.status), `${p.slug} bad status`).toBe(true)
    }
  })

  it('has at least one featured project for the landing page', () => {
    expect(projects.some((p) => p.featured)).toBe(true)
  })

  it('keeps URLs absolute when present', () => {
    for (const p of projects) {
      for (const key of ['liveUrl', 'repoUrl']) {
        if (p[key]) expect(p[key]).toMatch(/^https:\/\//)
      }
    }
  })
})
