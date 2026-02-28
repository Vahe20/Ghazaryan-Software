import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Ghazaryan Software API",
			version: "1.0.0",
			description: "REST API documentation",
		},
		servers: [{ url: "/api" }],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
			schemas: {
				Pagination: {
					type: "object",
					properties: {
						page: { type: "integer" },
						limit: { type: "integer" },
						total: { type: "integer" },
						totalPages: { type: "integer" },
					},
				},
				User: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						email: { type: "string", format: "email" },
						userName: { type: "string" },
						role: { type: "string", enum: ["USER", "DEVELOPER", "ADMIN"] },
						balance: { type: "number" },
						avatarUrl: { type: "string", nullable: true },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				App: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						name: { type: "string" },
						slug: { type: "string" },
						shortDesc: { type: "string" },
						description: { type: "string" },
						version: { type: "string" },
						changelog: { type: "string", nullable: true },
						iconUrl: { type: "string" },
						coverUrl: { type: "string", nullable: true },
						screenshots: { type: "array", items: { type: "string" } },
						price: { type: "number" },
						rating: { type: "number" },
						downloadCount: { type: "integer" },
						viewCount: { type: "integer" },
						status: { type: "string", enum: ["BETA", "RELEASE"] },
						platform: { type: "array", items: { type: "string" } },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				AppEdition: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						appId: { type: "string", format: "uuid" },
						name: { type: "string" },
						description: { type: "string", nullable: true },
						price: { type: "number" },
						downloadUrl: { type: "string" },
						features: { type: "array", items: { type: "string" } },
						isDefault: { type: "boolean" },
						isActive: { type: "boolean" },
					},
				},
				AppPromotion: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						appId: { type: "string", format: "uuid" },
						editionId: { type: "string", format: "uuid", nullable: true },
						discountAmount: { type: "number", nullable: true },
						discountPercent: { type: "integer", nullable: true },
						label: { type: "string", nullable: true },
						startsAt: { type: "string", format: "date-time" },
						endsAt: { type: "string", format: "date-time" },
						isActive: { type: "boolean" },
					},
				},
				AppVersion: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						appId: { type: "string", format: "uuid" },
						version: { type: "string" },
						changelog: { type: "string" },
						downloadUrl: { type: "string" },
						size: { type: "integer" },
						isStable: { type: "boolean" },
						releaseDate: { type: "string", format: "date-time" },
					},
				},
				Review: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						appId: { type: "string", format: "uuid" },
						userId: { type: "string", format: "uuid" },
						rating: { type: "integer", minimum: 1, maximum: 5 },
						title: { type: "string", nullable: true },
						comment: { type: "string" },
						helpful: { type: "integer" },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				DeveloperRequest: {
					type: "object",
					properties: {
						id: { type: "string", format: "uuid" },
						userId: { type: "string", format: "uuid" },
						reason: { type: "string" },
						portfolio: { type: "string", nullable: true },
						status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
						reviewedAt: { type: "string", format: "date-time", nullable: true },
						createdAt: { type: "string", format: "date-time" },
					},
				},
				Error: {
					type: "object",
					properties: {
						error: {
							type: "object",
							properties: {
								code: { type: "string" },
								message: { type: "string" },
							},
						},
					},
				},
			},
		},
		tags: [
			{ name: "Auth", description: "Authentication & user profile" },
			{ name: "Apps", description: "Applications catalog" },
			{ name: "Editions", description: "App editions (e.g. Free, Standard, Premium)" },
			{ name: "Promotions", description: "App discounts and sales" },
			{ name: "Versions", description: "App update history" },
			{ name: "Reviews", description: "User reviews" },
			{ name: "Developer Requests", description: "Requests for developer role" },
			{ name: "Categories", description: "App categories" },
			{ name: "Payment", description: "Purchases" },
			{ name: "News", description: "Platform news" },
		],
		paths: {
			"/auth/me": {
				get: {
					tags: ["Auth"],
					summary: "Get current user",
					security: [{ bearerAuth: [] }],
					responses: {
						200: { description: "Current user data", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
						401: { description: "Unauthorized" },
					},
				},
			},
			"/auth/register": {
				post: {
					tags: ["Auth"],
					summary: "Register new user",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["email", "userName", "password"],
									properties: {
										email: { type: "string", format: "email" },
										userName: { type: "string" },
										password: { type: "string", minLength: 8 },
									},
								},
							},
						},
					},
					responses: {
						201: { description: "User created" },
						409: { description: "User already exists" },
					},
				},
			},
			"/auth/login": {
				post: {
					tags: ["Auth"],
					summary: "Login",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["email", "password"],
									properties: {
										email: { type: "string", format: "email" },
										password: { type: "string" },
									},
								},
							},
						},
					},
					responses: {
						200: { description: "Access token and user data" },
						401: { description: "Invalid credentials" },
					},
				},
			},
			"/auth/avatar": {
				patch: {
					tags: ["Auth"],
					summary: "Update avatar",
					security: [{ bearerAuth: [] }],
					requestBody: {
						required: true,
						content: {
							"multipart/form-data": {
								schema: {
									type: "object",
									properties: {
										avatar: { type: "string", format: "binary" },
									},
								},
							},
						},
					},
					responses: {
						200: { description: "Avatar updated", content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" }, avatarUrl: { type: "string" } } } } } },
						401: { description: "Unauthorized" },
					},
				},
			},
			"/auth/password": {
				patch: {
					tags: ["Auth"],
					summary: "Change password",
					security: [{ bearerAuth: [] }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["currentPassword", "newPassword"],
									properties: {
										currentPassword: { type: "string" },
										newPassword: { type: "string", minLength: 8 },
									},
								},
							},
						},
					},
					responses: { 200: { description: "Password changed" }, 401: { description: "Unauthorized" } },
				},
			},
			"/apps": {
				get: {
					tags: ["Apps"],
					summary: "List all apps",
					parameters: [
						{ name: "page", in: "query", schema: { type: "integer", default: 1 } },
						{ name: "limit", in: "query", schema: { type: "integer", default: 20 } },
						{ name: "search", in: "query", schema: { type: "string" } },
						{ name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
						{ name: "status", in: "query", schema: { type: "string", enum: ["BETA", "RELEASE"] } },
						{ name: "platform", in: "query", schema: { type: "string", enum: ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"] } },
						{ name: "sortBy", in: "query", schema: { type: "string", default: "createdAt" } },
						{ name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
					],
					responses: { 200: { description: "Paginated apps list" } },
				},
				post: {
					tags: ["Apps"],
					summary: "Create app (Admin)",
					security: [{ bearerAuth: [] }],
					requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
					responses: { 201: { description: "App created" }, 403: { description: "Forbidden" } },
				},
			},
			"/apps/library": {
				get: {
					tags: ["Apps"],
					summary: "Get current user library",
					security: [{ bearerAuth: [] }],
					responses: { 200: { description: "User library" }, 401: { description: "Unauthorized" } },
				},
			},
			"/apps/{id}": {
				get: {
					tags: ["Apps"],
					summary: "Get app by ID",
					parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					responses: { 200: { description: "App data" }, 404: { description: "Not found" } },
				},
				put: {
					tags: ["Apps"],
					summary: "Update app (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
					responses: { 200: { description: "Updated app" }, 403: { description: "Forbidden" } },
				},
				delete: {
					tags: ["Apps"],
					summary: "Delete app (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					responses: { 200: { description: "App deleted" }, 403: { description: "Forbidden" } },
				},
			},
			"/apps/{appId}/editions": {
				get: {
					tags: ["Editions"],
					summary: "List editions for an app",
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					responses: { 200: { description: "Editions list" } },
				},
				post: {
					tags: ["Editions"],
					summary: "Create edition (Admin/Developer)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["name", "price", "downloadUrl"],
									properties: {
										name: { type: "string" },
										description: { type: "string" },
										price: { type: "number" },
										downloadUrl: { type: "string" },
										features: { type: "array", items: { type: "string" } },
										isDefault: { type: "boolean" },
										isActive: { type: "boolean" },
									},
								},
							},
						},
					},
					responses: { 201: { description: "Edition created" } },
				},
			},
			"/apps/{appId}/editions/{editionId}": {
				patch: {
					tags: ["Editions"],
					summary: "Update edition (Admin/Developer)",
					security: [{ bearerAuth: [] }],
					parameters: [
						{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
						{ name: "editionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
					],
					requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/AppEdition" } } } },
					responses: { 200: { description: "Edition updated" } },
				},
				delete: {
					tags: ["Editions"],
					summary: "Delete edition (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [
						{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
						{ name: "editionId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
					],
					responses: { 200: { description: "Edition deleted" } },
				},
			},
			"/apps/{appId}/promotions": {
				get: {
					tags: ["Promotions"],
					summary: "List promotions for an app",
					parameters: [
						{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
						{ name: "active", in: "query", schema: { type: "boolean" } },
					],
					responses: { 200: { description: "Promotions list" } },
				},
				post: {
					tags: ["Promotions"],
					summary: "Create promotion (Admin/Developer)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["startsAt", "endsAt"],
									properties: {
										editionId: { type: "string", format: "uuid" },
										discountAmount: { type: "number" },
										discountPercent: { type: "integer" },
										label: { type: "string" },
										startsAt: { type: "string", format: "date-time" },
										endsAt: { type: "string", format: "date-time" },
										isActive: { type: "boolean" },
									},
								},
							},
						},
					},
					responses: { 201: { description: "Promotion created" } },
				},
			},
			"/apps/{appId}/versions": {
				get: {
					tags: ["Versions"],
					summary: "Get app version history",
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					responses: { 200: { description: "Version list" } },
				},
				post: {
					tags: ["Versions"],
					summary: "Add new version (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: {
						required: true,
						content: {
							"multipart/form-data": {
								schema: {
									type: "object",
									required: ["file", "version", "changelog"],
									properties: {
										file: { type: "string", format: "binary" },
										version: { type: "string", example: "1.2.0" },
										changelog: { type: "string" },
										isStable: { type: "boolean" },
									},
								},
							},
						},
					},
					responses: { 201: { description: "Version created" } },
				},
			},
			"/apps/{appId}/reviews": {
				get: {
					tags: ["Reviews"],
					summary: "Get app reviews",
					parameters: [
						{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
						{ name: "page", in: "query", schema: { type: "integer", default: 1 } },
						{ name: "limit", in: "query", schema: { type: "integer", default: 20 } },
						{ name: "rating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
						{ name: "sortBy", in: "query", schema: { type: "string" } },
						{ name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
					],
					responses: { 200: { description: "Reviews list" } },
				},
				post: {
					tags: ["Reviews"],
					summary: "Create review (requires purchase for paid apps)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "appId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["rating", "comment"],
									properties: {
										rating: { type: "integer", minimum: 1, maximum: 5 },
										title: { type: "string" },
										comment: { type: "string" },
									},
								},
							},
						},
					},
					responses: { 201: { description: "Review created" }, 403: { description: "App not owned" }, 409: { description: "Already reviewed" } },
				},
			},
			"/reviews/{reviewId}": {
				patch: {
					tags: ["Reviews"],
					summary: "Update own review",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "reviewId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
					responses: { 200: { description: "Review updated" } },
				},
				delete: {
					tags: ["Reviews"],
					summary: "Delete review (own or Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "reviewId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					responses: { 200: { description: "Review deleted" } },
				},
			},
			"/developer-requests": {
				get: {
					tags: ["Developer Requests"],
					summary: "List all requests (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } }],
					responses: { 200: { description: "Requests list" } },
				},
				post: {
					tags: ["Developer Requests"],
					summary: "Submit developer role request",
					security: [{ bearerAuth: [] }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["reason"],
									properties: {
										reason: { type: "string", minLength: 50 },
										portfolio: { type: "string", format: "uri" },
									},
								},
							},
						},
					},
					responses: { 201: { description: "Request submitted" }, 409: { description: "Already has role or pending request" } },
				},
			},
			"/developer-requests/me": {
				get: {
					tags: ["Developer Requests"],
					summary: "Get own developer request",
					security: [{ bearerAuth: [] }],
					responses: { 200: { description: "Own request or null" } },
				},
			},
			"/developer-requests/{requestId}/review": {
				patch: {
					tags: ["Developer Requests"],
					summary: "Approve or reject request (Admin)",
					security: [{ bearerAuth: [] }],
					parameters: [{ name: "requestId", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									required: ["status"],
									properties: {
										status: { type: "string", enum: ["APPROVED", "REJECTED"] },
									},
								},
							},
						},
					},
					responses: { 200: { description: "Request reviewed, role granted if approved" } },
				},
			},
		},
	},
	apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
