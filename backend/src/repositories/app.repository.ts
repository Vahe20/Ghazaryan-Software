import { prisma } from "../config/prisma";

export interface CreateAppData {
	name: string;
	description: string;
	version: string;
}

export async function findAllApps() {
	return prisma.apps.findMany({
		orderBy: {
			createdAt: "desc",
		},
	});
}

export async function findAppById(id: number) {
	return prisma.apps.findUnique({
		where: { id },
	});
}

export async function createApp(data: CreateAppData) {
	return prisma.apps.create({
		data,
	});
}

export async function updateApp(id: number, data: Partial<CreateAppData>) {
	return prisma.apps.update({
		where: { id },
		data,
	});
}

export async function deleteApp(id: number) {
	return prisma.apps.delete({
		where: { id },
	});
}
