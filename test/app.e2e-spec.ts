import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// import { Test, TestingModule } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import * as request from 'supertest';
// import { AppModule } from '../src/app.module';

describe('E2E - Application', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  /**
   * 🔹 HEALTH CHECK
   */
  it('App should be running', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200);
  });

  /**
   * 🔹 USERS MODULE
   */
  it('Categories module works', async() => {
    const body = request(app.getHttpServer())
      .get('/')
      .expect(200);
    console.log(body);
    
  });

  /**
   * 🔹 ORDERS MODULE
   */
  // it('Orders module works', () => {
  //   return request(app.getHttpServer())
  //     .get('/orders')
  //     .expect(200);
  // });

  /**
   * 🔹 PRODUCTS MODULE
   */
  // it('Products module works', () => {
  //   return request(app.getHttpServer())
  //     .get('/products')
  //     .expect(200);
  // });

  afterAll(async () => {
    await app.close();
  });

 
});
