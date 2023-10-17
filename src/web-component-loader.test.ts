import { describe, beforeEach, afterEach, vi, test, expect } from 'vitest';
import {WebComponentEntry, WebComponentLoader, WebComponentsDirectory} from "./web-component-loader.ts";

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

    test('fetchWebComponentsDirectory with invalid url', async() => {
        const fetchFct = vi.fn().mockImplementation(async (url: string) => {
            if (url == '/web-component.json') {
                return {
                    ok: false
                }
            }
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        global.fetch = fetchFct;

        const webComponentLoader = new WebComponentLoader();
        const content = await webComponentLoader.fetchWebComponentsDirectory('/web-component.json');

        expect(content).toBeNull();
        expect(consoleErrorSpy).toBeCalledTimes(1);

    })


    test('fetchWebComponentsDirectory with invalid json', async() => {
        const fetchFct = vi.fn().mockImplementation(async (url: string) => {
            if (url == '/web-component.json') {
                return {
                    ok: true,
                    text: async () => { return 'invalid json' }
                }
            }
        });

        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        global.fetch = fetchFct;

        const webComponentLoader = new WebComponentLoader();
        const content = await webComponentLoader.fetchWebComponentsDirectory('/web-component.json');

        expect(content).toBeNull();
        expect(consoleErrorSpy).toBeCalledTimes(1);
    })

    test('addWebComponentToDOM script element added to dom', async() => {
        const wcEntry : WebComponentEntry = {
            name: 'testwc',
            url: 'http://server/file'
        }

        const mutobs = new MutationObserver((e) => {
            if (e[0].addedNodes) {
                const addedNodes = e[0].addedNodes;
                if (addedNodes.length > 0) {
                    const node = addedNodes[0] as HTMLScriptElement;
                    if (node && node.onload) {
                        node.onload(new Event('onload'));
                    }
                }
            }
        });

        mutobs.observe(document.head, { childList: true });

        const webComponentLoader = new WebComponentLoader();
        await webComponentLoader.addWebComponentToDOM(wcEntry);

        const scriptElm = global.document.getElementById('testwc') as HTMLScriptElement;

        expect(scriptElm).not.toBeNull();
        if (scriptElm) {
            expect(scriptElm.src).toEqual(wcEntry.url);
        }
    });

});
