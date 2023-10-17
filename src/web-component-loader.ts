export interface WebComponentEntry {
    name: string;
    url: string;
}

export type WebComponentsDirectory = WebComponentEntry[];

export class WebComponentLoader {

    async loadWebComponentsWithDirectoryUrl(directoryUrl: string) {
        const directory = await this.fetchWebComponentsDirectory(directoryUrl);
        if (directory) {
            await this.loadWebComponentsFromDirectory(directory);
        }
        else {
            console.error('no directory to load web components from');
        }
    }

    async loadWebComponentsFromDirectory(webComponentsDirectory: WebComponentsDirectory) {
        try {
            const promises:Promise<void>[] = [];

            webComponentsDirectory.forEach(entry => {
                promises.push(this.addWebComponentToDOM(entry));
            });

            await Promise.all(promises);
        }
        catch (error) {
            console.error(error);
        }
    }

    async fetchWebComponentsDirectory(locationUrl: string) : Promise<WebComponentsDirectory | null> {
        try {
            console.log(`fetching web components location from ${locationUrl}`);
            const response = await fetch(locationUrl);

            if (!response.ok) {
                throw new Error(`failure fetching web components location from ${locationUrl}`);
            }

            const text  = await response.text();
            const content = JSON.parse(text) as WebComponentsDirectory;

            return content;
        }
        catch (error) {
            console.error(error);
        }

        return null;
    }

    private addWebComponentToDOM(entry: WebComponentEntry): Promise<void> {
        return new Promise<void>( (resolve, reject) => {
            try {
                const existingElm = document.getElementById(entry.name);

                if (!existingElm) {
                    console.log(`loading web-component '${entry.name}' --> ${entry.url}`);
                    const scriptElem = document.createElement('script');
                    scriptElem.type = 'module';
                    scriptElem.id = entry.name;
                    scriptElem.src = entry.url;
                    scriptElem.async = true;
                    scriptElem.onload = () => {
                        console.log('script parsed');
                        resolve();
                    }
                    document.head.append(scriptElem);
                } else {
                    resolve();
                    console.log(`web-component '${entry.name}' already loaded`);
                }
            } catch (error) {
                console.error(error);
                reject();
            }
        });
    }
}
