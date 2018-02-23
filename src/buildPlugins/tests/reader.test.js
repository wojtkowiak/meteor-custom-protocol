import chai from 'ultimate-chai';
import sinon from 'sinon';

const { expect } = chai;

describe('CustomProtocolIndexReader', () => {
    describe('#loadIndexFile()', () => {
        it('should load config files2', () => {
            const fs = {
                readFileSync: () => JSON.stringify({ test: 'test' })
            };

            expect(CustomProtocolIndexReader.loadIndexFile(fs)).to.be.deep.equal({ test: 'test' });
        });
        it('should return null on problem with reading', () => {
            const fs = {
                readFileSync: () => undefined
            };
            expect(CustomProtocolIndexReader.loadIndexFile(fs)).to.equal(null);
        });
        it('should return empty object when index file does not exists', () => {
            const fs = {
                statSync: () => { throw new Error(); }
            };
            expect(CustomProtocolIndexReader.loadIndexFile(fs)).to.deep.equal({});
        });
    });
    describe('#processFilesForTarget', () => {
        afterEach(() => {
            CustomProtocolIndexReader.loadIndexFile.restore();
        });
        it('should throw when index file could not be loaded', () => {
            sinon.stub(CustomProtocolIndexReader, 'loadIndexFile').returns(null);
            expect(new CustomProtocolIndexReader().processFilesForTarget).to.throw(Error);
        });
        it('should compile the index to a file in the project', () => {
            const index = {
                TestProtocol: { id: 1, package: 'package' }
            };
            sinon.stub(CustomProtocolIndexReader, 'loadIndexFile').returns(index);
            const instance = new CustomProtocolIndexReader();
            const files = [{
                getPathInPackage: () => '',
                getSourceHash: () => '',
                addJavaScript: sinon.spy()
            }];
            instance.processFilesForTarget(files);
            expect(files[0].addJavaScript).to.be.calledWithMatch({
                data: sinon.match(`CustomProtocolsIndex = ${JSON.stringify(index)};`)
            });
            expect(files[0].addJavaScript.args[0][0]).to.include.keys(
                'sourcePath', 'path',
                'data', 'hash'
            );
        });
    });
});
