import {
	createApp,
	findAllApps,
	findAppById,
	updateApp,
	deleteApp,
} from "../repositories/app.repository";

interface CreateAppData {
	name: string;
	description: string;
	version: string;
}

export async function getAllApps() {
	return findAllApps();
}

export async function getAppById(id: number) {
	return findAppById(id);
}

export async function addApp(data: CreateAppData) {
	return createApp(data);
}

export async function updateAppById(id: number, data: Partial<CreateAppData>) {
	return updateApp(id, data);
}

export async function deleteAppById(id: number) {
	return deleteApp(id);
}
