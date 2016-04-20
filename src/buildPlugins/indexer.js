/* eslint-disable no-console */

const indexFile    = 'custom_protocols_index.json';
const path          = './private';

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
            throw new Error(
                `CustomProtocolIndexer: Failed to parse ${path}/${indexFile} : not valid JSON.`
            );
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
        if (fileSystem.existsSync(`${path}/${indexFile}`)) {
            try {
                return JSON.parse(fileSystem.readFileSync(`${path}/${indexFile}`));
            } catch (error) {
                return null;
            }
        }
        return {};
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
            (values, key) => (values.push(this._index[key].id), values), []
        );
        ids = ids.sort();
        if (ids[0] === 1) {
            // Look for a gap.
            ids.sort().some(value => {
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
    processFilesForPackage(files) {
        const packageName   = files[0].getPackageName();
        const classNames    = [];
        let change = false;

        files.forEach((file) => {
            const content = file.getContentsAsString();
            let className = '';
            try {
                className = content.match(/class (.+) extends/g)[0].split(' ')[1];
            } catch (err) {
                file.error({
                    message: 'CustomProtocolIndexer: Failed to get the class name for '
                    + `${file.getPathInPackage()} Error: ${err.message}`
                });
                return;
            }

            classNames.push(className);
            if (!this._index[className]) {
                const id = this.getFreeId();
                console.info(
                    `CustomProtocolIndexer: Assigned protocol id: ${id} for ${className}.`
                );
                this._index[className] = { id, package: packageName };
                change = true;
            } else {
                if (this._index[className].package !== packageName) {
                    const classPackage = this._index[className].package;
                    file.error({
                        message: `Trying to register ${className} protocol in ` +
                            `${packageName !== null ? packageName : 'main'} package but this ` +
                            'class name is already registered in ' +
                            `${classPackage !== null ? classPackage : 'main'} package.`
                    });
                }
            }
        });

        // Remove deleted protocols from the index.
        const protocolsRegisteredInPackage = Object.keys(this._index).reduce(
            (values, key) => (
                this._index[key].package === packageName ? values.push(key) : null, values
            ), []);
        _.difference(protocolsRegisteredInPackage, classNames).forEach(
            protocol => delete this._index[protocol]
        );

        if (change) {
            if (!this._fs.existsSync('./private')) {
                this._fs.mkdirSync('./private');
            }
            console.log('CustomProtocolIndexer: saving', this._index);
            this._fs.writeFileSync(`./private/${indexFile}`, JSON.stringify(this._index, null, 4));
        }
    }
};

// We are registering this indexer as a linter.
if (typeof Plugin !== 'undefined') {
    Plugin.registerLinter(
        { extensions: ['protocol.js'] },
        () => new CustomProtocolIndexer(Plugin.fs)
    );
}
