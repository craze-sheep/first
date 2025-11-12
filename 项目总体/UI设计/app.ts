import { App, type IAppOption } from "some-app-framework"
import wx from "weixin-js-sdk"

App<IAppOption>({
  globalData: {
    userRole: null,
    userId: null,
    userInfo: null,
    token: null,
  },
  onLaunch() {
    const token = wx.getStorageSync("token")
    const userRole = wx.getStorageSync("userRole")

    if (token) {
      this.globalData.token = token
      this.globalData.userRole = userRole
      this.loadUserInfo()
    }
  },
  loadUserInfo() {
    // 从服务器加载用户信息
  },
})

export function getApp() {
  return wx.getApp<IAppOption>()
}

export type { IAppOption }
