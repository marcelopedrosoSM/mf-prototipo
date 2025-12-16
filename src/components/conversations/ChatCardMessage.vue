<template>
  <div class="flex items-center text-xs text-muted-foreground gap-1">
    <component
      v-if="lastMessage.senderType === 'user'"
      :is="ReplyIcon"
      class="h-4 w-4 text-primary mr-1 flex-shrink-0"
    />
    <component v-if="hasAttachments" :is="attachmentIcon" class="h-5 w-5 flex-shrink-0" />
    <span class="truncate max-w-[280px] leading-normal">{{ messageText }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Reply, Image, Headphones, FileText, Video } from 'lucide-vue-next';
import type { Message } from '@/types/conversations';

interface Props {
  lastMessage: Message;
}

const props = defineProps<Props>();

const ReplyIcon = Reply;

const hasAttachments = computed(() => {
  return props.lastMessage.attachments && props.lastMessage.attachments.length > 0;
});

const attachmentType = computed(() => {
  if (!hasAttachments.value || !props.lastMessage.attachments) return null;
  const [attachment] = props.lastMessage.attachments;
  return attachment.type;
});

const messageText = computed(() => {
  if (hasAttachments.value) {
    const textAttachments: Record<string, string> = {
      image: 'Imagem',
      audio: 'Mensagem de áudio',
      file: 'Documento',
      video: 'Vídeo',
    };
    return textAttachments[attachmentType.value || ''] || 'Anexo';
  }
  return props.lastMessage.content || '';
});

const attachmentIcon = computed(() => {
  const icons: Record<string, any> = {
    image: Image,
    audio: Headphones,
    file: FileText,
    video: Video,
  };
  return icons[attachmentType.value || ''] || FileText;
});
</script>

