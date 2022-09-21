import app from "../../src/app";
import { Recommendation } from "@prisma/client";
import supertest from "supertest";
import * as scenarioFactory from "../factories/scenarioFactory";
import * as recommendationFactory from "../factories/recommendationFactory";

beforeEach(async () => {
    await scenarioFactory.deleteAllData();
});

const server = supertest(app);

describe("test Route POST /recommendations", () => {
    it("create a recommendation , send correct format , it should return 201", async () => {
        await recommendationFactory.createPreExistentRecommendation();
        const getRecommendation = await recommendationFactory.createDataRecommendation()
        const isRecommendationUnique = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(isRecommendationUnique).toBeNull()
        const createRecommendation = await server
            .post("/recommendations")
            .send(getRecommendation)
        const findRecommendation = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(findRecommendation).not.toBeNull();
        expect(createRecommendation.statusCode).toBe(201);
    });
});

describe("test Route POST /recommendations/:id/upvote", () => {
    it("update vote with a valid id for upvote", async () =>{
        await recommendationFactory.createPreExistentRecommendation();
        const getRecommendation = await recommendationFactory.createDataRecommendation()
        const isRecommendationUnique = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(isRecommendationUnique).toBeNull()
        const createRecommendation = await server
            .post("/recommendations")
            .send(getRecommendation)
        expect(createRecommendation.statusCode).toBe(201);
        const findRecommendation = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(findRecommendation).not.toBeNull();
        const id = findRecommendation.id
        const updateVote = await server
            .post(`/recommendations/${id}/upvote`)
            .send("increment")
        expect(updateVote.statusCode).toBe(200)  
    })
});

describe("test Route POST /recommendations/:id/downvote", () => {
    it("update vote with a valid id for downvote", async () =>{
        await recommendationFactory.createPreExistentRecommendation();
        const getRecommendation = await recommendationFactory.createDataRecommendation()
        const isRecommendationUnique = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(isRecommendationUnique).toBeNull()
        const createRecommendation = await server
            .post("/recommendations")
            .send(getRecommendation)
        expect(createRecommendation.statusCode).toBe(201);
        const findRecommendation = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(findRecommendation).not.toBeNull();
        const id = findRecommendation.id
        const downVote = await server
            .post(`/recommendations/${id}/downvote`)
            .send("decrement")
        expect(downVote.statusCode).toBe(200)  
    })
});

describe("test Route GET /recommendations", () => {
    it("get all recommendations , should returns all of them", async () => {
        await recommendationFactory.createPreExistentRecommendation();
        const getAll = await recommendationFactory.getAll()
        expect(getAll.length).toEqual(9)
        const getRecommendations = await server
            .get("/recommendations")
        expect(getRecommendations.body.length).toEqual(9)
        getRecommendations.body.forEach((recommendation: Recommendation) => {
            expect(recommendation).not.toBe(null);
            expect(recommendation.id).not.toBe(null);
            expect(recommendation.name).not.toBe(null);
            expect(recommendation.score).not.toBe(null);
            expect(recommendation.youtubeLink).not.toBe(null);
        });
    })
});

describe("test Route GET /recommendations/:id", () => {
    it("get recommendation with a existent id", async () => {
        await recommendationFactory.createPreExistentRecommendation();
        const getRecommendation = await recommendationFactory.createDataRecommendation()
        const isRecommendationUnique = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(isRecommendationUnique).toBeNull()
        const createRecommendation = await server
            .post("/recommendations")
            .send(getRecommendation)
        expect(createRecommendation.statusCode).toBe(201);
        const findRecommendation = await recommendationFactory.findRecommendation(getRecommendation.name)
        expect(findRecommendation).not.toBeNull();
        const id = findRecommendation.id
        const findRecommendationById = await server
            .get(`/recommendations/${id}`)
        expect(findRecommendationById.body.name).toEqual(getRecommendation.name)

    })
});

describe("test Route GET /recommendations/random", () => {
    it("should get a random recommendation 70%", async () => {
        await recommendationFactory.updateXScores(20, 5);
        await recommendationFactory.updateXScores(1, 20);
        const result = await server
            .get("/recommendations/random");
        expect(result.body.score).toBeGreaterThan(10);
    });
    it("should get a random recommendation 30%", async () => {
        await recommendationFactory.updateXScores(40, 20);
        await recommendationFactory.updateXScores(1, 5);
        const result = await server
            .get("/recommendations/random");
        expect(result.body.score).toBeLessThanOrEqual(10);
    });
    it("no recommendations existent , should return 404", async () => {
        const result = await server.get("/recommendations/random");
        expect(result.statusCode).toBe(404);
    });
});

describe("test Route GET /recommendations/top/:amount", () => {
    it.todo("")
});


afterAll(async () => {
    await scenarioFactory.disconnectPrisma();
});
