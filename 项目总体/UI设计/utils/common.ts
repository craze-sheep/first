// 地理位置相关
declare const wx: any // Declare the wx variable

export function getLocation(): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: "gcj02",
      altitude: true,
      success: resolve,
      fail: reject,
    })
  })
}

// 计算两点间距离（单位：米）
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000 // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化时间
export function formatTime(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join("-") + " " + [hour, minute, second].map(formatNumber).join(":")
}

function formatNumber(n: number): string {
  n = n.toString()
  return n[1] ? n : "0" + n
}

// 防抖
export function debounce(func: Function, wait: number) {
  let timeout: any
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
