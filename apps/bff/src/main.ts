import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ["http://localhost:8080", "http://web:8080"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle("Canon Universe Builder API")
    .setDescription(
      "API for building and exploring fictional universes with worlds, characters, cultures, and technologies"
    )
    .setVersion("1.0")
    .addTag("universes", "Universe management and traversal")
    .addTag("entities", "Individual entity operations")
    .addTag("relationships", "Entity relationship queries")
    .addTag("timeline", "Historical timeline operations")
    .addTag("spatial", "Spatial and coordinate queries")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // No global prefix to keep routes simple for the static client

  await app.listen(3000);
  console.log("BFF server running on port 3000");
  console.log("API Documentation available at http://localhost:3000/api/docs");
}
bootstrap();
