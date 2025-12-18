/**
 * Tipos para configuração de Horário de Atendimento
 * Portado de painel-base/src/types/config-inicial.ts
 */

export interface HorarioDia {
    ativo: boolean;
    horarioInicio: string;
    horarioFim: string;
}

export interface HorarioFuncionamento {
    [key: string]: boolean | string | HorarioDia | string[];
    ativo: boolean;
    seg: HorarioDia;
    ter: HorarioDia;
    qua: HorarioDia;
    qui: HorarioDia;
    sex: HorarioDia;
    sab: HorarioDia;
    dom: HorarioDia;
    mensagemForaHorario: string;
    inativoFeriados: boolean;
    diasInatividade?: string[]; // Array de datas no formato "MM-DD"
}

export const DIAS_SEMANA = [
    { id: 'seg', label: 'Segunda-feira' },
    { id: 'ter', label: 'Terça-feira' },
    { id: 'qua', label: 'Quarta-feira' },
    { id: 'qui', label: 'Quinta-feira' },
    { id: 'sex', label: 'Sexta-feira' },
    { id: 'sab', label: 'Sábado' },
    { id: 'dom', label: 'Domingo' },
] as const;

export const DEFAULT_HORARIO_DIA: HorarioDia = {
    ativo: false,
    horarioInicio: '09:00',
    horarioFim: '18:00',
};

export function getDefaultHorarioFuncionamento(): HorarioFuncionamento {
    return {
        ativo: false,
        seg: { ativo: true, horarioInicio: '09:00', horarioFim: '18:00' },
        ter: { ativo: true, horarioInicio: '09:00', horarioFim: '18:00' },
        qua: { ativo: true, horarioInicio: '09:00', horarioFim: '18:00' },
        qui: { ativo: true, horarioInicio: '09:00', horarioFim: '18:00' },
        sex: { ativo: true, horarioInicio: '09:00', horarioFim: '18:00' },
        sab: { ativo: false, horarioInicio: '09:00', horarioFim: '13:00' },
        dom: { ativo: false, horarioInicio: '09:00', horarioFim: '13:00' },
        mensagemForaHorario: 'Estamos fora do horário de atendimento. Retornaremos assim que possível.',
        inativoFeriados: false,
        diasInatividade: [],
    };
}
