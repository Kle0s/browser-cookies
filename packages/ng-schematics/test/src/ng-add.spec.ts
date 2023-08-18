import expect from 'expect';

import {
  buildTestingTree,
  getAngularJsonScripts,
  getMultiProjectFile,
  getPackageJson,
  runSchematic,
  setupHttpHooks,
} from './utils.js';

describe('@puppeteer/ng-schematics: ng-add', () => {
  setupHttpHooks();

  describe('Single Project', () => {
    it('should create base files and update to "package.json"', async () => {
      const tree = await buildTestingTree('ng-add');
      const {devDependencies, scripts} = getPackageJson(tree);
      const {builder, configurations} = getAngularJsonScripts(tree);

      expect(tree.files).toContain('/e2e/tsconfig.json');
      expect(tree.files).toContain('/e2e/tests/app.e2e.ts');
      expect(tree.files).toContain('/e2e/tests/utils.ts');
      expect(devDependencies).toContain('puppeteer');
      expect(scripts['e2e']).toBe('ng e2e');
      expect(builder).toBe('@puppeteer/ng-schematics:puppeteer');
      expect(configurations).toEqual({
        production: {
          devServerTarget: 'sandbox:serve:production',
        },
      });
    });
    it('should update create proper "ng" command for non default tester', async () => {
      let tree = await buildTestingTree('ng-add', 'single');
      // Re-run schematic to have e2e populated
      tree = await runSchematic(tree, 'ng-add');
      const {scripts} = getPackageJson(tree);
      const {builder} = getAngularJsonScripts(tree, false);

      expect(scripts['puppeteer']).toBe('ng run sandbox:puppeteer');
      expect(builder).toBe('@puppeteer/ng-schematics:puppeteer');
    });
    it('should not create Puppeteer config', async () => {
      const {files} = await buildTestingTree('ng-add', 'single');

      expect(files).not.toContain('/.puppeteerrc.cjs');
    });
    it('should create Jasmine files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'single', {
        testRunner: 'jasmine',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain('/e2e/support/jasmine.json');
      expect(devDependencies).toContain('jasmine');
      expect(options['commands']).toEqual([
        [`jasmine`, '--config=./e2e/support/jasmine.json'],
      ]);
    });
    it('should create Jest files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'single', {
        testRunner: 'jest',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain('/e2e/jest.config.js');
      expect(devDependencies).toContain('jest');
      expect(devDependencies).toContain('@types/jest');
      expect(options['commands']).toEqual([
        [`jest`, '-c', 'e2e/jest.config.js'],
      ]);
    });
    it('should create Mocha files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'single', {
        testRunner: 'mocha',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain('/e2e/.mocharc.js');
      expect(devDependencies).toContain('mocha');
      expect(devDependencies).toContain('@types/mocha');
      expect(options['commands']).toEqual([
        [`mocha`, '--config=./e2e/.mocharc.js'],
      ]);
    });
    it('should create Node files', async () => {
      const tree = await buildTestingTree('ng-add', 'single', {
        testRunner: 'node',
      });
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain('/e2e/.gitignore');
      expect(tree.files).not.toContain('/e2e/tests/app.e2e.ts');
      expect(tree.files).toContain('/e2e/tests/app.test.ts');
      expect(options['commands']).toEqual([
        ['node', '--test', '--test-reporter', 'spec', 'e2e/build/'],
      ]);
    });
    it('should not create port value', async () => {
      const tree = await buildTestingTree('ng-add');

      const {options} = getAngularJsonScripts(tree);
      expect(options['port']).toBeUndefined();
    });
  });

  describe('Multi projects', () => {
    it('should create base files and update to "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'multi');
      const {devDependencies, scripts} = getPackageJson(tree);
      const {builder, configurations} = getAngularJsonScripts(tree);

      expect(tree.files).toContain(getMultiProjectFile('e2e/tsconfig.json'));
      expect(tree.files).toContain(getMultiProjectFile('e2e/tests/app.e2e.ts'));
      expect(tree.files).toContain(getMultiProjectFile('e2e/tests/utils.ts'));
      expect(devDependencies).toContain('puppeteer');
      expect(scripts['e2e']).toBe('ng e2e');
      expect(builder).toBe('@puppeteer/ng-schematics:puppeteer');
      expect(configurations).toEqual({
        production: {
          devServerTarget: 'sandbox:serve:production',
        },
      });
    });
    it('should update create proper "ng" command for non default tester', async () => {
      let tree = await buildTestingTree('ng-add', 'multi');
      // Re-run schematic to have e2e populated
      tree = await runSchematic(tree, 'ng-add');
      const {scripts} = getPackageJson(tree);
      const {builder} = getAngularJsonScripts(tree, false);

      expect(scripts['puppeteer']).toBe('ng run sandbox:puppeteer');
      expect(builder).toBe('@puppeteer/ng-schematics:puppeteer');
    });
    it('should not create Puppeteer config', async () => {
      const {files} = await buildTestingTree('ng-add', 'multi');

      expect(files).not.toContain(getMultiProjectFile('.puppeteerrc.cjs'));
      expect(files).not.toContain('/.puppeteerrc.cjs');
    });
    it('should create Jasmine files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'multi', {
        testRunner: 'jasmine',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain(
        getMultiProjectFile('e2e/support/jasmine.json')
      );
      expect(devDependencies).toContain('jasmine');
      expect(options['commands']).toEqual([
        [`jasmine`, '--config=./e2e/support/jasmine.json'],
      ]);
    });
    it('should create Jest files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'multi', {
        testRunner: 'jest',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain(getMultiProjectFile('e2e/jest.config.js'));
      expect(devDependencies).toContain('jest');
      expect(devDependencies).toContain('@types/jest');
      expect(options['commands']).toEqual([
        [`jest`, '-c', 'e2e/jest.config.js'],
      ]);
    });
    it('should create Mocha files and update "package.json"', async () => {
      const tree = await buildTestingTree('ng-add', 'multi', {
        testRunner: 'mocha',
      });
      const {devDependencies} = getPackageJson(tree);
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain(getMultiProjectFile('e2e/.mocharc.js'));
      expect(devDependencies).toContain('mocha');
      expect(devDependencies).toContain('@types/mocha');
      expect(options['commands']).toEqual([
        [`mocha`, '--config=./e2e/.mocharc.js'],
      ]);
    });
    it('should create Node files', async () => {
      const tree = await buildTestingTree('ng-add', 'multi', {
        testRunner: 'node',
      });
      const {options} = getAngularJsonScripts(tree);

      expect(tree.files).toContain(getMultiProjectFile('e2e/.gitignore'));
      expect(tree.files).not.toContain(
        getMultiProjectFile('e2e/tests/app.e2e.ts')
      );
      expect(tree.files).toContain(
        getMultiProjectFile('e2e/tests/app.test.ts')
      );
      expect(options['commands']).toEqual([
        ['node', '--test', '--test-reporter', 'spec', 'e2e/build/'],
      ]);
    });
    it('should not create port value', async () => {
      const tree = await buildTestingTree('ng-add');

      const {options} = getAngularJsonScripts(tree);
      expect(options['port']).toBeUndefined();
    });
  });
});
