# Errors

Command failures and integration errors.

---

## [ERR-20260915-001] apply_patch same-path replace

**Logged**: 2026-09-15T16:14:00-07:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
同一补丁内先删除再新增相同路径会被补丁工具拒绝。

### Error
```text
apply_patch verification failed: invalid patch: multiple operations target RegistrationDeskView.vue
```

### Context
- 重写现场挂号 Vue 页面时使用了同路径删除和新增操作。
- 文件在失败时未发生变化。

### Suggested Fix
将删除和新增拆分为两个补丁调用，或使用单个 Update File 补丁。

### Metadata
- Reproducible: yes
- Related Files: src/views/RegistrationDeskView.vue

### Resolution
- **Resolved**: 2026-09-15T16:15:00-07:00
- **Notes**: 拆分删除与新增操作后成功完成页面修改。

---

## [ERR-20260909-001] npm-install-sandbox-cache

**Logged**: 2026-09-09T13:30:00+08:00
**Priority**: medium
**Status**: resolved
**Area**: config

### Summary
Installing `lucide-vue-next` failed because npm could not write to its user cache inside the sandbox.

### Error

```text
EPERM: operation not permitted, mkdir C:\Users\Provias\AppData\Local\npm-cache\_cacache\tmp
```

### Context
- The dependency was required for the frontend icon system.
- The workspace itself was writable, but the npm cache directory was outside it.

### Suggested Fix
Retry the same npm install command with the required permission escalation.

### Metadata
- Reproducible: yes
- Related Files: package.json, package-lock.json

### Resolution
- **Resolved**: 2026-09-09T13:31:00+08:00
- **Notes**: The approved elevated install completed successfully.

---

## [ERR-20260909-002] oversized-apply-patch

**Logged**: 2026-09-09T13:35:00+08:00
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
An oversized multi-file patch failed because one replacement hunk did not match the original Vue file context.

### Error

```text
apply_patch verification failed: Failed to find expected lines in src/App.vue
```

### Context
- The first patch combined template deletion, configuration changes, and a large component replacement.
- No code from the failed patch was applied.

### Suggested Fix
Replace complete files in smaller delete-and-add patch batches.

### Metadata
- Reproducible: unknown
- Related Files: src/App.vue

### Resolution
- **Resolved**: 2026-09-09T13:37:00+08:00
- **Notes**: Smaller file-level patches applied successfully and the build passed.

---

## [ERR-20260913-API] admin-users-static-resource

**Logged**: 2026-09-13
**Priority**: high
**Status**: resolved
**Area**: frontend

### Summary
管理员账号查询接口返回 No static resource api/admin/users，导致管理员初始化请求失败。

### Suggested Fix
账号查询请求失败时不阻塞其他管理员模块，并在界面显示可理解的重试提示。

### Resolution
- **Resolved**: 2026-09-13
- **Notes**: 管理员工作台使用独立结果处理，账户查询 404 或静态资源错误只影响账户列表，并提供重新加载入口。

## [ERR-20260913-FRONT-APPOINTMENT-PATCH] apply-patch-target-conflict

**Logged**: 2026-09-13
**Priority**: low
**Status**: resolved
**Area**: frontend

### Summary
一次同时删除并新增同一路径 Vue 文件的补丁被工具拒绝，导致临时文件缺失。

### Resolution
改为分步应用删除和新增补丁，已恢复 `PatientAppointmentsView.vue` 与 `PatientAppointmentDetailView.vue`，并完成静态标签检查。

