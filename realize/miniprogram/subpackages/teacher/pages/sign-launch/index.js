const { signLaunchDefaults } = require("../../../../mock/teacher");
const attendanceService = require("../../../../services/attendance");

Page({
  data: {
    courseId: "",
    courseName: "",
    modes: ["高安全模式", "标准模式", "便捷模式"],
    form: {
      mode: signLaunchDefaults.mode,
      duration: signLaunchDefaults.duration,
      range: signLaunchDefaults.range,
      lateBuffer: signLaunchDefaults.lateBuffer,
      qrRefreshInterval: 30,
      autoCloseMinutes: 15,
      remark: ""
    },
    submitting: false
  },
  onLoad(options) {
    this.setData({
      courseId: (options && options.courseId) || "",
      courseName: decodeURIComponent((options && options.courseName) || "")
    });
  },
  handleModeChange(event) {
    const mode = this.data.modes[Number(event.detail.value)] ?? this.data.form.mode;
    this.setData({ "form.mode": mode });
  },
  handleSliderChange(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: Number(event.detail.value)
    });
  },
  handleInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: event.detail.value
    });
  },
  handleSubmit() {
    const payload = {
      courseId: this.data.courseId || "course-001",
      courseName: this.data.courseName || "课程签到",
      ...this.data.form,
      startTime: Date.now(),
      endTime: Date.now() + this.data.form.duration * 60 * 1000
    };
    this.setData({ submitting: true });
    attendanceService
      .startSign(payload)
      .then((batch) => {
        wx.showToast({ title: "签到已发起", icon: "success" });
        const targetBatchId = (batch && batch.batchId) || payload.batchId;
        wx.navigateTo({
          url: `/subpackages/teacher/pages/sign-monitor/index?batchId=${targetBatchId}&courseName=${encodeURIComponent(payload.courseName)}`
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "发起失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  }
});
