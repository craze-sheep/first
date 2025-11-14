const counselorService = require("../../../../services/counselor");
const { alertsMock } = require("../../../../mock/counselor");

Page({
  data: {
    list: alertsMock,
    loading: false,
    selecting: false,
    selectedIds: []
  },
  onShow() {
    this.fetchAlerts();
  },
  fetchAlerts() {
    this.setData({ loading: true });
    counselorService
      .fetchAlerts()
      .then((data) => {
        if (data && data.length) {
          this.setData({ list: data });
        } else {
          this.setData({ list: alertsMock });
        }
      })
      .catch(() => {
        this.setData({ list: alertsMock });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },
  handleStudentTap(event) {
    if (this.data.selecting) return;
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/subpackages/counselor/pages/student-detail/index?studentId=${id}`
    });
  },
  handleToggleSelect() {
    this.setData({
      selecting: !this.data.selecting,
      selectedIds: []
    });
  },
  handleSelectChange(event) {
    this.setData({
      selectedIds: event.detail.value || []
    });
  },
  handleBulkResolve() {
    if (!this.data.selectedIds.length) {
      wx.showToast({ title: "请选择需要处理的预警", icon: "none" });
      return;
    }
    counselorService
      .updateAlertStatus({ ids: this.data.selectedIds, status: "closed" })
      .then(() => {
        wx.showToast({ title: "已批量处理", icon: "success" });
        this.fetchAlerts();
        this.setData({ selecting: false, selectedIds: [] });
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "处理失败", icon: "none" });
      });
  },
  handleResolveSingle(event) {
    const id = event.currentTarget.dataset.id;
    counselorService
      .updateAlertStatus({ alertId: id, status: "closed" })
      .then(() => {
        wx.showToast({ title: "已处理", icon: "success" });
        this.fetchAlerts();
      })
      .catch((err) => {
        wx.showToast({ title: err.message || "操作失败", icon: "none" });
      });
  }
});
