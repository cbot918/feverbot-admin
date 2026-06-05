<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  override: { type: String, required: true },
  guidelines: { type: String, required: true },
})
const emit = defineEmits(['save'])

const draftOverride = ref('')
const draftGuidelines = ref('')
const saving = ref(false)
const message = ref('')
const messageType = ref('info')

watch(
  () => props.override,
  (v) => {
    draftOverride.value = v
  },
  { immediate: true }
)
watch(
  () => props.guidelines,
  (v) => {
    draftGuidelines.value = v
  },
  { immediate: true }
)

const overrideActive = computed(() => draftOverride.value.trim().length > 0)

const overridePreview = computed(() =>
  draftOverride.value.replace(/\{name\}/g, '俊彥 Yale')
)

async function save() {
  saving.value = true
  message.value = ''
  try {
    await emit('save', {
      suggestion_override: draftOverride.value,
      suggestion_extra_guidelines: draftGuidelines.value,
    })
    message.value = overrideActive.value
      ? '已儲存（目前啟用「指定回覆」，會略過 AI 生成）'
      : '已儲存（目前用 AI 生成 + 風格指引）'
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
    <h2>🎯 輔導完成後的建議</h2>
    <p class="hint">
      學員答完三題後，bot 會回覆「輔導建議」。可以二選一：<br />
      <strong>① 指定回覆</strong>：直接寫死要回什麼，<u>有填就用這個</u>，不打 AI。<br />
      <strong>② 風格指引</strong>：留給 AI 生成時參考的風格、補充規則。<u>當「指定回覆」是空的</u>才會用。
    </p>

    <div class="block" :class="{ active: overrideActive }">
      <label>
        <span class="label-row">
          ① 指定回覆
          <span v-if="overrideActive" class="badge on">目前啟用</span>
          <span v-else class="badge off">目前未啟用</span>
        </span>
        <textarea
          v-model="draftOverride"
          rows="6"
          placeholder="例如：感謝 {name} 完成輔導！請加 LINE @sales-coach 預約 1 對 1 諮詢。&#10;&#10;留空 = 不指定，改用下面的「風格指引」+ AI 生成"
        />
      </label>
      <details v-if="overrideActive" class="preview-wrap">
        <summary>預覽（{{ '{name}' }} 替換成「俊彥 Yale」）</summary>
        <pre class="preview">{{ overridePreview }}</pre>
      </details>
    </div>

    <div class="block" :class="{ dimmed: overrideActive }">
      <label>
        <span class="label-row">
          ② 風格指引（給 AI 看）
          <span v-if="overrideActive" class="badge off">已被指定回覆覆蓋</span>
        </span>
        <textarea
          v-model="draftGuidelines"
          rows="6"
          placeholder="例如：請在建議結尾推薦『銷售心法 21 天』線上課程&#10;避免使用否定句&#10;語氣要像鼓勵的教練"
        />
      </label>
    </div>

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
  margin: 0 0 20px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.8;
}

.hint u {
  text-decoration: underline;
  text-decoration-color: #facc15;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}

.block {
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: opacity 0.2s, border-color 0.2s, background 0.2s;
}

.block.active {
  background: #fffbeb;
  border-color: #facc15;
}

.block.dimmed {
  opacity: 0.55;
}

label {
  display: block;
}

.label-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1f2937;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 500;
}

.badge.on {
  background: #facc15;
  color: #78350f;
}

.badge.off {
  background: #e5e7eb;
  color: #6b7280;
}

textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
  font-family: inherit;
  line-height: 1.6;
  background: #fff;
}

textarea:focus {
  outline: none;
  border-color: #8b5cf6;
}

.preview-wrap {
  margin-top: 8px;
  background: #fff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
}

.preview-wrap summary {
  cursor: pointer;
  color: #6b7280;
}

.preview {
  margin: 6px 0 0;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
}

.actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}

.save {
  background: #8b5cf6;
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
