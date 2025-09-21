"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ["http://localhost:8080", "http://web:8080"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Canon Universe Builder API")
        .setDescription("API for building and exploring fictional universes with worlds, characters, cultures, and technologies")
        .setVersion("1.0")
        .addTag("universes", "Universe management and traversal")
        .addTag("entities", "Individual entity operations")
        .addTag("relationships", "Entity relationship queries")
        .addTag("timeline", "Historical timeline operations")
        .addTag("spatial", "Spatial and coordinate queries")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    await app.listen(3000);
    console.log("BFF server running on port 3000");
    console.log("API Documentation available at http://localhost:3000/api/docs");
}
bootstrap();
//# sourceMappingURL=main.js.map