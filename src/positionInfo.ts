const n = 4
export function getCurrentPosition() {
  const docHeight = document.documentElement.scrollHeight
  const scrollPosition = window.screenY || document.documentElement.scrollTop
  const scrollPercentage = scrollPosition / (docHeight - window.innerHeight)

  const prevPage = Math.min(Math.floor(scrollPercentage * n), n - 1)

  const visibility = 1 - ((scrollPercentage * (n - 1)) % 1)

  return {
    visibility,
    prevPage,
    scrollPercentage
  }
}

export function getPositionBetween(a: number, b: number) {
  const { scrollPercentage } = getCurrentPosition()

  const start = a / n
  const end = b / n - 1 / (n * 2)

  if (scrollPercentage < start) return 0
  if (scrollPercentage > end) return 1
  return ((scrollPercentage - start) * 1) / (end - start)
}

export function getElementVisibility(el: string) {
  const element = document.querySelector<HTMLElement>(el)
  if (!element) {
    throw new Error('Not found')
  }

  const rect = element.getBoundingClientRect()
  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth

  // Calculate visibility in percent
  const visibleHeight = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0))
  const visibleWidth = Math.max(0, Math.min(rect.right, windowWidth) - Math.max(rect.left, 0))
  const visibleArea = (visibleHeight * visibleWidth) / (element.offsetWidth * element.offsetHeight)

  return visibleArea
}
