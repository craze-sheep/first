const { studentDashboardMock } = require("../../../../mock/student");
const { getDB } = require("../../../../services/cloud");
const attendanceService = require("../../../../services/attendance");
const { subscribeTemplateId } = require("../../../../config");

Page({
  data: {
    profile: studentDashboardMock.profile,
    stats: studentDashboardMock.stats,
    courses: studentDashboardMock.courses,
    reminders: studentDashboardMock.reminders,
    historyLoading: false,
    refreshing: false
  },
  onShow() {
    this.syncProfile();
    this.loadDashboard();
    this.loadReminders();
  },
  syncProfile() {
    const app = getApp();
    this.setData({
      profile: (app.globalData && app.globalData.userProfile) || studentDashboardMock.profile
    });
  },
  handleCourseTap(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/subpackages/student/pages/sign/index?courseId=${id}`
    });
  },
  handleHistory() {
    wx.navigateTo({
      url: "/subpackages/student/pages/history/index"
    });
  },
  handleSubscribe() {
    wx.requestSubscribeMessage({
      tmplIds: [subscribeTemplateId],
      success: () => {
        wx.showToast({ title: "已订阅", icon: "success" });
      },
      fail: () => {
        wx.showToast({ title: "订阅失败", icon: "none" });
      }
    });
  },
  handleRefresh() {
    this.loadDashboard();
    this.loadReminders();
  },
  loadDashboard() {
    const db = getDB();
    this.setData({ refreshing: true });
    if (!db) {
      this.useMock();
      return;
    }
    db.collection("courses")
      .limit(3)
      .get()
      .then((res) => {
        const data = (res && res.data) || [];
        const courses =
          data.map((course) => {
            const scheduleList = course.schedule || [];
            const firstSchedule = scheduleList[0] || {};
            return {
              id: course._id || course.courseId || course.name,
              name: course.name || "未命名课程",
              teacher: course.teacherId || "任课教师",
              time: firstSchedule.time || "时间待定",
              location: firstSchedule.location || "地点待定",
              status: "upcoming"
            };
          }) || [];
        this.setData({
          courses: courses.length ? courses : studentDashboardMock.courses
        });
      })
      .catch(() => {
        this.useMock();
      })
      .finally(() => {
        this.setData({ refreshing: false });
      });
    this.loadStats();
  },
  useMock() {
    this.setData({
      courses: studentDashboardMock.courses,
      stats: studentDashboardMock.stats,
      reminders: studentDashboardMock.reminders,
      refreshing: false
    });
  },
  loadStats() {
    const app = getApp();
    const studentId = (app.globalData && app.globalData.userProfile && app.globalData.userProfile._id) || "";
    attendanceService
      .listRecords({ studentId })
      .then((records = []) => {
        const summary = records.reduce(
          (acc, record) => {
            acc.total += 1;
            if (record.status === "normal") acc.normal += 1;
            if (record.status === "late") acc.late += 1;
            if (record.status === "absent") acc.absent += 1;
            return acc;
          },
          { total: 0, normal: 0, late: 0, absent: 0 }
        );
        const weekAttendance =
          summary.total > 0 ? `${Math.round((summary.normal / summary.total) * 100)}%` : studentDashboardMock.stats.weekAttendance;
        this.setData({
          stats: {
            weekAttendance,
            lateCount: summary.late,
            absentCount: summary.absent,
            trend: studentDashboardMock.stats.trend
          }
        });
      })
      .catch(() => {
        this.setData({ stats: studentDashboardMock.stats });
      });
  },
  loadReminders() {
    const db = getDB();
    if (!db) {
      this.setData({ reminders: studentDashboardMock.reminders });
      return;
    }
    const _ = db.command;
    db.collection("messages")
      .where({
        targetRole: _.in(["all", "student"])
      })
      .orderBy("createdAt", "desc")
      .limit(3)
      .get()
      .then((res) => {
        const list = (res.data || []).map((msg) => ({
          id: msg.messageId || msg._id,
          text: `${msg.title || "通知"}：${msg.content || ""}`,
          type: "info"
        }));
        this.setData({
          reminders: list.length ? list : studentDashboardMock.reminders
        });
      })
      .catch(() => {
        this.setData({ reminders: studentDashboardMock.reminders });
      });
  }
});
