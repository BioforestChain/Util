const path = require("path");
const { typeDRule, typeDeclareRule, nodeRule, indexRule } = require("../dist/rule");
const {
  init,
  mainMigrateFactory,
  typeFiles,
  nodeFiles,
  declareFiles,
  indexFiles,
} = require("../dist/migrate");

let projectPath = path.join(__dirname, "testProject");

beforeAll(async () => {
  await mainMigrateFactory(path.join(projectPath, "src"), projectPath);
});

// test('`migrate -y` should be ok' ,async () => {
//    await init(true)
// })

test(`test ${typeDRule}`, async () => {
  expect(typeFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${nodeRule}`, async () => {
  expect(nodeFiles.length).toBeGreaterThanOrEqual(1);
});

test(`test ${typeDeclareRule}`, async () => {
    await expect(declareFiles.length).toBeGreaterThanOrEqual(1);
});
test(`test ${indexRule}`, async () => {
    await expect(indexFiles.length).toBeGreaterThanOrEqual(1);
});
