Package.describe({
    name: 'omega:custom-protocol',
    version: '1.0.1',
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
    api.versionsFrom('1.2');
    api.use('isobuild:linter-plugin@1.0.0');
    api.use('isobuild:compiler-plugin@1.0.0');
    api.use('ecmascript');
    api.use('underscore');
    api.use('omega:direct-stream-access@3.0.1');

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
    api.addFiles('src/utils/DynamicMessagesProtocol.js');
    api.addFiles('src/utils/Json.protocol.js');
    api.export('CustomProtocolCore');
    api.export('CustomProtocol');
    api.export('DynamicMessagesProtocol');
    api.export('JsonProtocol');
    api.export([
        'CustomProtocolIndexer',
        'CustomProtocolIndexReader',
        'CustomProtocolCoreClass',
        'CustomProtocolsIndex',
        'CustomProtocolError',
        'CustomProtocolCommon'
    ], ['client', 'server'],
        { testOnly: true });
});

Package.onTest(function onTest(api) {
    api.use('ecmascript');
    api.use('omega:custom-protocol');
    api.use('practicalmeteor:mocha');
    api.use('practicalmeteor:sinon');
    api.use('omega:dirty-chai');

    api.addFiles([
        'src/buildPlugins/tests/indexer.test.js',
        'src/buildPlugins/tests/reader.test.js',
        'src/lib/tests/core.test.js',
        'src/lib/tests/common.test.js',
        'src/tests/CustomProtocol.server.test.js',
        'src/utils/tests/Json_protocol.test.js',
        'src/utils/tests/DynamicMessagesProtocol.test.js'
    ], ['server']);
    api.addFiles([
        'src/tests/CustomProtocol.client.test.js',
        'src/utils/tests/Json_protocol.test.js',
        'src/utils/tests/DynamicMessagesProtocol.test.js'
    ], ['client']);
});
