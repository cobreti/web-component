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

        global.fetch = fetchFct;

        const webComponentLoader = new WebComponentLoader();
        const content = await webComponentLoader.fetchWebComponentsDirectory('/web-component.json');

        expect(content).toBeNull();
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

    test('addWebComponentToDOM does not add script if already present', async() => {
        const wcEntry : WebComponentEntry = {
            name: 'testwc',
            url: 'http://server/file'
        }

        const scriptElm = global.document.createElement('script');
        scriptElm.id = wcEntry.name;
        global.document.head.append(scriptElm);

        const appendSpy = vi.spyOn(global.document, 'append');

        const webComponentLoader = new WebComponentLoader();
        await webComponentLoader.addWebComponentToDOM(wcEntry);

        expect(appendSpy).not.toBeCalled();
    });

    test('loadWebComponentsWithDirectoryUrl with valid directory', async() => {
        const loader = new WebComponentLoader();
        const wcDirectory : WebComponentsDirectory = [];

        vi.spyOn(loader, 'fetchWebComponentsDirectory').mockImplementation(async () => {
            return wcDirectory;
        });

        const loadSpy = vi.spyOn(loader, 'loadWebComponentsFromDirectory').mockImplementation(async () => {});

        await loader.loadWebComponentsWithDirectoryUrl('url');

        expect(loadSpy).toBeCalled();
    });

    test('loadWebComponentsWithDirectoryUrl invalid directory result will log an error', async() => {
        const loader = new WebComponentLoader();

        vi.spyOn(loader, 'fetchWebComponentsDirectory').mockImplementation(async () => {
            return null;
        });

        const logErrorSpy = vi.spyOn(console, 'error');

        await loader.loadWebComponentsWithDirectoryUrl('url');

        expect(logErrorSpy).toBeCalled();
    });

    test('loadWebComponentsFromDirectory add web component to DOM for each entry', async() => {
        const wcDirectory : WebComponentsDirectory = [
            {
                name: 'entry 1',
                url: 'url 1'
            },
            {
                name: 'entry 2',
                url: 'url 2'
            }
        ]

        const loader = new WebComponentLoader();

        const addWCSpy = vi.spyOn(loader, 'addWebComponentToDOM').mockImplementation(async() => {});

        await loader.loadWebComponentsFromDirectory(wcDirectory);

        expect(addWCSpy).toBeCalledTimes(wcDirectory.length);
    });

});
