<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowRight, CalendarDays, ChevronDown, ClipboardList, UserRound } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import { useAuth } from '@/stores/auth'
import heroImage from '@/assets/clark-hospital-hero.jpg'

const { currentUser, isAuthenticated, rolePath, restoreSession } = useAuth()
const workspacePath = computed(() => currentUser.value ? rolePath(currentUser.value.primary_role) : '/')
onMounted(() => {
  void restoreSession()
})
</script>

<template>
  <div class="home-page">
    <section class="home-hero" aria-labelledby="home-title">
      <img :src="heroImage" alt="整洁明亮的医院接待大厅" />
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p>CLARK 医院预约挂号</p>
        <h1 id="home-title"><span>CLARK</span><small>让就诊安排更简单</small></h1>
        <p class="hero-copy">从创建患者账号开始，清晰完成每一步就诊准备。</p>
        <RouterLink v-if="isAuthenticated && currentUser" class="hero-action" :to="workspacePath">
          返回我的工作台
          <ArrowRight :size="19" :stroke-width="1.8" />
        </RouterLink>
        <RouterLink v-else class="hero-action" to="/register">
          创建患者账号
          <ArrowRight :size="19" :stroke-width="1.8" />
        </RouterLink>
      </div>
      <a class="hero-more" href="#services" aria-label="查看患者服务">
        <span>患者服务</span>
        <ChevronDown :size="18" :stroke-width="1.7" />
      </a>
    </section>

    <section id="services" class="service-section" aria-labelledby="service-title">
      <header class="section-header">
        <div>
          <p>从这里开始</p>
          <h2 id="service-title">患者服务</h2>
        </div>
        <p>首次使用请先创建患者账号，填写本人信息后即可完成建档。</p>
      </header>

      <div class="service-list">
        <RouterLink v-if="isAuthenticated && currentUser" class="service-item is-active" :to="workspacePath">
          <span class="service-icon"><UserRound :size="24" :stroke-width="1.6" /></span>
          <span class="service-number">01</span>
          <div>
            <h3>返回我的工作台</h3>
            <p>继续处理当前账号的事项</p>
          </div>
          <ArrowRight class="service-arrow" :size="21" :stroke-width="1.7" />
        </RouterLink>

        <RouterLink v-else class="service-item is-active" to="/register">
          <span class="service-icon"><UserRound :size="24" :stroke-width="1.6" /></span>
          <span class="service-number">01</span>
          <div>
            <h3>新患者注册</h3>
            <p>创建账号并登记患者信息</p>
          </div>
          <ArrowRight class="service-arrow" :size="21" :stroke-width="1.7" />
        </RouterLink>

        <RouterLink class="service-item is-active" :to="isAuthenticated ? '/patient/schedules' : '/login'">
          <span class="service-icon"><CalendarDays :size="24" :stroke-width="1.6" /></span>
          <span class="service-number">02</span>
          <div>
            <h3>预约挂号</h3>
            <p>选择科室、医生与就诊时间</p>
          </div>
          <ArrowRight class="service-arrow" :size="21" :stroke-width="1.7" />
        </RouterLink>

        <RouterLink class="service-item is-active" :to="isAuthenticated ? '/patient/appointments' : '/login'">
          <span class="service-icon"><ClipboardList :size="24" :stroke-width="1.6" /></span>
          <span class="service-number">03</span>
          <div>
            <h3>预约查询</h3>
            <p>查看预约信息与就诊安排</p>
          </div>
          <ArrowRight class="service-arrow" :size="21" :stroke-width="1.7" />
        </RouterLink>
      </div>
    </section>

    <section class="assurance-section" aria-label="服务特点">
      <div>
        <strong>信息清晰</strong>
        <p>重要信息集中呈现，减少查找步骤。</p>
      </div>
      <div>
        <strong>操作简单</strong>
        <p>按照页面提示填写，即可完成患者建档。</p>
      </div>
      <div>
        <strong>安心使用</strong>
        <p>请使用本人真实信息，方便就诊时核验。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: min(100% - 48px, 1360px);
  margin: 24px auto 72px;
}

