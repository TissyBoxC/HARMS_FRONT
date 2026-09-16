<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ArrowLeft, Check, CircleAlert, Save } from 'lucide-vue-next'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import WorkspaceLayout from '@/components/WorkspaceLayout.vue'
import { ApiError } from '@/api/http'
import { getAdminDepartment, updateDepartment } from '@/api/department'
import { useAuth } from '@/stores/auth'
const route = useRoute()
const router = useRouter()
const { currentUser } = useAuth()
const isDepartmentOnly = computed(() => currentUser.value?.primary_role !== 'ADMIN')
const loading = ref(true)
const saving = ref(false)
const notice = ref('')
const errorMessage = ref('')
const form = reactive({ parent_id: null as number | null, name: '', code: '', description: '', location: '', contact_phone: '', sort_no: 0, status: 1 })
onMounted(async () => {
  try {
    const item = await getAdminDepartment(Number(route.params.id))
    Object.assign(form, { parent_id: item.parent_id, name: item.name, code: item.code, description: item.description || '', location: item.location || '', contact_phone: item.contact_phone || '', sort_no: item.sort_no, status: item.status })
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '科室信息加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
})
const save = async () => {
  notice.value = ''
  errorMessage.value = ''
  saving.value = true
  try {
    await updateDepartment(Number(route.params.id), { ...form, parent_id: form.parent_id || null })
    notice.value = '科室资料已保存'
    await router.replace(isDepartmentOnly.value ? '/department/home' : '/admin/departments')
  } catch (error) {
    errorMessage.value = error instanceof ApiError ? error.message : '保存失败，请稍后重试。'
  } finally {
    saving.value = false
  }
}
</script>
<template>
  <WorkspaceLayout :role="isDepartmentOnly ? 'department' : 'admin'">
    <div class="edit-page">
      <RouterLink class="back" :to="isDepartmentOnly ? '/department/home' : '/admin/departments'"><ArrowLeft :size="16" />返回科室列表</RouterLink>
      <header><p>科室管理</p><h1>编辑科室</h1></header>
      <div v-if="loading" class="state">正在加载科室资料…</div>
      <template v-else>
        <div v-if="notice" class="notice success"><Check :size="16" />{{ notice }}</div>
        <div v-if="errorMessage" class="notice error"><CircleAlert :size="16" />{{ errorMessage }}</div>
        <form class="form" @submit.prevent="save">
          <label>上级科室编号<input v-model.number="form.parent_id" type="number" min="1" /></label>
          <label>科室名称<input v-model="form.name" required maxlength="100" /></label>
          <label>科室编码<input v-model="form.code" required maxlength="50" /></label>
          <label>所在位置<input v-model="form.location" maxlength="255" /></label>
          <label>联系电话<input v-model="form.contact_phone" maxlength="20" /></label>
          <label>排序号<input v-model.number="form.sort_no" type="number" min="0" required /></label>
          <label>状态<select v-model.number="form.status"><option :value="1">启用</option><option :value="0">停用</option></select></label>
          <label class="wide">科室介绍<textarea v-model="form.description" rows="4" maxlength="500"></textarea></label>
          <button class="primary wide" type="submit" :disabled="saving"><Save :size="16" />{{ saving ? '保存中' : '保存科室' }}</button>
        </form>
      </template>
    </div>
  </WorkspaceLayout>
</template>
<style scoped>
.edit-page{max-width:960px}.back{display:inline-flex;align-items:center;gap:7px;color:#2563eb;font-size:13px;text-decoration:none}.edit-page header{margin:28px 0 24px}.edit-page header p{color:#2563eb;font-size:12px;font-weight:700}.edit-page h1{margin-top:8px;font-size:30px}.form{padding:26px;display:grid;grid-template-columns:repeat(2,1fr);gap:18px;background:#fff;border:1px solid #e2e8f0;border-radius:9px}.form label{display:grid;gap:7px;color:#475569;font-size:12px;font-weight:600}.form input,.form select,.form textarea{min-height:42px;padding:0 11px;background:#f8fafc;border:1px solid #dbe3ec;border-radius:6px}.form textarea{padding-top:10px;resize:vertical}.wide{grid-column:1/-1}.primary{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:7px;color:#fff;background:#2563eb;border:0;border-radius:6px;cursor:pointer}.notice{margin-bottom:16px;padding:12px 14px;display:flex;gap:8px;align-items:center;border-radius:7px;font-size:13px}.notice.success{color:#166534;background:#dcfce7}.notice.error{color:#b91c1c;background:#fee2e2}.state{padding:48px;color:#64748b;text-align:center}@media(max-width:620px){.form{grid-template-columns:1fr;padding:18px}.wide{grid-column:auto}}
</style>
