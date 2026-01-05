import { faker } from '@faker-js/faker';
import type { ContactHistoryItem, ContactHistoryType } from '@/types/contacts';

export function generateMockHistory(contactId: number, count = 10): ContactHistoryItem[] {
    const history: ContactHistoryItem[] = [];

    for (let i = 0; i < count; i++) {
        const type = faker.helpers.arrayElement(['chat', 'activity', 'note', 'system']) as ContactHistoryType;
        let title = '';
        let description = '';
        let metadata = {};

        switch (type) {
            case 'chat':
                title = faker.helpers.arrayElement(['Conversa via WhatsApp', 'Atendimento via Instagram', 'Email recebido']);
                description = faker.lorem.sentence();
                metadata = { channel: faker.helpers.arrayElement(['whatsapp', 'instagram', 'email']) };
                break;
            case 'activity':
                title = faker.helpers.arrayElement(['Ligação realizada', 'Reunião agendada', 'Tarefa concluída']);
                description = faker.helpers.arrayElement(['Cliente interessado', 'Remarcar semana que vem', 'Enviado proposta']);
                metadata = { status: faker.helpers.arrayElement(['done', 'pending', 'cancelled']) };
                break;
            case 'note':
                title = 'Nota adicionada';
                description = faker.lorem.paragraph(1);
                break;
            case 'system':
                title = 'Sistema';
                description = faker.helpers.arrayElement(['Contato criado', 'Etiqueta "Lead Quente" adicionada', 'Atribuído a João Silva']);
                break;
        }

        history.push({
            id: faker.string.uuid(),
            contactId,
            type,
            title,
            description,
            date: faker.date.recent({ days: 30 }),
            metadata,
            authorName: type !== 'system' ? 'Você' : undefined
        });
    }

    return history.sort((a, b) => b.date.getTime() - a.date.getTime());
}
