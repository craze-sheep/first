const { signMonitorMock } = require("../../../../mock/teacher");
const attendanceService = require("../../../../services/attendance");

Page({
  data: {
    batchId: "",
    monitor: signMonitorMock,
    refreshing: false
  },
  onLoad(options) {
    this.setData({
      batchId: (options && options.batchId) || signMonitorMock.batchId,
      monitor: {
        ...this.data.monitor,
        courseName: decodeURIComponent((options && options.courseName) || this.data.monitor.courseName)
      }
    });
    this.loadMonitor();
  },
  loadMonitor() {
    this.setData({ refreshing: true });
    Promise.all([
      attendanceService.fetchBatch({ batchId: this.data.batchId }),
      attendanceService.listRecords({ batchId: this.data.batchId })
    ])
      .then(([batch, detail]) => {
        if (!batch) return;
        const signedList = (detail && detail.signed) || signMonitorMock.studentsSigned;
        const pendingList = (detail && detail.pending) || signMonitorMock.studentsPending;
        this.setData({
          monitor: {
            ...this.data.monitor,
            batchId: batch.batchId,
            courseName: batch.courseName || this.data.monitor.courseName,
            total: batch.total || this.data.monitor.total,
            signed: batch.signed || signedList.length || this.data.monitor.signed,
            qrExpiredIn: batch.expiresIn ?? 30,
            mode: batch.mode || this.data.monitor.mode,
            qrRefreshInterval: batch.qrRefreshInterval || 30,
            autoCloseMinutes: batch.autoCloseMinutes || 15,
            studentsSigned: signedList,
            studentsPending: pendingList
          }
        });
        this.setupTimers();
      })
      .catch(() => {
        wx.showToast({ title: "批次数据获取失败，已使用示例数据", icon: "none" });
        this.setData({ monitor: signMonitorMock });
      })
      .finally(() => {
        this.setData({ refreshing: false });
      });
  },
  setupTimers() {
    this.clearTimers();
    const interval = (this.data.monitor.qrRefreshInterval || 30) * 1000;
    if (this.data.monitor.status !== "closed") {
      this.qrTimer = setInterval(() => {
        attendanceService
          .refreshQr({ batchId: this.data.batchId })
          .then(() => this.loadMonitor())
          .catch(() => {});
      }, interval);
      const remaining = Math.max(0, this.data.monitor.expiresIn * 1000);
      this.autoCloseTimer = setTimeout(() => {
        attendanceService
          .closeBatch({ batchId: this.data.batchId })
          .then(() => {
            wx.showToast({ title: "签到已自动结束", icon: "none" });
            this.loadMonitor();
          })
          .catch(() => {});
      }, remaining);
    }
  },
  clearTimers() {
    if (this.qrTimer) {
      clearInterval(this.qrTimer);
      this.qrTimer = null;
    }
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }
  },
  handleRefresh() {
    this.loadMonitor();
  },
  handleEndSign() {
    wx.showModal({
      title: "结束签到",
      content: "确认结束当前签到吗？未签到学生将记为缺勤。",
      success: (res) => {
        if (res.confirm) {
          attendanceService
            .closeBatch({ batchId: this.data.batchId })
            .then(() => {
              wx.showToast({ title: "已结束", icon: "none" });
              this.loadMonitor();
            })
            .catch((err) => {
              wx.showToast({ title: err.message || "操作失败", icon: "none" });
            });
        }
      }
    });
  },
  handleRemind() {
    attendanceService
      .sendReminder({ batchId: this.data.batchId })
      .then(() => {
        wx.showToast({ title: "已提醒未签到学生", icon: "success" });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "提醒失败", icon: "none" });
      });
  },
  onUnload() {
    this.clearTimers();
  },
  onHide() {
    this.clearTimers();
  }
});
