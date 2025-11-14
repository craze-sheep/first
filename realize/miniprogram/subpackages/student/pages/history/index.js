const attendanceService = require("../../../../services/attendance");

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp || Date.now());
  const pad = (value) => (value < 10 ? `0${value}` : `${value}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
};

Page({
  data: {
    records: [],
    loading: false
  },
  onShow() {
    this.loadHistory();
  },
  loadHistory() {
    this.setData({ loading: true });
    const app = getApp();
    const studentId = (app.globalData && app.globalData.userProfile && app.globalData.userProfile._id) || "";
    attendanceService
      .listRecords({ studentId })
      .then((list = []) => {
        const normalized = list.map((record) => ({
          id: record.recordId || record._id,
          course: record.courseName || "未命名课程",
          status: record.status || "normal",
          time: formatDateTime(record.signedAt)
        }));
        this.setData({
          records: normalized
        });
      })
      .catch(() => {
        this.setData({ records: [] });
      })
      .finally(() => this.setData({ loading: false }));
  }
});
