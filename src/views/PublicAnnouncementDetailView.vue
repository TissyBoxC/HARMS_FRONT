<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, CircleAlert } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { ApiError } from '@/api/http'
import { getPublicAnnouncement } from '@/api/announcement'
const route = useRoute(); const item = ref<Record<string, unknown> | null>(null); const loading = ref(true); const errorMessage = ref('')
onMounted(async () => { try { item.value = await getPublicAnnouncement(Number(route.params.id)) } catch (error) { errorMessage.value = error instanceof ApiError ? error.message : '公告加载失败，请稍后重试。' } finally { loading.value = false } })
</script>
<template><div class="page"><RouterLink class="back" to="/announcements"><ArrowLeft :size="16" />返回公告列表</RouterLink><div v-if="loading" class="state">正在加载公告…</div><div v-else-if="errorMessage" class="notice"><CircleAlert :size="16" />{{ errorMessage }}</div><article v-else-if="item"><p>医院公告</p><h1>{{ item.title }}</h1><small>{{ item.published_at || item.created_at || '' }}</small><div class="content">{{ item.content }}</div></article></div></template>
<style scoped>.page{width:min(100% - 40px,860px);margin:0 auto;padding:58px 0}.back{display:inline-flex;align-items:center;gap:7px;color:var(--primary);text-decoration:none;font-size:13px}.page article{margin-top:28px;padding:30px;background:var(--surface-strong);border:1px solid var(--border);border-radius:8px}.page article>p{color:var(--primary);font-size:12px;font-weight:700}.page h1{margin-top:11px;font-family:var(--font-serif);font-size:34px}.page small{display:block;margin-top:8px;color:var(--muted);font-size:12px}.content{margin-top:26px;color:var(--ink);font-size:14px;line-height:1.9;white-space:pre-wrap}.state{padding:48px;color:var(--muted);text-align:center}.notice{margin-top:28px;padding:12px;display:flex;gap:7px;color:var(--danger);background:var(--danger-soft);border-radius:6px}</style>
