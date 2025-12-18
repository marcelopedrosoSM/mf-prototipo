
import { Condition } from '@/types/flow-builder';

// Tipos auxiliares locais
export type ConditionOperator =
    | '===' | '!==' | '==' | '!='
    | '>' | '<' | '>=' | '<='
    | 'contains' | 'starts_with' | 'ends_with'
    | 'empty' | 'not_empty';

export type ConditionValueType = 'literal' | 'variable';

export interface FlowContext {
    variables: Record<string, unknown>;
    currentBlockId?: string | null;
}

/**
 * Avalia condições de um bloco Switch (Decisão)
 * 
 * @param conditions Lista de condições configuradas no bloco
 * @param context Contexto de execução (variáveis)
 * @returns ID do handle (ex: 'switch-0') se uma condição for satisfeita, ou null
 */
export function evaluateSwitch(conditions: Condition[], context: FlowContext): string | null {
    const vars = context.variables || {};

    console.debug('[FlowExec] 🔍 Iniciando avaliação:', { conditions, variables: vars });

    // Helper para avaliar expressões de forma segura
    const safeEvaluate = (expr: string, vars: Record<string, unknown>): boolean => {
        if (!expr || typeof expr !== 'string') return false;

        const trimmed = expr.trim();

        // Pattern for simple variable access: vars.varName
        const simpleVarPattern = /^vars\.([a-zA-Z_][a-zA-Z0-9_]*)$/;
        const simpleMatch = trimmed.match(simpleVarPattern);
        if (simpleMatch) {
            const value = vars[simpleMatch[1]];
            return !!value;
        }

        // Pattern for comparisons: vars.varName OPERATOR value
        const comparisonPattern = /^vars\.([a-zA-Z_][a-zA-Z0-9_]*)\s*(===|!==|==|!=|>|<|>=|<=)\s*(.+)$/;
        const compMatch = trimmed.match(comparisonPattern);
        if (compMatch) {
            const varName = compMatch[1];
            const operator = compMatch[2];
            let rightSide = compMatch[3].trim();

            const leftValue = vars[varName];
            let rightValue: unknown;

            // Suportar comparação variável-variável (vars.var1 === vars.var2)
            if (rightSide.startsWith('vars.')) {
                const otherVarMatch = rightSide.match(/^vars\.([a-zA-Z_][a-zA-Z0-9_]*)$/);
                if (otherVarMatch) {
                    rightValue = vars[otherVarMatch[1]];
                }
            } else {
                // Parse right side value safely
                if (rightSide === 'true') rightValue = true;
                else if (rightSide === 'false') rightValue = false;
                else if (rightSide === 'null') rightValue = null;
                else if (rightSide === 'undefined') rightValue = undefined;
                else if (/^-?\d+(\.\d+)?$/.test(rightSide)) rightValue = Number(rightSide);
                else if (/^"([^"]*)"$/.test(rightSide)) rightValue = rightSide.slice(1, -1);
                else if (/^'([^']*)'$/.test(rightSide)) rightValue = rightSide.slice(1, -1);
                else rightValue = rightSide; // Fallback
            }

            let comparisonResult: boolean;
            switch (operator) {
                case '===': comparisonResult = leftValue === rightValue; break;
                case '!==': comparisonResult = leftValue !== rightValue; break;
                case '==': comparisonResult = leftValue == rightValue; break;
                case '!=': comparisonResult = leftValue != rightValue; break;
                case '>': comparisonResult = (leftValue as number) > (rightValue as number); break;
                case '<': comparisonResult = (leftValue as number) < (rightValue as number); break;
                case '>=': comparisonResult = (leftValue as number) >= (rightValue as number); break;
                case '<=': comparisonResult = (leftValue as number) <= (rightValue as number); break;
                default: comparisonResult = false; break;
            }

            return comparisonResult;
        }

        // Pattern for includes: String(vars.varName).includes("value")
        const includesPattern = /^String\(vars\.([a-zA-Z_][a-zA-Z0-9_]*)\)\.includes\((.*?)\)$/;
        const includesMatch = trimmed.match(includesPattern);
        if (includesMatch) {
            const varName = includesMatch[1];
            const searchValue = includesMatch[2].trim().replace(/^["']|["']$/g, '');
            const varValue = String(vars[varName] || '');
            return varValue.includes(searchValue);
        }

        // Pattern for empty check
        // !vars.varName || ...
        if (trimmed.startsWith('!vars.') || trimmed.includes('=== ""')) {
            // Simplificado: tenta extrair nome da variável
            const varMatch = trimmed.match(/vars\.([a-zA-Z_][a-zA-Z0-9_]*)/);
            if (varMatch) {
                const val = vars[varMatch[1]];
                return !val || val === '';
            }
        }

        return false;
    };

    for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i];

        // Tentar avaliar usando a estrutura explicita se disponível
        if (condition.variable && condition.operator) {
            const varValue = vars[condition.variable];
            const op = condition.operator;
            let match = false;

            // Determinar valor de comparação
            let compareValue: any = condition.literalValue || condition.value;
            if (condition.valueType === 'variable' && typeof compareValue === 'string') {
                compareValue = vars[compareValue] || '';
            }

            const strVar = String(varValue ?? ''); // Treat null/undefined as empty string for safety
            const strCompare = String(compareValue ?? '');

            switch (op) {
                case '===': match = strVar === strCompare; break;
                case '!==': match = strVar !== strCompare; break;
                case 'contains': match = strVar.includes(strCompare); break;
                case 'starts_with': match = strVar.startsWith(strCompare); break;
                case 'ends_with': match = strVar.endsWith(strCompare); break;
                case 'empty': match = !varValue || strVar.trim() === ''; break;
                case 'not_empty': match = !!varValue && strVar.trim() !== ''; break;
                // Fallback para operadores numéricos se valores forem números
                case '>': match = Number(varValue) > Number(compareValue); break;
                case '<': match = Number(varValue) < Number(compareValue); break;
                case '>=': match = Number(varValue) >= Number(compareValue); break;
                case '<=': match = Number(varValue) <= Number(compareValue); break;
                default: match = strVar == strCompare;
            }

            if (match) {
                console.debug(`[FlowExec] ✅ Condição ${i} satisfeita:`, condition.label);
                return `switch-${i}`;
            }
        }
        // Fallback: avaliar expressão string legacy (ex: vars.idade > 18)
        else if (condition.value && safeEvaluate(condition.value, vars)) {
            console.debug(`[FlowExec] ✅ Condição ${i} (expressão) satisfeita:`, condition.value);
            return `switch-${i}`;
        }
    }

    console.debug('[FlowExec] ❌ Nenhuma condição satisfeita');
    return null;
}
