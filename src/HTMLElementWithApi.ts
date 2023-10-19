export declare type HTMLElementAPICreator<T> = () => T;

export class HTMLElementWithApi<API> extends HTMLElement {

    webComponentApi: API;

    constructor( apiCreator: HTMLElementAPICreator<API>) {
        super();

        this.webComponentApi = apiCreator();
    }
}
