const swaggerJSDoc = require("swagger-jsdoc")

/**
 * @type swaggerJSDoc.Options
 */
const swaggerOptions = {
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
}

module.exports = swaggerOptions
