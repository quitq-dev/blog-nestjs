import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const PORT = process.env.PORT || 3002;
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("Blog APIs")
    .setDescription("List APIs for simple Blog by QTQ Dev")
    .setVersion("1.0")
    .addTag("Auth")
    .addTag("Users")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  await app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}
bootstrap();
