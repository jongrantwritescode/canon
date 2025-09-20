"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:8080', 'http://web:8080'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'hx-target', 'hx-indicator', 'hx-post'],
    });
    await app.listen(3000);
    console.log('BFF server running on port 3000');
}
bootstrap();
//# sourceMappingURL=main.js.map