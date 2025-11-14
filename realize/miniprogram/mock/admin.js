const adminOverviewMock = {
  userTotal: 4200,
  teacherTotal: 180,
  counselorTotal: 24,
  pendingApprovals: 6,
  lastDeploy: "2025-11-10 22:30",
  logs: [
    { id: "log-01", action: "导入学生数据 2201班", operator: "admin01", time: "11-12 09:20" },
    { id: "log-02", action: "发布 1.0.5 版本", operator: "ops02", time: "11-11 18:02" }
  ]
};

const adminUsersMock = [
  { id: "stu_001", name: "李明", role: "学生", dept: "计算机学院", status: "active" },
  { id: "tch_001", name: "王老师", role: "教师", dept: "数学学院", status: "active" },
  { id: "csl_001", name: "赵敏", role: "辅导员", dept: "计算机学院", status: "inactive" }
];

const adminCoursesMock = [
  { id: "course_001", name: "高等数学", teacher: "王老师", clazz: "计科 2201", defaultMode: "标准模式" },
  { id: "course_002", name: "数据结构", teacher: "刘老师", clazz: "计科 2202", defaultMode: "高安全模式" }
];

module.exports = {
  adminOverviewMock,
  adminUsersMock,
  adminCoursesMock
};
