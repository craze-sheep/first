const counselorService = require("../../../../services/counselor");
const { overviewMock } = require("../../../../mock/counselor");

Page({
  data: {
    overview: overviewMock,
    loading: false
  },
  onShow() {
    this.loadOverview();
  },
  loadOverview() {
    this.setData({ loading: true });
    counselorService
      .fetchDashboard()
      .then((data) => {
        if (data) {
          this.setData({ overview: data });
        }
      })
      .catch(() => {
        this.setData({ overview: overviewMock });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },
  handleViewAlerts() {
    wx.navigateTo({
      url: "/subpackages/counselor/pages/alerts/index"
    });
  }
});
