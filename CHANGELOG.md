# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.4](https://github.com/tesalate/main-api/compare/v0.1.2...v0.1.4) (2022-02-20)


### Build System

* **dockerfile package.json:** smaller docker image 1.21GB -> 114MB ([e2e4e9d](https://github.com/tesalate/main-api/commit/e2e4e9dfb3d8fa9f223b0905a1e3a7d3506681a9))


### Others

* **release:** 0.1.3 ([80daa16](https://github.com/tesalate/main-api/commit/80daa16c6abd6b177564d8aebf2b37ae63eacd34))

### [0.1.3](https://github.com/tesalate/main-api/compare/v0.1.2...v0.1.3) (2022-02-20)


### Build System

* **dockerfile package.json:** smaller docker image 1.21GB -> 114MB ([e2e4e9d](https://github.com/tesalate/main-api/commit/e2e4e9dfb3d8fa9f223b0905a1e3a7d3506681a9))

### [0.1.2](https://github.com/tesalate/main-api/compare/v0.1.1...v0.1.2) (2022-02-15)

### [0.1.1-alpha](https://github.com/tesalate/main-api/compare/v0.1.0...v0.1.1-alpha) (2022-02-15)


### CI

* **auto-merge.yml:** change auto-merge steps ([218570f](https://github.com/tesalate/main-api/commit/218570f563220711329bd33c8fff43982436d3b7))

### [0.1.1](https://github.com/tesalate/main-api/compare/v0.1.0...v0.1.1) (2022-02-15)


### Bug Fixes

* **auth.* mappoint.*:** update routes to return a better object formatted for the frontend ([17c789f](https://github.com/tesalate/main-api/commit/17c789f93dc8b895ebbc7e6aa7c03537d2935a50))


### Code Refactoring

* **docker-compose*.yml db.ts:** improves local development with docker compose ([2e5daf9](https://github.com/tesalate/main-api/commit/2e5daf93cc4179c2df826128c94da77ae0d47541))


### Others

* **package.json yark.lock:** dependency update ([ae82a9c](https://github.com/tesalate/main-api/commit/ae82a9cfb2c93b4668e62c47563d5eda8c4b5307)), closes [#31](https://github.com/tesalate/main-api/issues/31)
* **package.json:** remove "git add" step from lint-staged ([ce1e378](https://github.com/tesalate/main-api/commit/ce1e3780e79ccbc0885d4ac2f261d6a8c400dca3))


### Tests

* **dbhandler.ts:** fix issue where db watch tests would fail ([5f94e03](https://github.com/tesalate/main-api/commit/5f94e03f588d2a203dad58d4c2912b955e785f3b))
* **docker-compose.test.yml readme.md package.json:** removes docker-compose.test.yml ([cdc50eb](https://github.com/tesalate/main-api/commit/cdc50eb654c96e0ff442b6dd16cd2fb62d587875))


### CI

* **auto-merge.yml:** auto merge dependabot PR patches ([f790372](https://github.com/tesalate/main-api/commit/f790372e6af65d5b132825d06e1444370fc0eba7))
* **coverage.yml:** turns off coverage test for dependabot PRs ([68dd5f6](https://github.com/tesalate/main-api/commit/68dd5f6896cab3f6350f987cd1c5e0e315bf095b))

## [0.1.0](https://github.com/tesalate/main-api/compare/v0.1.0-alpha...v0.1.0) (2022-02-05)


### Others

* **changelog.md .versionrc package.json:** add standard-version to project ([fffb53c](https://github.com/tesalate/main-api/commit/fffb53c6b755e4f19a0c427b87ddf15934cf3278))
* **package.json readme.md:** adds commitizen to project/repo ([7fbfaae](https://github.com/tesalate/main-api/commit/7fbfaaebf050ce924955a26cc432d4fb00ed1b5d))


### Tests

* **dbhandler.ts docker-compose.yml package.json:** fixes intermittent "dup key" error when testing ([5474274](https://github.com/tesalate/main-api/commit/5474274e53593c059b0de4798d7f20a4e6400e39))


### Docs

* **.env.example .prettierignore contributing.md package.json readme.md:** update Documentation ([fbbbe69](https://github.com/tesalate/main-api/commit/fbbbe697e36465a2870defbae22f6a80d6465042)), closes [#19](https://github.com/tesalate/main-api/issues/19)
