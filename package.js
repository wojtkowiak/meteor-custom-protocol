Package.describe({
    name: 'omega:custom-protocol',
    version: '4.0.2',
    summary: 'Send custom data on the Meteor\'s defaults websocket connection.',
    git: 'https://github.com/wojtkowiak/meteor-custom-protocol',
    documentation: 'README.md'
});

Package.registerBuildPlugin({
    name: 'custom-protocol-indexer',
    use: ['ecmascript', 'underscore'],
    sources: ['src/buildPlugins/indexer.js']
});

Package.registerBuildPlugin({
    name: 'custom-protocol-index-reader',
    use: ['ecmascript', 'underscore'],
    sources: ['src/buildPlugins/reader.js']
});

Package.onUse(function onUse(api) {
    api.versionsFrom('1.4');
    api.use('isobuild:compiler-plugin@1.0.0');
    api.use('ecmascript');
    api.use('omega:direct-stream-access@=4.0.3');

    api.addFiles([
        'src/lib/index/index.protocols.index.js',
        'src/lib/error.js',
        'src/lib/core.js',
        'src/lib/common.js'
    ]);
    api.addFiles('src/CustomProtocol.client.js', 'client');
    api.addFiles([
        'src/CustomProtocol.server.js',
        'src/buildPlugins/indexer.js',
        'src/buildPlugins/reader.js'
    ], 'server');
    api.addFiles([
        'src/utils/DynamicMessagesProtocol.js'
    ]);
    api.export('CustomProtocolCore');
    api.export('CustomProtocol');
    api.export('DynamicMessagesProtocol');
    api.export('JsonProtocol');
    api.export(
        [
            'CustomProtocolIndexer',
            'CustomProtocolIndexReader',
            'CustomProtocolCoreClass',
            'CustomProtocolsIndex',
            'CustomProtocolError',
            'CustomProtocolCommon'
        ],
        ['client', 'server'],
        { testOnly: true }
    );
});

Package.onTest(function onTest(api) {
    Npm.depends({
        'ultimate-chai': '4.1.0',
        sinon: '4.3.0'
    });

    api.use('ecmascript');
    api.use('omega:custom-protocol');
    api.use('cultofcoders:mocha');

    api.addFiles([
        'src/buildPlugins/tests/indexer.test.js',
        'src/buildPlugins/tests/reader.test.js',
        'src/lib/tests/core.test.js',
        'src/lib/tests/common.test.js',
        'src/tests/CustomProtocol.server.test.js',
        'src/utils/tests/DynamicMessagesProtocol.test.js'
    ], ['server']);
    api.addFiles([
        'src/tests/CustomProtocol.client.test.js',
        'src/utils/tests/DynamicMessagesProtocol.test.js'
    ], ['client']);
});
