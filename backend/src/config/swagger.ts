import swaggerJsdoc from "swagger-jsdoc";

const uuidParam = (name: string): object => ({
    name,
    in: "path",
    required: true,
    schema: { type: "string", format: "uuid" },
});

const bearerAuth = [{ bearerAuth: [] }];

const pagingParams = [
    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
    { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
];

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ghazaryan Software API",
            version: "1.0.0",
            description: "Full REST API documentation",
        },
        servers: [{ url: "/api/v1" }],
        components: {
            securitySchemes: {
                bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
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
                        isBanned: { type: "boolean" },
                        bannedUntil: { type: "string", format: "date-time", nullable: true },
                        banReason: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        lastLoginAt: { type: "string", format: "date-time", nullable: true },
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
                        version: { type: "string", example: "1.0.0" },
                        changelog: { type: "string", nullable: true },
                        iconUrl: { type: "string" },
                        coverUrl: { type: "string", nullable: true },
                        screenshots: { type: "array", items: { type: "string" } },
                        categoryId: { type: "string", format: "uuid" },
                        tags: { type: "array", items: { type: "string" } },
                        size: { type: "integer" },
                        price: { type: "number" },
                        rating: { type: "number" },
                        downloadCount: { type: "integer" },
                        viewCount: { type: "integer" },
                        reviewCount: { type: "integer" },
                        status: { type: "string", enum: ["BETA", "RELEASE"] },
                        featured: { type: "boolean" },
                        platform: { type: "array", items: { type: "string", enum: ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"] } },
                        downloadUrl: { type: "string" },
                        sourceUrl: { type: "string", nullable: true },
                        documentationUrl: { type: "string", nullable: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time", nullable: true },
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
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
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
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                AppVersion: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        appId: { type: "string", format: "uuid" },
                        version: { type: "string", example: "1.2.0" },
                        changelog: { type: "string" },
                        downloadUrl: { type: "string" },
                        size: { type: "integer" },
                        status: { type: "string", enum: ["BETA", "RELEASE"], default: "BETA" },
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
                        updatedAt: { type: "string", format: "date-time" },
                        user: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                userName: { type: "string" },
                                avatarUrl: { type: "string", nullable: true },
                            },
                        },
                    },
                },
                Category: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        slug: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Purchase: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        userId: { type: "string", format: "uuid" },
                        appId: { type: "string", format: "uuid" },
                        editionId: { type: "string", format: "uuid", nullable: true },
                        price: { type: "number" },
                        status: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] },
                        paymentMethod: { type: "string", nullable: true },
                        transactionId: { type: "string", nullable: true },
                        purchasedAt: { type: "string", format: "date-time" },
                        expiresAt: { type: "string", format: "date-time", nullable: true },
                    },
                },
                NewsItem: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        description: { type: "string" },
                        tag: { type: "string" },
                        tagColor: { type: "string", enum: ["BLUE", "PINK", "PURPLE", "GREEN"] },
                        coverUrl: { type: "string", nullable: true },
                        link: { type: "string", nullable: true },
                        publishedAt: { type: "string", format: "date-time" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
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
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                DashboardStats: {
                    type: "object",
                    properties: {
                        overview: {
                            type: "object",
                            properties: {
                                totalUsers: { type: "integer" },
                                totalApps: { type: "integer" },
                                totalPurchases: { type: "integer" },
                                totalRevenue: { type: "number" },
                                recentUsers: { type: "integer" },
                                recentPurchases: { type: "integer" },
                            },
                        },
                        changes: {
                            type: "object",
                            properties: {
                                userChange: { type: "number" },
                                purchaseChange: { type: "number" },
                                revenueChange: { type: "number" },
                                appChange: { type: "number" },
                            },
                        },
                        topApps: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    name: { type: "string" },
                                    slug: { type: "string" },
                                    iconUrl: { type: "string" },
                                    downloadCount: { type: "integer" },
                                    rating: { type: "number" },
                                    price: { type: "number" },
                                },
                            },
                        },
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
            { name: "Auth" },
            { name: "Apps" },
            { name: "Versions" },
            { name: "Reviews" },
            { name: "Editions" },
            { name: "Promotions" },
            { name: "Categories" },
            { name: "Payment" },
            { name: "News" },
            { name: "Admin" },
            { name: "Upload" },
            { name: "Developer Requests" },
        ],
        paths: {
            "/auth/me": {
                get: {
                    tags: ["Auth"],
                    summary: "Get current authenticated user",
                    security: bearerAuth,
                    responses: {
                        200: { description: "User data", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
                    },
                },
            },
            "/auth/register": {
                post: {
                    tags: ["Auth"],
                    summary: "Register a new user",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["email", "userName", "password"],
                                    properties: {
                                        email: { type: "string", format: "email" },
                                        userName: { type: "string", minLength: 3 },
                                        password: { type: "string", minLength: 8 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "User registered" },
                        409: { description: "Email or username already taken" },
                        422: { description: "Validation error" },
                    },
                },
            },
            "/auth/login": {
                post: {
                    tags: ["Auth"],
                    summary: "Login and receive JWT token",
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
                        200: {
                            description: "Login successful",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            accessToken: { type: "string" },
                                            refreshToken: { type: "string" },
                                            user: { $ref: "#/components/schemas/User" },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: "Invalid credentials or account blocked" },
                    },
                },
            },
            "/auth/password": {
                patch: {
                    tags: ["Auth"],
                    summary: "Change password",
                    security: bearerAuth,
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
                    responses: {
                        200: { description: "Password changed successfully" },
                        401: { description: "Current password is incorrect" },
                    },
                },
            },
            "/auth/avatar": {
                patch: {
                    tags: ["Auth"],
                    summary: "Update profile avatar",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    required: ["avatar"],
                                    properties: {
                                        avatar: { type: "string", format: "binary", description: "JPEG, PNG or WebP, max 5 MB" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Avatar updated",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string", format: "uuid" },
                                            avatarUrl: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "File missing or invalid format" },
                    },
                },
            },
            "/auth/account": {
                delete: {
                    tags: ["Auth"],
                    summary: "Delete own account",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["password"],
                                    properties: { password: { type: "string" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Account deleted" },
                        401: { description: "Wrong password" },
                    },
                },
            },
            "/auth/google": {
                get: {
                    tags: ["Auth"],
                    summary: "Initiate Google OAuth flow",
                    responses: { 302: { description: "Redirect to Google" } },
                },
            },
            "/auth/google/callback": {
                get: {
                    tags: ["Auth"],
                    summary: "Google OAuth callback",
                    responses: { 302: { description: "Redirect to frontend with token" } },
                },
            },
            "/apps": {
                get: {
                    tags: ["Apps"],
                    summary: "Get all apps (paginated)",
                    parameters: [
                        ...pagingParams,
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "categoryId", in: "query", schema: { type: "string", format: "uuid" } },
                        { name: "status", in: "query", schema: { type: "string", enum: ["BETA", "RELEASE"] } },
                        { name: "platform", in: "query", schema: { type: "string", enum: ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"] } },
                        { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "updatedAt", "downloadCount", "rating", "name"], default: "createdAt" } },
                        { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
                    ],
                    responses: {
                        200: {
                            description: "Paginated apps",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            apps: { type: "array", items: { $ref: "#/components/schemas/App" } },
                                            pagination: { $ref: "#/components/schemas/Pagination" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Apps"],
                    summary: "Create a new app (Admin)",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name", "shortDesc", "description", "version", "iconUrl", "screenshots", "categoryId", "tags", "size", "platform", "downloadUrl"],
                                    properties: {
                                        name: { type: "string" },
                                        slug: { type: "string" },
                                        shortDesc: { type: "string", maxLength: 200 },
                                        description: { type: "string" },
                                        version: { type: "string", example: "1.0.0" },
                                        changelog: { type: "string" },
                                        iconUrl: { type: "string" },
                                        coverUrl: { type: "string" },
                                        screenshots: { type: "array", items: { type: "string" } },
                                        categoryId: { type: "string", format: "uuid" },
                                        tags: { type: "array", items: { type: "string" } },
                                        size: { type: "integer" },
                                        platform: { type: "array", items: { type: "string" } },
                                        downloadUrl: { type: "string" },
                                        sourceUrl: { type: "string" },
                                        documentationUrl: { type: "string" },
                                        status: { type: "string", enum: ["BETA", "RELEASE"], default: "BETA" },
                                        price: { type: "number", default: 0 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "App created", content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
                        403: { description: "Forbidden — Admin only" },
                        409: { description: "Slug already exists" },
                    },
                },
            },
            "/apps/library": {
                get: {
                    tags: ["Apps"],
                    summary: "Get current user's purchased apps",
                    security: bearerAuth,
                    parameters: [
                        ...pagingParams,
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "sortBy", in: "query", schema: { type: "string", default: "purchasedAt" } },
                        { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
                    ],
                    responses: {
                        200: { description: "User library" },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/apps/slug/{slug}": {
                get: {
                    tags: ["Apps"],
                    summary: "Get app by slug",
                    parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        200: { description: "App data", content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
                        404: { description: "Not found" },
                    },
                },
            },
            "/apps/{id}": {
                get: {
                    tags: ["Apps"],
                    summary: "Get app by ID",
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "App data", content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
                        404: { description: "Not found" },
                    },
                },
                put: {
                    tags: ["Apps"],
                    summary: "Update app (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/App" } } } },
                    responses: {
                        200: { description: "Updated app" },
                        403: { description: "Forbidden" },
                        404: { description: "Not found" },
                    },
                },
                delete: {
                    tags: ["Apps"],
                    summary: "Soft-delete app (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "App deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/apps/{id}/download": {
                post: {
                    tags: ["Apps"],
                    summary: "Record a download event",
                    parameters: [uuidParam("id")],
                    requestBody: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        version: { type: "string" },
                                        platform: { type: "string", enum: ["WINDOWS", "MAC", "LINUX", "ANDROID", "IOS"] },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "Download recorded" } },
                },
            },
            "/apps/{appId}/versions": {
                get: {
                    tags: ["Versions"],
                    summary: "Get version history of an app",
                    parameters: [uuidParam("appId")],
                    responses: {
                        200: {
                            description: "Versions list",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/AppVersion" } },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Versions"],
                    summary: "Add a new version (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId")],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    required: ["file", "version", "changelog"],
                                    properties: {
                                        file: { type: "string", format: "binary" },
                                        version: { type: "string", example: "1.2.0", description: "Format X.Y.Z" },
                                        changelog: { type: "string", minLength: 10 },
                                        status: { type: "string", enum: ["BETA", "RELEASE"], default: "BETA" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Version created", content: { "application/json": { schema: { $ref: "#/components/schemas/AppVersion" } } } },
                        403: { description: "Forbidden" },
                        409: { description: "Version already exists" },
                    },
                },
            },
            "/apps/{appId}/reviews": {
                get: {
                    tags: ["Reviews"],
                    summary: "Get reviews for an app",
                    parameters: [
                        uuidParam("appId"),
                        ...pagingParams,
                        { name: "rating", in: "query", schema: { type: "integer", minimum: 1, maximum: 5 } },
                        { name: "sortBy", in: "query", schema: { type: "string", enum: ["createdAt", "rating", "helpful"], default: "createdAt" } },
                        { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
                    ],
                    responses: {
                        200: {
                            description: "Paginated reviews",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            reviews: { type: "array", items: { $ref: "#/components/schemas/Review" } },
                                            pagination: { $ref: "#/components/schemas/Pagination" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Reviews"],
                    summary: "Submit a review (purchase required for paid apps)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["rating", "comment"],
                                    properties: {
                                        rating: { type: "integer", minimum: 1, maximum: 5 },
                                        title: { type: "string", maxLength: 100 },
                                        comment: { type: "string", minLength: 10, maxLength: 1000 },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Review created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
                        403: { description: "App not purchased (paid apps only)" },
                        409: { description: "Already reviewed this app" },
                    },
                },
            },
            "/reviews/{reviewId}": {
                patch: {
                    tags: ["Reviews"],
                    summary: "Update own review",
                    security: bearerAuth,
                    parameters: [uuidParam("reviewId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        rating: { type: "integer", minimum: 1, maximum: 5 },
                                        title: { type: "string" },
                                        comment: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Review updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
                        403: { description: "Not your review" },
                        404: { description: "Review not found" },
                    },
                },
                delete: {
                    tags: ["Reviews"],
                    summary: "Delete own review (Admin can delete any)",
                    security: bearerAuth,
                    parameters: [uuidParam("reviewId")],
                    responses: {
                        200: { description: "Review deleted" },
                        403: { description: "Not your review" },
                        404: { description: "Review not found" },
                    },
                },
            },
            "/apps/{appId}/editions": {
                get: {
                    tags: ["Editions"],
                    summary: "List editions for an app",
                    parameters: [uuidParam("appId")],
                    responses: {
                        200: {
                            description: "Editions list",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/AppEdition" } },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Editions"],
                    summary: "Create edition (Admin / Developer)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name", "price", "downloadUrl"],
                                    properties: {
                                        name: { type: "string", example: "Standard" },
                                        description: { type: "string" },
                                        price: { type: "number", minimum: 0 },
                                        downloadUrl: { type: "string" },
                                        features: { type: "array", items: { type: "string" } },
                                        isDefault: { type: "boolean", default: false },
                                        isActive: { type: "boolean", default: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Edition created", content: { "application/json": { schema: { $ref: "#/components/schemas/AppEdition" } } } },
                        403: { description: "Forbidden" },
                        404: { description: "App not found" },
                    },
                },
            },
            "/apps/{appId}/editions/{editionId}": {
                patch: {
                    tags: ["Editions"],
                    summary: "Update edition (Admin / Developer)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId"), uuidParam("editionId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
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
                    responses: {
                        200: { description: "Edition updated", content: { "application/json": { schema: { $ref: "#/components/schemas/AppEdition" } } } },
                        403: { description: "Forbidden" },
                        404: { description: "Edition not found" },
                    },
                },
                delete: {
                    tags: ["Editions"],
                    summary: "Delete edition (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId"), uuidParam("editionId")],
                    responses: {
                        200: { description: "Edition deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/apps/{appId}/promotions": {
                get: {
                    tags: ["Promotions"],
                    summary: "List promotions for an app",
                    parameters: [
                        uuidParam("appId"),
                        { name: "active", in: "query", schema: { type: "boolean" }, description: "Filter only currently active promotions" },
                    ],
                    responses: {
                        200: {
                            description: "Promotions list",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/AppPromotion" } },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Promotions"],
                    summary: "Create promotion (Admin / Developer)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["startsAt", "endsAt"],
                                    properties: {
                                        editionId: { type: "string", format: "uuid", description: "Leave empty to apply to the entire app" },
                                        discountAmount: { type: "number", example: 2.0, description: "Fixed discount in USD" },
                                        discountPercent: { type: "integer", minimum: 1, maximum: 100, description: "Percentage discount" },
                                        label: { type: "string", example: "Summer Sale" },
                                        startsAt: { type: "string", format: "date-time" },
                                        endsAt: { type: "string", format: "date-time" },
                                        isActive: { type: "boolean", default: true },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Promotion created", content: { "application/json": { schema: { $ref: "#/components/schemas/AppPromotion" } } } },
                        400: { description: "discountAmount or discountPercent required / invalid dates" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/apps/{appId}/promotions/{promotionId}": {
                patch: {
                    tags: ["Promotions"],
                    summary: "Update promotion (Admin / Developer)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId"), uuidParam("promotionId")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
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
                    responses: {
                        200: { description: "Promotion updated", content: { "application/json": { schema: { $ref: "#/components/schemas/AppPromotion" } } } },
                        403: { description: "Forbidden" },
                        404: { description: "Promotion not found" },
                    },
                },
                delete: {
                    tags: ["Promotions"],
                    summary: "Delete promotion (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("appId"), uuidParam("promotionId")],
                    responses: {
                        200: { description: "Promotion deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/categories": {
                get: {
                    tags: ["Categories"],
                    summary: "List all categories",
                    responses: {
                        200: {
                            description: "Categories array",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/Category" } },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["Categories"],
                    summary: "Create category (Admin)",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["name"],
                                    properties: { name: { type: "string", minLength: 2, maxLength: 50 } },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Category created", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
                        403: { description: "Forbidden" },
                        409: { description: "Name already exists" },
                    },
                },
            },
            "/categories/slug/{slug}": {
                get: {
                    tags: ["Categories"],
                    summary: "Get category by slug",
                    parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
                    responses: {
                        200: { description: "Category", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
                        404: { description: "Not found" },
                    },
                },
            },
            "/categories/{id}": {
                get: {
                    tags: ["Categories"],
                    summary: "Get category by ID",
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "Category", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
                        404: { description: "Not found" },
                    },
                },
                put: {
                    tags: ["Categories"],
                    summary: "Update category (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" },
                                        slug: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: { description: "Updated category" },
                        403: { description: "Forbidden" },
                    },
                },
                delete: {
                    tags: ["Categories"],
                    summary: "Delete category (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "Category deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/payment/checkout/create-session": {
                post: {
                    tags: ["Payment"],
                    summary: "Create Stripe checkout session for balance top-up",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["amount"],
                                    properties: {
                                        amount: {
                                            type: "number",
                                            minimum: 1,
                                            maximum: 10000,
                                            description: "Amount to top up in USD",
                                            example: 50
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Checkout session created",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            sessionId: { type: "string", description: "Stripe session ID" },
                                            url: { type: "string", description: "Stripe checkout URL to redirect user" },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "Invalid amount" },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/payment/checkout/purchase-app": {
                post: {
                    tags: ["Payment"],
                    summary: "Create Stripe checkout session for app purchase",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["appId"],
                                    properties: {
                                        appId: { type: "string", format: "uuid", description: "App ID to purchase" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Checkout session created",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            sessionId: { type: "string", description: "Stripe session ID" },
                                            url: { type: "string", description: "Stripe checkout URL to redirect user" },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "Invalid app ID or already owned" },
                        401: { description: "Unauthorized" },
                        404: { description: "App not found" },
                    },
                },
            },
            "/payment/webhook": {
                post: {
                    tags: ["Payment"],
                    summary: "Stripe webhook handler (for Stripe events)",
                    description: "This endpoint is called by Stripe to notify about payment events. Requires Stripe signature header.",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    description: "Stripe event object",
                                },
                            },
                        },
                    },
                    parameters: [
                        {
                            name: "stripe-signature",
                            in: "header",
                            required: true,
                            schema: { type: "string" },
                            description: "Stripe webhook signature for verification",
                        },
                    ],
                    responses: {
                        200: {
                            description: "Webhook processed",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            received: { type: "boolean", example: true },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "Invalid signature or malformed webhook" },
                    },
                },
            },
            "/payment/top-up": {
                patch: {
                    tags: ["Payment"],
                    summary: "Top up account balance",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["amount"],
                                    properties: { amount: { type: "number", minimum: 0.01, maximum: 10000 } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Balance updated",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: { type: "string" },
                                            balance: { type: "number" },
                                        },
                                    },
                                },
                            },
                        },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/payment/purchase": {
                post: {
                    tags: ["Payment"],
                    summary: "Purchase an app using account balance",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["appId"],
                                    properties: {
                                        appId: { type: "string", format: "uuid", description: "App ID to purchase" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: {
                            description: "Purchase successful",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            message: { type: "string" },
                                            purchase: { $ref: "#/components/schemas/Purchase" },
                                            balance: { type: "number" },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "Insufficient balance or already owned" },
                        401: { description: "Unauthorized" },
                        404: { description: "App not found" },
                    },
                },
            },
            "/payment/history": {
                get: {
                    tags: ["Payment"],
                    summary: "Get current user purchase history",
                    security: bearerAuth,
                    responses: {
                        200: {
                            description: "Purchase history",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: { $ref: "#/components/schemas/Purchase" },
                                    },
                                },
                            },
                        },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/news": {
                get: {
                    tags: ["News"],
                    summary: "Get all news (paginated)",
                    parameters: pagingParams,
                    responses: {
                        200: {
                            description: "News list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            news: { type: "array", items: { $ref: "#/components/schemas/NewsItem" } },
                                            pagination: { $ref: "#/components/schemas/Pagination" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                post: {
                    tags: ["News"],
                    summary: "Create news article (Admin)",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["title", "description", "tag"],
                                    properties: {
                                        title: { type: "string" },
                                        description: { type: "string" },
                                        tag: { type: "string" },
                                        tagColor: { type: "string", enum: ["BLUE", "PINK", "PURPLE", "GREEN"], default: "BLUE" },
                                        coverUrl: { type: "string", nullable: true },
                                        link: { type: "string", nullable: true },
                                        publishedAt: { type: "string", format: "date-time" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "News created", content: { "application/json": { schema: { $ref: "#/components/schemas/NewsItem" } } } },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/news/{id}": {
                get: {
                    tags: ["News"],
                    summary: "Get news article by ID",
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "News article", content: { "application/json": { schema: { $ref: "#/components/schemas/NewsItem" } } } },
                        404: { description: "Not found" },
                    },
                },
                put: {
                    tags: ["News"],
                    summary: "Update news article (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/NewsItem" } } } },
                    responses: {
                        200: { description: "Updated article" },
                        403: { description: "Forbidden" },
                    },
                },
                delete: {
                    tags: ["News"],
                    summary: "Delete news article (Admin)",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "Deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/upload/{type}": {
                post: {
                    tags: ["Upload"],
                    summary: "Upload a file (Admin / Developer)",
                    security: bearerAuth,
                    parameters: [
                        {
                            name: "type",
                            in: "path",
                            required: true,
                            schema: { type: "string", enum: ["avatar", "mods", "screenshots", "archives", "news"] },
                        },
                        {
                            name: "appName",
                            in: "query",
                            required: false,
                            description: "Application name for naming archive files (only used for archives type)",
                            schema: { type: "string" },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            "multipart/form-data": {
                                schema: {
                                    type: "object",
                                    required: ["file"],
                                    properties: { file: { type: "string", format: "binary" } },
                                },
                            },
                        },
                    },
                    responses: {
                        200: {
                            description: "Upload successful",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            url: { type: "string" },
                                            filename: { type: "string" },
                                            size: { type: "integer" },
                                        },
                                    },
                                },
                            },
                        },
                        400: { description: "Invalid file type or missing file" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/admin/stats": {
                get: {
                    tags: ["Admin"],
                    summary: "Dashboard statistics",
                    security: bearerAuth,
                    responses: {
                        200: { description: "Stats", content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardStats" } } } },
                        403: { description: "Admin only" },
                    },
                },
            },
            "/admin/activity": {
                get: {
                    tags: ["Admin"],
                    summary: "Recent platform activity",
                    security: bearerAuth,
                    responses: {
                        200: {
                            description: "Activity list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string" },
                                                timestamp: { type: "string", format: "date-time" },
                                                description: { type: "string" },
                                                data: { type: "object" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/admin/users": {
                get: {
                    tags: ["Admin"],
                    summary: "List all users",
                    security: bearerAuth,
                    parameters: [
                        ...pagingParams,
                        { name: "search", in: "query", schema: { type: "string" } },
                        { name: "role", in: "query", schema: { type: "string", enum: ["USER", "DEVELOPER", "ADMIN"] } },
                    ],
                    responses: {
                        200: {
                            description: "Users list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            users: { type: "array", items: { $ref: "#/components/schemas/User" } },
                                            pagination: { $ref: "#/components/schemas/Pagination" },
                                        },
                                    },
                                },
                            },
                        },
                        403: { description: "Admin only" },
                    },
                },
            },
            "/admin/users/{id}": {
                get: {
                    tags: ["Admin"],
                    summary: "Get user by ID",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "User data", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
                        404: { description: "Not found" },
                    },
                },
                delete: {
                    tags: ["Admin"],
                    summary: "Delete user",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: {
                        200: { description: "User deleted" },
                        403: { description: "Forbidden" },
                    },
                },
            },
            "/admin/users/{id}/purchases": {
                get: {
                    tags: ["Admin"],
                    summary: "Get user purchase history",
                    security: bearerAuth,
                    parameters: [uuidParam("id"), ...pagingParams],
                    responses: { 200: { description: "Purchases" } },
                },
            },
            "/admin/users/{id}/downloads": {
                get: {
                    tags: ["Admin"],
                    summary: "Get user download history",
                    security: bearerAuth,
                    parameters: [uuidParam("id"), ...pagingParams],
                    responses: { 200: { description: "Downloads" } },
                },
            },
            "/admin/users/{id}/reviews": {
                get: {
                    tags: ["Admin"],
                    summary: "Get user reviews",
                    security: bearerAuth,
                    parameters: [uuidParam("id"), ...pagingParams],
                    responses: { 200: { description: "Reviews" } },
                },
            },
            "/admin/users/{id}/role": {
                patch: {
                    tags: ["Admin"],
                    summary: "Update user role",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["role"],
                                    properties: { role: { type: "string", enum: ["USER", "DEVELOPER", "ADMIN"] } },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "Role updated" } },
                },
            },
            "/admin/users/{id}/ban": {
                patch: {
                    tags: ["Admin"],
                    summary: "Ban user",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        reason: { type: "string" },
                                        until: { type: "string", format: "date-time", nullable: true, description: "null = permanent" },
                                    },
                                },
                            },
                        },
                    },
                    responses: { 200: { description: "User banned" } },
                },
            },
            "/admin/users/{id}/unban": {
                patch: {
                    tags: ["Admin"],
                    summary: "Unban user",
                    security: bearerAuth,
                    parameters: [uuidParam("id")],
                    responses: { 200: { description: "User unbanned" } },
                },
            },
            "/admin/purchases": {
                get: {
                    tags: ["Admin"],
                    summary: "List all purchases",
                    security: bearerAuth,
                    parameters: [
                        ...pagingParams,
                        { name: "userId", in: "query", schema: { type: "string", format: "uuid" } },
                        { name: "appId", in: "query", schema: { type: "string", format: "uuid" } },
                        { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] } },
                    ],
                    responses: {
                        200: {
                            description: "Purchases list",
                            content: {
                                "application/json": {
                                    schema: {
                                        type: "object",
                                        properties: {
                                            purchases: { type: "array", items: { $ref: "#/components/schemas/Purchase" } },
                                            pagination: { $ref: "#/components/schemas/Pagination" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            "/developer-requests": {
                get: {
                    tags: ["Developer Requests"],
                    summary: "List all developer requests (Admin)",
                    security: bearerAuth,
                    parameters: [
                        { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] } },
                    ],
                    responses: {
                        200: {
                            description: "Requests list",
                            content: {
                                "application/json": {
                                    schema: { type: "array", items: { $ref: "#/components/schemas/DeveloperRequest" } },
                                },
                            },
                        },
                        403: { description: "Admin only" },
                    },
                },
                post: {
                    tags: ["Developer Requests"],
                    summary: "Submit a developer role request",
                    security: bearerAuth,
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    required: ["reason"],
                                    properties: {
                                        reason: { type: "string", minLength: 50, maxLength: 2000 },
                                        portfolio: { type: "string", format: "uri" },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        201: { description: "Request submitted", content: { "application/json": { schema: { $ref: "#/components/schemas/DeveloperRequest" } } } },
                        409: { description: "Already has developer role or pending request" },
                    },
                },
            },
            "/developer-requests/me": {
                get: {
                    tags: ["Developer Requests"],
                    summary: "Get own developer request",
                    security: bearerAuth,
                    responses: {
                        200: { description: "Own request or null", content: { "application/json": { schema: { $ref: "#/components/schemas/DeveloperRequest" } } } },
                        401: { description: "Unauthorized" },
                    },
                },
            },
            "/developer-requests/{requestId}/review": {
                patch: {
                    tags: ["Developer Requests"],
                    summary: "Approve or reject a request (Admin) — grants DEVELOPER role on approval",
                    security: bearerAuth,
                    parameters: [uuidParam("requestId")],
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
                    responses: {
                        200: { description: "Request reviewed", content: { "application/json": { schema: { $ref: "#/components/schemas/DeveloperRequest" } } } },
                        400: { description: "Request already reviewed" },
                        403: { description: "Admin only" },
                        404: { description: "Request not found" },
                    },
                },
            },
        },
    },
    apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
