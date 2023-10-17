import { describe, beforeEach, afterEach, vi, test, expect } from 'vitest';
import {WebComponentLoader, WebComponentsDirectory} from "./web-component-loader.ts";

describe('WebComponentLoader test', async() => {

    beforeEach(() => {
    });

    afterEach( () => {
        vi.clearAllMocks();
        vi.resetAllMocks();
        vi.resetModules();
        vi.restoreAllMocks();
    });

    test('fetchWebComponentsDirectory with valid url', async() => {

        const expectedResult : WebComponentsDirectory = [
            {
                name: 'test name',
                url: 'test url'
            }
        ];
        const fetchFct = vi.fn().mockImplementation(async (url: string) => {
           if (url == '/web-component.json') {
               return {
                   ok: true,
                   text: async() => { return JSON.stringify(expectedResult); }
               }
           }
        });

        global.fetch = fetchFct;

        const webComponentLoader = new WebComponentLoader();
        const content = await webComponentLoader.fetchWebComponentsDirectory('/web-component.json');

        expect(content).toEqual(expectedResult);
        console.log(content);
    });

});
