const { approvalListMock } = require("../../../../mock/teacher");
const makeupService = require("../../../../services/makeup");

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp || Date.now());
  const pad = (value) => (value < 10 ? `0${value}` : `${value}`);
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

Page({
  data: {
    approvals: approvalListMock,
    loading: false
  },
  onShow() {
    this.loadApprovals();
  },
  handleApprove(event) {
    const id = event.currentTarget.dataset.id;
    this.updateStatus(id, "approved");
  },
  handleReject(event) {
    const id = event.currentTarget.dataset.id;
    this.updateStatus(id, "rejected");
  },
  updateStatus(id, status) {
    wx.showLoading({ title: "提交中...", mask: true });
    makeupService
      .updateStatus({ requestId: id, status })
      .then(() => {
        wx.showToast({ title: "操作已记录", icon: "success" });
        this.setData({
          approvals: this.data.approvals.map((item) => (item.id === id ? { ...item, status } : item))
        });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "操作失败", icon: "none" });
      })
      .finally(() => {
        wx.hideLoading();
      });
  },
  loadApprovals() {
    this.setData({ loading: true });
    makeupService
      .listPendingRequests()
      .then((list = []) => {
        const normalized =
          list.length > 0
            ? list.map((item) => ({
                id: item.requestId || item._id,
                student: item.studentName,
                course: item.courseName,
                reason: item.reason,
                submittedAt: formatDateTime(item.createdAt),
                status: item.status || "pending"
              }))
            : approvalListMock;
        this.setData({ approvals: normalized });
      })
      .catch(() => {
        this.setData({ approvals: approvalListMock });
      })
      .finally(() => this.setData({ loading: false }));
  }
});
