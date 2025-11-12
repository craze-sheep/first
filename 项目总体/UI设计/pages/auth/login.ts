import { Component } from "react"
import { api } from "../../utils/request"
import { wx } from "weixin-js-sdk"
import { getApp, type IAppOption } from "../../app"

Component({
  data: {
    loading: false,
    studentId: "",
    password: "",
    userRole: "student",
    roles: [
      { label: "学生", value: "student" },
      { label: "教师", value: "teacher" },
      { label: "辅导员", value: "counselor" },
      { label: "管理员", value: "admin" },
    ],
  },
  methods: {
    handleInput(e: any) {
      const field = e.currentTarget.dataset.field
      this.setData({
        [field]: e.detail.value,
      })
    },
    async handleLogin() {
      const { studentId, password, userRole } = this.data

      if (!studentId || !password) {
        wx.showToast({
          title: "请输入用户名和密码",
          icon: "error",
        })
        return
      }

      this.setData({ loading: true })

      try {
        const result = await api.login({
          username: studentId,
          password,
          role: userRole,
        })

        // 保存令牌和用户信息
        wx.setStorageSync("token", result.token)
        wx.setStorageSync("userRole", userRole)
        wx.setStorageSync("userId", result.userId)

        const app = getApp<IAppOption>()
        app.globalData.token = result.token
        app.globalData.userRole = userRole
        app.globalData.userId = result.userId

        // 根据角色跳转到对应首页
        const pageMap = {
          student: "/pages/student/index",
          teacher: "/pages/teacher/index",
          counselor: "/pages/counselor/overview",
          admin: "/pages/admin/users",
        }

        wx.reLaunch({
          url: pageMap[userRole as keyof typeof pageMap],
        })
      } catch (error) {
        wx.showToast({
          title: "登录失败，请检查用户名和密码",
          icon: "error",
        })
      } finally {
        this.setData({ loading: false })
      }
    },
  },
})
