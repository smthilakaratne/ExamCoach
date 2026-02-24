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
    // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
    filesPattern: ["../routes/*.js", "../models/*.js"],
    // URL where SwaggerUI will be rendered
    swaggerUIPath: "/api/docs",
    // Expose OpenAPI UI
    exposeSwaggerUI: true,
    // Expose Open API JSON Docs documentation in `apiDocsPath` path.
    exposeApiDocs: false,
    // Open API JSON Docs endpoint.
    apiDocsPath: "/api/docs.json",
    // Set non-required fields as nullable by default
    notRequiredAsNullable: false,
    // You can customize your UI options.
    // you can extend swagger-ui-express config. You can checkout an example of this
    // in the `example/configuration/swaggerOptions.js`
    swaggerUiOptions: {},
    // multiple option in case you want more that one instance
    multiple: true,
}

module.exports = swaggerOptions
