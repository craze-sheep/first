const { makeupRecordsMock } = require("../../../../mock/student");
const makeupService = require("../../../../services/makeup");

const formatDate = (timestamp) => {
  const date = new Date(timestamp || Date.now());
  const pad = (value) => (value < 10 ? `0${value}` : `${value}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const normalizeRecords = (records = []) =>
  records.map((item) => ({
    id: item.requestId || item._id,
    course: item.courseName || item.courseId || "未命名课程",
    date: formatDate(item.createdAt),
    status: item.status || "pending",
    reason: item.reason || "--",
    approver: item.approver || "待审核"
  }));

Page({
  data: {
    form: {
      course: "",
      type: "病假",
      reason: "",
      evidence: ""
    },
    submitting: false,
    records: makeupRecordsMock,
    types: ["病假", "事假", "公假"],
    loadingRecords: false
  },
  onShow() {
    this.fetchRecords();
  },
  handleInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: event.detail.value
    });
  },
  handleTypeChange(event) {
    const index = Number(event.detail.value);
    const nextType = this.data.types[index] || this.data.form.type;
    this.setData({
      "form.type": nextType
    });
  },
  handleSubmit() {
    if (!this.data.form.course || !this.data.form.reason) {
      wx.showToast({ title: "请填写完整信息", icon: "none" });
      return;
    }
    this.setData({ submitting: true });
    makeupService
      .submitRequest({
        courseName: this.data.form.course,
        type: this.data.form.type,
        reason: this.data.form.reason,
        evidence: this.data.form.evidence
      })
      .then(() => {
        wx.showToast({ title: "已提交", icon: "success" });
        this.resetForm();
        this.fetchRecords();
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "提交失败", icon: "none" });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },
  fetchRecords() {
    this.setData({ loadingRecords: true });
    makeupService
      .listStudentRequests()
      .then((list = []) => {
        const nextList = list.length ? normalizeRecords(list) : makeupRecordsMock;
        this.setData({ records: nextList });
      })
      .catch(() => {
        this.setData({ records: makeupRecordsMock });
      })
      .finally(() => this.setData({ loadingRecords: false }));
  },
  resetForm() {
    this.setData({
      form: {
        course: "",
        type: "病假",
        reason: "",
        evidence: ""
      }
    });
  }
});
