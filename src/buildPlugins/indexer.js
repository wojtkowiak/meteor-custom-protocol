/* eslint-disable no-console */

const indexFile = 'custom_protocols_index.json';
const path = './private';

/**
 * Custom protocols indexer implementation. Assigns an unique id to every custom protocol and
 * stores the result in ./private/custom_protocols_index.json
 *
 * @category BUILD
 * @type {CustomProtocolIndexer}
 */
CustomProtocolIndexer = class CustomProtocolIndexer {
    /**
     * Constructs this class.
     *
     * @param {Object} fileSystem - Reference to node fs
     */
    constructor(fileSystem) {
        this._index = CustomProtocolIndexer.loadIndexFile(fileSystem);
        this._fs = fileSystem;
        if (this._index === null) {
            throw new Error(`CustomProtocolIndexer: Failed to parse ${path}/${indexFile} : not valid JSON.`);
        }
    }

    /**
     * Tries to read the json config file and parse it.
     *
     * @param {Object} fileSystem - FileSystem object
     * @static
     * @returns {Object|null}
     */
    static loadIndexFile(fileSystem) {
        let fileContents;
        try {
            fileContents = fileSystem.readFileSync(`${path}/${indexFile}`);
        } catch (e) {
            return {};
        }

        try {
            return JSON.parse(fileContents);
        } catch (error) {
            return null;
        }
    }

    /**
     * Looks for a free id between all already registered protocols.
     *
     * @returns {number}
     */
    getFreeId() {
        if (_.isEmpty(this._index)) {
            return 1;
        }
        // Find the first gap in sequence of ids.
        let lastValue;
        let id = 1;
        // Since the config has { className: { id: <id>, package: <packageName> } } format, we need
        // to reduce it to an ids array.
        let ids = Object.keys(this._index).reduce(
            (values, key) => (values.push(this._index[key].id), values),
            []
        );
        ids = ids.sort();
        if (ids[0] === 1) {
            // Look for a gap.
            ids.sort().some((value) => {
                if (lastValue && value - lastValue > 1) {
                    id = lastValue + 1;
                    return true;
                }
                lastValue = value;
                return false;
            });
            // No gap found.
            if (id === 1) {
                id = Math.max(...ids) + 1;
            }
        } else {
            // We have a gap at the front of the sequence.
            id = ids[0] - 1;
        }
        return id;
    }

    /**
     * Build the index of all used custom protocols.
     *
     * @param {Array} files - Array with files to process.
     */
    processFilesForTarget(files) {
        const classNames = {};
        let change = false;
        let packageName;
        const packages = {};

        files.forEach((file) => {
            const className = file.getBasename().replace('.protocol', 'Protocol');
            packageName = (file.getPackageName() !== null) ? file.getPackageName() : 'app';
            packages[packageName] = true;

            if (packageName in classNames) {
                classNames[packageName].push(className);
            } else {
                classNames[packageName] = [className];
            }

            if (!this._index[className]) {
                const id = this.getFreeId();
                console.info(`CustomProtocolIndexer: Assigned protocol id: ${id} for ${className}.`);
                this._index[className] = { id, package: packageName };
                change = true;
            } else if (this._index[className].package !== packageName) {
                const classPackage = this._index[className].package;
                file.error({
                    message: `Trying to register ${className} protocol in ` +
                        `${packageName} package but this ` +
                        'class name is already registered in ' +
                        `${classPackage} package.`
                });
            }
            file.addJavaScript({
                sourcePath: file.getPathInPackage(),
                path: file.getPathInPackage(),
                data: file.getContentsAsString(),
                hash: file.getSourceHash(),
                sourceMap: null
            });
        });

        Object.keys(packages).forEach((packageName) => {
            // Remove deleted protocols from the index.
            const protocolsRegisteredInPackage = Object.keys(this._index).reduce(
                (values, key) => (
                    this._index[key].package === packageName ? values.push(key) : null, values
                ),
                []
            );

            _.difference(protocolsRegisteredInPackage, classNames[packageName])
                .forEach(protocol => delete this._index[protocol]);
        });

        const packagesInIndex = Object.keys(this._index).reduce(
            (values, key) => (
                values[this._index[key].package] = true, values
            ),
            {}
        );

        _.difference(Object.keys(packagesInIndex), Object.keys(packages)).forEach((packageName) => {
            Object.keys(this._index).forEach((protocol) => {
                if (this._index[protocol].package === packageName) delete this._index[protocol];
            });
        });

        if (change) {
            try {
                this._fs.statSync('./private');
            } catch (e) {
                this._fs.mkdirSync('./private');
            }
            this._fs.writeFileSync(`./private/${indexFile}`, JSON.stringify(this._index, null, 4));
        }
    }
};

// We are registering this indexer as a compiler.
if (typeof Plugin !== 'undefined') {
    Plugin.registerCompiler(
        { extensions: ['protocol'] },
        () => new CustomProtocolIndexer(Plugin.fs)
    );
}
