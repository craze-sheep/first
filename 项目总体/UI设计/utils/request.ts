import { wx } from "wechat-mini-program"

const BASE_URL = "https://api.example.com" // 替换为实际的API地址

interface RequestOptions {
  url: string
  method?: "GET" | "POST" | "PUT" | "DELETE"
  data?: any
  header?: any
}

export function request(options: RequestOptions) {
  const token = wx.getStorageSync("token")

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.header,
      },
      success: (res: any) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 令牌过期，清除本地存储并跳转到登录页
          wx.removeStorageSync("token")
          wx.removeStorageSync("userRole")
          wx.redirectTo({ url: "/pages/auth/login" })
          reject(res.data)
        } else {
          reject(res.data)
        }
      },
      fail: (err) => {
        wx.showToast({
          title: "网络错误",
          icon: "error",
          duration: 2000,
        })
        reject(err)
      },
    })
  })
}

export const api = {
  // 认证相关
  login: (data: any) => request({ url: "/auth/login", method: "POST", data }),
  logout: () => request({ url: "/auth/logout", method: "POST" }),

  // 学生相关
  getStudentCourses: () => request({ url: "/student/courses" }),
  getCourseDetail: (courseId: string) => request({ url: `/student/courses/${courseId}` }),
  getCheckInRecords: (params: any) => request({ url: "/student/records", data: params }),
  submitCheckIn: (data: any) => request({ url: "/student/check-in", method: "POST", data }),
  getMakeupApplications: () => request({ url: "/student/makeup-applications" }),
  submitMakeupApplication: (data: any) => request({ url: "/student/makeup-applications", method: "POST", data }),

  // 教师相关
  getTeacherCourses: () => request({ url: "/teacher/courses" }),
  startCheckIn: (data: any) => request({ url: "/teacher/check-in/start", method: "POST", data }),
  getCheckInStatus: (checkInId: string) => request({ url: `/teacher/check-in/${checkInId}` }),
  getStatistics: (courseId: string) => request({ url: `/teacher/statistics/${courseId}` }),
  approveMakeup: (applicationId: string, data: any) =>
    request({ url: `/teacher/makeup-applications/${applicationId}`, method: "PUT", data }),

  // 辅导员相关
  getCounselorOverview: () => request({ url: "/counselor/overview" }),
  getWarningStudents: (params: any) => request({ url: "/counselor/warnings", data: params }),
  getStudentDetail: (studentId: string) => request({ url: `/counselor/students/${studentId}` }),

  // 管理员相关
  getUsers: (params: any) => request({ url: "/admin/users", data: params }),
  getCourses: (params: any) => request({ url: "/admin/courses", data: params }),
  getSystemStatistics: () => request({ url: "/admin/statistics" }),
}
