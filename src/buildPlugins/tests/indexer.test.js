const expect = chai.expect;

describe('CustomProtocolIndexer', () => {
    describe('#loadIndexFile()', () => {
        it('should load config files', () => {
            const fs = {
                existsSync: () => true,
                readFileSync: () => JSON.stringify({ test: 'test' })
            };

            expect(CustomProtocolIndexer.loadIndexFile(fs)).to.be.deep.equal({ test: 'test' });
        });
        it('should return null on problem with reading', () => {
            const fs = {
                existsSync: () => true,
                readFileSync: () => undefined
            };
            expect(CustomProtocolIndexer.loadIndexFile(fs)).to.equal(null);
        });
        it('should return empty object when index file does not exists', () => {
            const fs = {
                existsSync: () => false
            };
            expect(CustomProtocolIndexer.loadIndexFile(fs)).to.deep.equal({});
        });
    });

    describe('#constructor', () => {
        afterEach(() => {
            CustomProtocolIndexer.loadIndexFile.restore();
        });
        it('should throw when index file could not be loaded', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns(null);
            expect(() => new CustomProtocolIndexer()).to.throw(Error);
        });
        it('should store index', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({ test: 'test' });
            expect(new CustomProtocolIndexer()._index).to.be.deep.equal({ test: 'test' });
        });
    });

    describe('#getFreeId', () => {
        afterEach(() => {
            CustomProtocolIndexer.loadIndexFile.restore();
        });

        it('should return new id if no free found', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({
                test: { id: 1 },
                test2: { id: 2 }
            });
            const instance = new CustomProtocolIndexer();
            expect(instance.getFreeId()).to.be.equal(3);
        });
        it('should return 1 if there are no protcols in the index', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({});
            const instance = new CustomProtocolIndexer();
            expect(instance.getFreeId()).to.be.equal(1);
        });
        it('should return an id from the gap at the beginning of the sequence', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({
                test: { id: 2 },
                test2: { id: 3 }
            });
            const instance = new CustomProtocolIndexer();
            expect(instance.getFreeId()).to.be.equal(1);
        });
        it('should return an id from the first gap', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({
                test: { id: 1 },
                test2: { id: 3 },
                test3: { id: 5 }
            });
            const instance = new CustomProtocolIndexer();
            expect(instance.getFreeId()).to.be.equal(2);
        });
    });

    describe('#processFilesForPackage', () => {
        function prepareFilesMock(filesCount, packageNames = [], contents = []) {
            const files = [];
            for (let i = 1; i <= filesCount; i++) {
                files.push({
                    getPackageName: () => packageNames[i - 1],
                    getPathInPackage() {
                    },
                    getContentsAsString: sinon.stub().returns(contents[i - 1]),
                    error: sinon.spy()
                });
            }
            return files;
        }

        afterEach(() => {
            CustomProtocolIndexer.loadIndexFile.restore();
        });
        it('should fail on file without proper class name', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({});
            const files = prepareFilesMock(1, [''], ['']);
            const fs = { existsSync: () => true, writeFileSync: () => true };
            const instance = new CustomProtocolIndexer(fs);
            instance.processFilesForPackage(files);
            expect(files[0].getContentsAsString).to.have.been.calledOnce();
            expect(files[0].error).to.have.been.calledWithMatch({
                message: sinon.match('Failed to get the class name')
            });
        });

        it('should add protocol to index', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({});
            const files = prepareFilesMock(1, ['package'], [
                'class TestProtocol extends CustomProtocol'
            ]);
            const fs = { existsSync: () => true, writeFileSync: sinon.spy() };
            const instance = new CustomProtocolIndexer(fs);
            instance.processFilesForPackage(files);
            expect(fs.writeFileSync).to.have.been.calledWith(
                './private/custom_protocols_index.json',
                JSON.stringify(instance._index, null, 4)
            );
            expect(instance._index).to.be.deep.equal({
                TestProtocol: { id: 1, package: 'package' }
            });
        });

        it('should fail on duplicated class name', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({
                TestProtocol: { id: 1, package: 'package' }
            });
            const files = prepareFilesMock(1, ['package2'], [
                'class TestProtocol extends CustomProtocol'
            ]);
            const fs = { existsSync: () => true, writeFileSync: sinon.spy() };
            const instance = new CustomProtocolIndexer(fs);
            instance.processFilesForPackage(files);
            expect(files[0].error).to.have.been.calledWithMatch({
                message: sinon.match('class name is already registered')
            });
        });

        it('should remove deleted protocols from the index', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({
                TestProtocol: { id: 1, package: 'package' }
            });
            const files = prepareFilesMock(1, ['package'], [
                'class NewTestProtocol extends CustomProtocol'
            ]);
            const fs = { existsSync: () => true, writeFileSync: sinon.spy() };
            const instance = new CustomProtocolIndexer(fs);
            instance.processFilesForPackage(files);
            expect(instance._index).not.to.include.keys('TestProtocol');
        });

        it('should create directory if not exists', () => {
            sinon.stub(CustomProtocolIndexer, 'loadIndexFile').returns({});
            const files = prepareFilesMock(1, ['package'], [
                'class TestProtocol extends CustomProtocol'
            ]);
            const fs = {
                existsSync: () => false, mkdirSync: sinon.spy(), writeFileSync: () => {}
            };
            const instance = new CustomProtocolIndexer(fs);
            instance.processFilesForPackage(files);
            expect(fs.mkdirSync).to.have.been.calledWith('./private');
        });
    });
});
