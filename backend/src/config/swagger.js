/*const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        basePath: "/api",
        info: {
            title: "ExamCoach API",
            version: "1.0.0",
            description: "ExamCoach API documentation",
        },
        servers: [
            {
                url: `http://localhost:${process.env.SERVER_PORT || 8888}`,
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        produces: "application/json",
        consumes: "application/json",
    },
    apis: ["./src/routes/*.js"],
}*/
const swaggerOptions = {
    info: {
        version: "1.0.0",
        title: "ExamCoach API",
        description:
            "ExamCoach – Exam coaching platform API. Covers User Management, Feedback, Forum, Mock Exams, Study Content.",
        license: {
            name: "MIT",
        },
    },
    security: {
        BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        },
    },
    baseDir: __dirname,
    // Picks up JSDoc comments from all route files
    filesPattern: ["../routes/*.js", "../models/*.js"],
    swaggerUIPath: "/api/docs",
    exposeSwaggerUI: true,
    exposeApiDocs: false,
    apiDocsPath: "/api/docs.json",
    notRequiredAsNullable: false,
    multiple: true,
    swaggerUiOptions: {
        customCssUrl: "https://unpkg.com/swagger-ui-dist/swagger-ui.css",
    },
}

module.exports = swaggerOptions