.home-hero {
  position: relative;
  height: min(740px, calc(100vh - 110px));
  min-height: 540px;
  color: #fff;
  background: #34413c;
  border-radius: 8px;
  overflow: hidden;
}

.home-hero > img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center 48%;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 24, 21, 0.58);
}

.hero-content {
  position: absolute;
  inset: 0;
  padding: 72px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.hero-content > p:first-child {
  font-size: 12px;
  font-weight: 650;
}

.hero-content h1 {
  max-width: 760px;
  margin: 24px 0 0;
  display: grid;
  gap: 10px;
  font-family: var(--font-serif);
  font-weight: 400;
  line-height: 1;
}

.hero-content h1 span {
  font-size: clamp(68px, 9vw, 132px);
}

.hero-content h1 small {
  font-size: clamp(30px, 4vw, 54px);
  font-weight: 400;
}

.hero-copy {
  max-width: 480px;
  margin-top: 28px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 15px;
  line-height: 1.8;
}

.hero-action {
  min-height: 50px;
  margin-top: 36px;
  padding: 0 22px;
  display: inline-flex;
  align-items: center;
  gap: 28px;
  color: var(--primary);
  background: var(--surface);
  border: 1px solid var(--surface);
  border-radius: 5px;
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease;
}

.hero-action:hover {
  color: var(--surface);
  background: transparent;
}

.hero-more {
  position: absolute;
  right: 40px;
  bottom: 32px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  text-decoration: none;
}

.service-section {
  padding: 96px 48px 40px;
  scroll-margin-top: 76px;
}

.section-header {
  padding-bottom: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 48px;
  border-bottom: 1px solid var(--border-strong);
}

.section-header > div > p {
  color: var(--primary);
  font-size: 12px;
  font-weight: 650;
}

.section-header h2 {
  margin-top: 10px;
  font-family: var(--font-serif);
  font-size: 42px;
  font-weight: 500;
}

.section-header > p {
  max-width: 430px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.8;
}

.service-list {
  display: grid;
}

.service-item {
  min-height: 124px;
  padding: 24px 0;
  display: grid;
  grid-template-columns: 48px 42px 1fr auto;
  align-items: center;
  gap: 24px;
  color: var(--ink);
  border-bottom: 1px solid var(--border);
  text-decoration: none;
}

.service-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  color: var(--primary);
  background: var(--primary-soft);
  border-radius: 6px;
}

.service-number {
  color: var(--faint);
  font-family: var(--font-serif);
  font-size: 13px;
}

.service-item h3 {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 550;
}

.service-item p {
  margin-top: 7px;
  color: var(--muted);
  font-size: 13px;
}

.service-arrow {
  color: var(--primary);
  transition: transform 180ms ease;
}

.service-item.is-active:hover .service-arrow {
  transform: translateX(5px);
}

.service-item.is-disabled {
  color: var(--muted);
  opacity: 0.64;
}

.service-state {
  color: var(--faint);
  font-size: 12px;
}

.assurance-section {
  margin: 56px 48px 0;
  padding: 32px 0 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  border-top: 1px solid var(--border-strong);
}

.assurance-section strong {
  font-family: var(--font-serif);
  font-size: 19px;
  font-weight: 600;
}

.assurance-section p {
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 800px) {
  .home-page {
    width: calc(100% - 28px);
    margin-top: 14px;
  }

  .home-hero {
    height: calc(100vh - 104px);
    min-height: 560px;
  }

  .home-hero > img {
    object-position: 62% center;
  }

  .hero-content {
    padding: 40px 28px;
    justify-content: flex-end;
    padding-bottom: 96px;
  }

  .hero-content h1 span {
    font-size: 64px;
  }

  .hero-content h1 small {
    font-size: 31px;
    line-height: 1.25;
  }

  .hero-more {
    right: 24px;
    bottom: 24px;
  }

  .service-section {
    padding: 72px 10px 24px;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .service-item {
    grid-template-columns: 46px 1fr auto;
    gap: 16px;
  }

  .service-number {
    display: none;
  }

  .service-state {
    max-width: 48px;
    text-align: right;
  }

  .assurance-section {
    margin: 36px 10px 0;
    grid-template-columns: 1fr;
    gap: 28px;
  }
}
</style>
