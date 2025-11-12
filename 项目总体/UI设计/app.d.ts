interface IAppOption {
  globalData: {
    userRole: "student" | "teacher" | "counselor" | "admin" | null
    userId: string | null
    userInfo: any
    token: string | null
  }
  onLaunch(): void
}
