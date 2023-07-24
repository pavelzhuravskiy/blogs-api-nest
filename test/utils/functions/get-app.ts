import { Test } from '@nestjs/testing';
import { AppModule, options } from '../../../src/app.module';
import { useContainer } from 'class-validator';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { customExceptionFactory } from '../../../src/exceptions/exception.factory';
import { HttpExceptionFilter } from '../../../src/exceptions/exception.filter';
import supertest, { SuperAgentTest } from 'supertest';
import { testingAllDataURI } from '../constants/testing.constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';

export const getAppAndClearDb = async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [TypeOrmModule.forRoot(options), AppModule],
  }).compile();

  const app: INestApplication = moduleRef.createNestApplication();
  const agent: SuperAgentTest = supertest.agent(app.getHttpServer());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: customExceptionFactory,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  // await agent.delete(testingAllDataURI); // todo

  return {
    app: app,
    agent: agent,
  };
};
