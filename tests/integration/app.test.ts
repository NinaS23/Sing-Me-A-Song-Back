import app from "../../src/app";
import supertest from "supertest";
import * as scenarioFactory from "../factories/scenarioFactory";


beforeEach(async () => {
    await scenarioFactory.deleteAllData();
});

const server = supertest(app);

describe("test Route POST /recommendations", () => {
    it.todo("create a recommendation , send correct format , it should return 201")
});


afterAll(async () => {
    await scenarioFactory.disconnectPrisma();
});
