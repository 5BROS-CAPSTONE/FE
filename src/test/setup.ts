import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom has no layout engine, so matchMedia is missing entirely. Tests that
// care about breakpoints install their own via setViewport() in dom.tsx.
afterEach(cleanup)
