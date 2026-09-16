# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## 2026-09-13

- **correction**: 登录后的页面入口必须由服务端返回的 `primary_role` 决定，患者与医生分流到各自预留页面，其他角色统一进入准备中页面，避免跳转到尚未实现的路径。
- **correction**: 面向普通用户的页面不展示接口、后端、开发阶段或内部角色标识等实现信息。
- **best_practice**: 落地页与登录页采用单栏或整幅内容布局，不使用左侧大段说明配右侧功能区的结构。

## [LRN-20260913-ACCESS] correction

**Logged**: 2026-09-13
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
登录用户需要从主页返回自己的工作台，管理员可访问各业务端页面。

### Details
路由守卫必须允许 ADMIN 访问患者、医生和挂号员页面，但不能伪造后端受限资料。

### Resolution
- **Resolved**: 2026-09-13
- **Notes**: 已放宽患者、医生路由角色元信息，管理员工作台增加三类业务页面入口；资料接口仍由后端校验。

## [LRN-20260913-SESSION] best_practice

**Logged**: 2026-09-13
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
本地 HTTP 调试时，后端 `Secure` 会话 Cookie 可能无法随请求发送，不能只依赖内存中的登录状态。

### Details
页面刷新或离开后重新进入时，前端需要保留不含密码的用户资料快照以恢复工作台入口；真实业务数据和权限仍必须由后端接口决定。

### Resolution
已在 `src/stores/auth.ts` 使用当前标签页 `sessionStorage` 保存和清理用户资料快照，并在账户查询静态资源错误时给出更新后端服务的提示。

## [LRN-20260914-REGISTRATION] correction

**Logged**: 2026-09-14
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
管理员创建挂号员账号需要独立页面、真实接口调用和账户列表角色筛选。

### Details
新增后端接口 `POST /api/admin/registrations` 只接收用户名和密码，成功响应中的 `profile_id` 可以为空。将创建入口直接塞入已有患者或医生表单会削弱小功能独立页面约定，也容易在成功后回显敏感密码。

### Resolution
- **Resolved**: 2026-09-14
- **Notes**: 新增 `/admin/users/create-registration` 独立页面，调用 `createAdminRegistration`，校验用户名和密码、成功后清空密码并展示账号编号；管理员账户列表增加挂号员筛选，侧栏分组索引同步修正。

### Metadata
- Source: user_feedback
- Related Files: `src/views/RegistrationAccountCreateView.vue`, `src/api/admin.ts`, `src/views/AdminHomeView.vue`, `src/components/WorkspaceLayout.vue`
- Tags: registration-account, admin, role-filter, input-validation

