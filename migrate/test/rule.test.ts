import path from 'path';
import {
  typeDRule,
  typeDeclareRule,
  nodeRule,
  indexRule,
  privateImportRule,
  warringTestTypeRule,
  importRule,
} from '../src/rule'
import {
  mainMigrateFactory,
  typeFiles,
  nodeFiles,
  declareFiles,
  indexFiles,
  privateImportFiles,
  warringTestTypeFiles,
  importFiles,
} from '../src/migrate'

let projectPath = path.join(__dirname, "bfsp");

beforeAll(async () => {
  await mainMigrateFactory(path.join(projectPath, "src"), projectPath);
});

// test('`migrate -y` should be ok' , () => {
//     init(true)
// })

test(`test ${typeDRule}`, () => {
  expect(typeFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${nodeRule}`, () => {
  expect(nodeFiles.length).toBeGreaterThanOrEqual(1);
});

test(`test ${typeDeclareRule}`, () => {
  expect(declareFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${indexRule}`, () => {
  expect(indexFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${privateImportRule}`, () => {
  expect(privateImportFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${warringTestTypeRule}`, () => {
  expect(warringTestTypeFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${importRule}`, () => {
  expect(importFiles.length).toBeGreaterThanOrEqual(1);
});
