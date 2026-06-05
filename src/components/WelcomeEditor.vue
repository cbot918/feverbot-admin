<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  welcome: { type: String, required: true },
})
const emit = defineEmits(['save'])

const draft = ref('')
const saving = ref(false)
const message = ref('')
const messageType = ref('info')

watch(
  () => props.welcome,
  (val) => {
    draft.value = val
  },
  { immediate: true }
)

const preview = computed(() =>
  draft.value.replace(/\{name\}/g, '俊彥 Yale')
)

async function save() {
  saving.value = true
  message.value = ''
  try {
    await emit('save', draft.value)
    message.value = '已儲存'
    messageType.value = 'success'
  } catch (e) {
    message.value = e.message
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="card">
    <h2>👋 開場歡迎詞</h2>
    <p class="hint">
      學員輸入「開始輔導」後，最先看到的訊息。<br />
      用 <code>{{ '{name}' }}</code> 當作學員顯示名稱的變數，系統會自動替換。<br />
      第一題會接在歡迎詞下面（格式：<code>第1題：\n題目</code>），不需要在這裡加。
    </p>

    <textarea
      v-model="draft"
      rows="5"
      placeholder="嗨 {name}！我是你的銷售輔導助手 🔥…"
    />

    <details class="preview-wrap">
      <summary>預覽（變數 {{ '{name}' }} 會被替換成「俊彥 Yale」）</summary>
      <pre class="preview">{{ preview }}</pre>
    </details>

    <div class="actions">
      <button class="save" :disabled="saving" @click="save">
        {{ saving ? '儲存中…' : '儲存' }}
      </button>
    </div>

    <div v-if="message" :class="['msg', messageType]">{{ message }}</div>
  </section>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

h2 {
  margin: 0 0 8px;
}

.hint {
  margin: 0 0 16px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.hint code {
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
  color: #1f2937;
  font-size: 13px;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
}

textarea:focus {
  outline: none;
  border-color: #06c755;
}

.preview-wrap {
  margin-top: 12px;
  background: #f9fafb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
}

.preview-wrap summary {
  cursor: pointer;
  color: #4b5563;
}

.preview {
  margin: 8px 0 0;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
}

.actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.save {
  background: #06c755;
  color: #fff;
  border: none;
  padding: 8px 24px;
  border-radius: 6px;
  font-weight: 600;
}

.save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.msg {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
}

.msg.success {
  background: #dcfce7;
  color: #166534;
}

.msg.error {
  background: #fee2e2;
  color: #991b1b;
}
</style>
