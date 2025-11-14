const { signTaskMock } = require("../../../../mock/student");
const attendanceService = require("../../../../services/attendance");

const formatDeadline = (timestamp) => {
  if (!timestamp) return signTaskMock.deadline;
  const date = new Date(timestamp);
  const pad = (value) => (value < 10 ? `0${value}` : `${value}`);
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${hours}:${minutes} 截止`;
};

Page({
  data: {
    task: signTaskMock,
    submitting: false
  },
  onLoad(options) {
    this.loadBatch(options && options.courseId);
  },
  loadBatch(courseId) {
    attendanceService
      .fetchBatch({ courseId })
      .then((batch) => {
        if (!batch) return;
        this.setData({
          task: {
            ...this.data.task,
            batchId: batch.batchId,
            courseId: batch.courseId,
            name: batch.courseName || batch.courseId || this.data.task.name,
            mode: batch.mode || this.data.task.mode,
            deadline: formatDeadline(batch.endTime),
            faceRequired: batch.mode === "高安全模式",
            steps: this.data.task.steps.map((step, index) => {
              if (index === 2 && batch.mode !== "高安全模式") {
                return { ...step, status: "skipped" };
              }
              return step;
            })
          }
        });
      })
      .catch(() => {
        wx.showToast({ title: "批次加载失败，已回退为示例数据", icon: "none" });
        this.setData({ task: signTaskMock });
      });
  },
  handleScan() {
    wx.showToast({ title: "二维码已验证", icon: "success" });
    this.setData({
      "task.steps[1].status": "done"
    });
  },
  handleFace() {
    wx.showToast({ title: "人脸识别完成", icon: "success" });
    this.setData({
      "task.steps[2].status": "done"
    });
  },
  handleSubmit() {
    const { task } = this.data;
    if (!task.batchId) {
      wx.showToast({ title: "签到批次未准备就绪", icon: "none" });
      return;
    }
    this.setData({ submitting: true });
    attendanceService
      .submitRecord({
        batchId: task.batchId,
        courseId: task.courseId
      })
      .then(() => {
        wx.showToast({ title: "签到成功", icon: "success" });
        wx.navigateBack({ delta: 1 });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "提交失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  }
});
