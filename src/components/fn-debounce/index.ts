export { FNDebounce as default } from './fn-debounce'
export const cancel = () => require('./fn-debounce-cancel').FNDebounceCancel
export const flush = () => require('./fn-debounce-flush').FNDebounceFlush
export const del = () => require('./fn-debounce-delete').FNDebounceDelete
