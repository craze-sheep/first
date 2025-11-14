const { teacherCoursesMock } = require("../../../../mock/teacher");
const { getDB } = require("../../../../services/cloud");

Page({
  data: {
    courses: teacherCoursesMock,
    keyword: ""
  },
  onShow() {
    this.loadCourses();
  },
  handleInput(event) {
    this.setData({ keyword: event.detail.value });
  },
  handleStartSign(event) {
    const id = event.currentTarget.dataset.id;
    const name = event.currentTarget.dataset.name;
    wx.navigateTo({
      url: `/subpackages/teacher/pages/sign-launch/index?courseId=${id}&courseName=${encodeURIComponent(name || "")}`
    });
  },
  handleViewStats(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/subpackages/teacher/pages/course-detail/index?courseId=${id}&courseName=${encodeURIComponent(name || "")}`
    });
  },
  loadCourses() {
    const db = getDB();
    if (!db) {
      this.setData({ courses: teacherCoursesMock });
      return;
    }
    db.collection("courses")
      .get()
      .then((res) => {
        const data = (res && res.data) || [];
        const courses = data.map((course) => {
          const scheduleList = course.schedule || [];
          const firstSchedule = scheduleList[0] || {};
          const scheduleText = scheduleList.length
            ? scheduleList.map((slot) => `周${slot.weekday} ${slot.time}`).join(" / ")
            : "时间待定";
          return {
            id: course._id || course.courseId,
            name: course.name,
            clazz: course.clazz || "未关联班级",
            schedule: scheduleText,
            location: firstSchedule.location || "地点待定",
            attendanceRate: course.attendanceRate || "--"
          };
        });
        if (courses.length) {
          this.setData({ courses });
        } else {
          this.setData({ courses: teacherCoursesMock });
        }
      })
      .catch(() => {
        this.setData({ courses: teacherCoursesMock });
      });
  }
});
