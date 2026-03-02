import { BaseRepository } from "./base.repository.js";

type WebhookEvents = {
    id: string;
    eventId: string;
    eventType: string;
    payload: string;
    processed: boolean;
    createdAt: Date;
};

export class WebhookRepository extends BaseRepository<WebhookEvents> {
    async findById(id: string) {
        return (this.prisma as any).webhookEvents.findUnique({
            where: { id },
        });
    }

    async findByEventId(eventId: string) {
        return (this.prisma as any).webhookEvents.findUnique({
            where: { eventId },
        });
    }

    async findMany(options?: any) {
        return (this.prisma as any).webhookEvents.findMany(options);
    }

    async create(data: { eventId: string; eventType: string; payload: string }) {
        return (this.prisma as any).webhookEvents.create({
            data: {
                ...data,
                processed: false,
            },
        });
    }

    async markAsProcessed(eventId: string) {
        return (this.prisma as any).webhookEvents.update({
            where: { eventId },
            data: { processed: true },
        });
    }

    async update(id: string, data: any) {
        return (this.prisma as any).webhookEvents.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return (this.prisma as any).webhookEvents.delete({
            where: { id },
        });
    }
}

export const webhookRepository = new WebhookRepository();
