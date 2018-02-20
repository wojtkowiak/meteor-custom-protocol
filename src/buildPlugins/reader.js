const indexFile = 'custom_protocols_index.json';
const path = './private';

/**
 * Since we have no access to app Assets object we need to copy the protocols index into a file
 * that belongs to this package. For that purpose we will use a compiler plugin.
 *
 * @category BUILD
 * @type {CustomProtocolIndexReader}
 */
CustomProtocolIndexReader = class CustomProtocolIndexReader {
    constructor(fileSystem) {
        this._fs = fileSystem;
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
     * Compiles the protocols.index.js file.
     *
     * @param {Array} files - Array with files to process.
     */
    processFilesForTarget(files) {
        const index = CustomProtocolIndexReader.loadIndexFile(this._fs);
        if (index === null) {
            throw new Error(`CustomProtocolIndexReader: Failed to parse ${path}/${indexFile} : ` +
                'not valid JSON.');
        }
        files.forEach((inputFile) => {
            inputFile.addJavaScript({
                sourcePath: inputFile.getPathInPackage(),
                path: inputFile.getPathInPackage(),
                data: `CustomProtocolsIndex = ${JSON.stringify(index)};`,
                hash: inputFile.getSourceHash(),
                sourceMap: null
            });
        });
    }
};

// We are registering this reader as a compiler.
if (typeof Plugin !== 'undefined') {
    Plugin.registerCompiler(
        { extensions: ['protocols.index.js'] },
        () => new CustomProtocolIndexReader(Plugin.fs)
    );
}
