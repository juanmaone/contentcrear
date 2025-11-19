/**
 * Merge classnames conditionally (tailwind-merge + clsx compatible)
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}
