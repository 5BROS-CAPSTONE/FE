import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom has no layout engine, so matchMedia is missing entirely. Tests that
// care about breakpoints install their own via setViewport() in dom.tsx.
afterEach(cleanup)

// jsdom dựng được thẻ <dialog> nhưng không có showModal/close, nên mọi component
// dùng Modal sẽ ném lỗi ngay ở effect đầu tiên. Bù lại bằng bản tối giản: chỉ cần
// thuộc tính open đúng, vì phần còn lại của hộp thoại là HTML thường.
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.open = true
  }
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false
  }
}
