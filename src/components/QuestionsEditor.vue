<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  questions: { type: Array, required: true },
  defaultQuestion: { type: String, required: true },
})
const emit = defineEmits(['save'])

const draft = ref([])
const defaultIndex = ref(-1)
const saving = ref(false)
const message = ref('')
const messageType = ref('info')

function syncFromProps() {
  draft.value = props.questions.map((q) => q)
  const idx = props.defaultQuestion
    ? props.questions.indexOf(props.defaultQuestion)
    : -1
  defaultIndex.value = idx
}

watch(
  () => [props.questions, props.defaultQuestion],
  syncFromProps,
  { immediate: true, deep: true }
)

function addRow() {
  draft.value.push('')
}

function removeRow(index) {
  draft.value.splice(index, 1)
  if (defaultIndex.value === index) {
    defaultIndex.value = -1
  } else if (defaultIndex.value > index) {
    defaultIndex.value -= 1
  }
}

function setDefault(index) {
  defaultIndex.value = defaultIndex.value === index ? -1 : index
}

async function save() {
  saving.value = true
  message.value = ''
  try {
    // Clean while remembering which (uncleaned) row was the default
    const defaultText =
      defaultIndex.value >= 0 ? (draft.value[defaultIndex.value] || '').trim() : ''
    const cleaned = draft.value.map((q) => q.trim()).filter(Boolean)

    if (cleaned.length === 0) {
      const ok = window.confirm(
        '題庫為空，儲存後第一題會 fallback 回程式內建題庫。確定？'
      )
      if (!ok) {
        saving.value = false
        return
      }
    }

    await emit('save', {
      questions: cleaned,
      defaultQuestion: cleaned.includes(defaultText) ? defaultText : '',
    })
    message.value = defaultText
      ? `已儲存 ${cleaned.length} 題，預設：「${defaultText.slice(0, 20)}${defaultText.length > 20 ? '…' : ''}」`
      : `已儲存 ${cleaned.length} 題（未指定預設 → 隨機）`
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
    <h2>📋 第一題題庫</h2>
    <p class="hint">
      勾選某一題為 <strong>🌟 預設</strong> → Q1 每次都問這題。<br />
      不勾任何一題 → Q1 從題庫隨機抽（若題庫為空，fallback 回程式內建題庫）。
    </p>

    <ul class="list">
      <li
        v-for="(q, i) in draft"
        :key="i"
        :class="['row', { selected: defaultIndex === i }]"
      >
        <label class="radio-wrap" :title="defaultIndex === i ? '取消預設' : '設為預設'">
          <input
            type="radio"
            :checked="defaultIndex === i"
            @click="setDefault(i)"
          />
        </label>
        <span class="num">{{ i + 1 }}.</span>
        <textarea v-model="draft[i]" rows="2" placeholder="輸入一題開場問題…" />
        <span v-if="defaultIndex === i" class="badge">🌟 預設</span>
        <button class="del" @click="removeRow(i)" title="刪除">✕</button>
      </li>
    </ul>

    <div class="actions">
      <button class="add" @click="addRow">+ 新增題目</button>
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
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid transparent;
}

.row.selected {
  background: #fffbeb;
  border-color: #facc15;
}

.radio-wrap {
  padding-top: 10px;
  display: flex;
}

.radio-wrap input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #facc15;
}

.num {
  width: 24px;
  padding-top: 8px;
  color: #9ca3af;
  text-align: right;
}

textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
}

textarea:focus {
  outline: none;
  border-color: #06c755;
}

.badge {
  align-self: center;
  padding: 4px 10px;
  background: #facc15;
  color: #78350f;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.del {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 16px;
  border-radius: 6px;
}

.del:hover {
  background: #fee2e2;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.add {
  background: transparent;
  border: 1px dashed #9ca3af;
  color: #4b5563;
  padding: 8px 16px;
  border-radius: 6px;
}

.add:hover {
  border-color: #06c755;
  color: #06c755;
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
