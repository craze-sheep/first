const BASE_URL = "https://mock.smart-attendance.local";

const request = (options = {}) => {
  const app = getApp();
  const headers = Object.assign({}, options.header, {
    Authorization: app && app.globalData && app.globalData.token ? `Bearer ${app.globalData.token}` : ""
  });

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: options.url && options.url.startsWith("http") ? options.url : `${BASE_URL}${options.url}`,
      header: headers,
      success(res) {
        if ((res.statusCode ?? 500) >= 400) {
          if (!options.silent) {
            wx.showToast({ title: res.errMsg || "请求失败", icon: "none" });
          }
          reject(res);
          return;
        }
        resolve(res);
      },
      fail(err) {
        if (!options.silent) {
          wx.showToast({ title: "网络异常", icon: "none" });
        }
        reject(err);
      }
    });
  });
};

module.exports = {
  request
};
