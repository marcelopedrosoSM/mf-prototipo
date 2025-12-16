<script setup lang="ts">
import { computed } from 'vue';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useVueFlow } from '@vue-flow/core';
import type { EdgeProps } from '@vue-flow/core';

const props = defineProps<EdgeProps>();
const { removeEdges } = useVueFlow();

const [edgePath, labelX, labelY] = getSmoothStepPath({
  sourceX: props.sourceX,
  sourceY: props.sourceY,
  sourcePosition: props.sourcePosition,
  targetX: props.targetX,
  targetY: props.targetY,
  targetPosition: props.targetPosition,
});

const wasExecuted = computed(() => props.data?.wasExecuted || false);
const isExecuting = computed(() => props.data?.isExecuting || false);

// Determinar cor e marker baseado no estado
const edgeStyle = computed(() => {
  let color = '#b1b1b7'; // Cinza padrão
  let strokeWidth = 2;
  let activeMarkerEnd = 'url(#default-marker)';

  if (isExecuting.value) {
    // Linha em execução - cor verde para consistência com o bloco executando
    color = '#10b981'; // Verde
    strokeWidth = 3;
    activeMarkerEnd = 'url(#executing-marker)';
  } else if (wasExecuted.value) {
    // Linha entre blocos executados - cor mais suave
    color = '#10b981'; // Verde
    strokeWidth = 2.5;
    activeMarkerEnd = 'url(#executed-marker)';
  } else if (props.selected) {
    // Linha selecionada
    color = '#2563EB';
    strokeWidth = 3;
    activeMarkerEnd = 'url(#selected-marker)';
  }

  return {
    color,
    strokeWidth,
    markerEnd: activeMarkerEnd,
  };
});

// Função para excluir a edge
const onEdgeClick = () => {
  removeEdges([props.id]);
};
</script>

<template>
  <g>
    <!-- Definição dos markers SVG customizados -->
    <svg style="position: absolute; top: 0; left: 0; width: 0; height: 0">
      <defs>
        <!-- Marker padrão (cinza) -->
        <marker
          id="default-marker"
          markerWidth="12"
          markerHeight="12"
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            stroke-width="1"
            stroke="#b1b1b7"
            fill="#b1b1b7"
            stroke-linecap="round"
            stroke-linejoin="round"
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>

        <!-- Marker quando selecionado (azul) -->
        <marker
          id="selected-marker"
          markerWidth="12"
          markerHeight="12"
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            stroke-width="1.5"
            stroke="#2563EB"
            fill="#2563EB"
            stroke-linecap="round"
            stroke-linejoin="round"
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>

        <!-- Marker para linhas executadas (verde) -->
        <marker
          id="executed-marker"
          markerWidth="12"
          markerHeight="12"
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            stroke-width="1.5"
            stroke="#10b981"
            fill="#10b981"
            stroke-linecap="round"
            stroke-linejoin="round"
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>

        <!-- Marker para linhas em execução (verde) -->
        <marker
          id="executing-marker"
          markerWidth="12"
          markerHeight="12"
          viewBox="-10 -10 20 20"
          markerUnits="strokeWidth"
          orient="auto-start-reverse"
          refX="0"
          refY="0"
        >
          <polyline
            stroke-width="2"
            stroke="#10b981"
            fill="#10b981"
            stroke-linecap="round"
            stroke-linejoin="round"
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>
      </defs>
    </svg>

    <!-- Edge principal -->
    <BaseEdge
      :id="id"
      :path="edgePath"
      :marker-end="edgeStyle.markerEnd"
      :style="{
        stroke: edgeStyle.color,
        strokeWidth: edgeStyle.strokeWidth,
      }"
    />

    <!-- Botão de exclusão -->
    <EdgeLabelRenderer>
      <div
        :style="{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          pointerEvents: 'all',
        }"
        class="nodrag nopan"
      >
        <!-- Botão de deletar (aparece ao hover ou quando selecionado) -->
        <button
          v-if="selected"
          @click="onEdgeClick"
          class="edge-delete-button"
          :class="{ 'opacity-100': selected, 'opacity-0 group-hover:opacity-100': !selected }"
          title="Excluir conexão"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Label (se existir) -->
        <div
          v-if="label"
          class="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-700 shadow-sm mt-6"
        >
          {{ label }}
        </div>
      </div>
    </EdgeLabelRenderer>
  </g>
</template>

<style scoped>
.edge-delete-button {
  width: 20px;
  height: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.edge-delete-button:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
  transform: scale(1.1);
}

.dark .edge-delete-button {
  background: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}

.dark .edge-delete-button:hover {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}
</style>
