<script setup>
import { onMounted, ref } from 'vue'
import { api } from './api.js'
import WelcomeEditor from './components/WelcomeEditor.vue'
import SuggestionEditor from './components/SuggestionEditor.vue'
import QuestionsEditor from './components/QuestionsEditor.vue'

const loading = ref(true)
const error = ref('')
const config = ref({
  first_questions: [],
  default_first_question: '',
  welcome_message: '',
  suggestion_override: '',
  suggestion_extra_guidelines: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    config.value = await api.getConfig()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function saveQuestions({ questions, defaultQuestion }) {
  const updated = await api.updateConfig({
    first_questions: questions,
    default_first_question: defaultQuestion,
  })
  config.value = updated
}

async function saveWelcome(text) {
  const updated = await api.updateConfig({ welcome_message: text })
  config.value = updated
}

async function saveSuggestion(patch) {
  const updated = await api.updateConfig(patch)
  config.value = updated
}

onMounted(load)
</script>

<template>
  <div class="page">
    <header>
      <h1>🔥 Fever Bot 後台</h1>
      <p class="subtitle">控制歡迎詞、輔導建議、第一題題庫</p>
    </header>

    <div v-if="loading" class="status">載入中…</div>
    <div v-else-if="error" class="status error">
      載入失敗：{{ error }}
      <button @click="load">重試</button>
    </div>
    <main v-else>
      <WelcomeEditor
        :welcome="config.welcome_message"
        @save="saveWelcome"
      />
      <SuggestionEditor
        :override="config.suggestion_override"
        :guidelines="config.suggestion_extra_guidelines"
        @save="saveSuggestion"
      />
      <QuestionsEditor
        :questions="config.first_questions"
        :default-question="config.default_first_question"
        @save="saveQuestions"
      />
    </main>
  </div>
</template>

<style scoped>
.page {
  max-width: 880px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

header h1 {
  margin: 0 0 4px;
  font-size: 28px;
}

.subtitle {
  margin: 0 0 32px;
  color: #6b7280;
}

.status {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  text-align: center;
}

.status.error {
  color: #b91c1c;
}

.status button {
  margin-left: 12px;
}

main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
