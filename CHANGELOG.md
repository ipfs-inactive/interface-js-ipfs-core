<a name="0.72.1"></a>
## [0.72.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.72.0...v0.72.1) (2018-07-16)


### Bug Fixes

* unsubscribe in series for go-ipfs ([#326](https://github.com/ipfs/interface-ipfs-core/issues/326)) ([8e487da](https://github.com/ipfs/interface-ipfs-core/commit/8e487da))


### Breaking Changes

* Git pre-push hook has been removed

  This can cause problems during installation of npm dependencies, in case the repository
  is not freshly cloned. Prior to 0.72.1 a pre-push hook has been set up to verify
  changes before sending them to a remote repository. Due to the removal, existing
  installations will have dead symlinks that cause `npm install` to fail.

  The migration path is to remove the `pre-hook` file/symlink inside `.git/hooks` of
  your clone.

  [Read this issue](https://github.com/ipfs/js-ipfs/issues/1444) for more information.


<a name="0.72.0"></a>
# [0.72.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.71.0...v0.72.0) (2018-07-05)



<a name="0.71.0"></a>
# [0.71.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.70.3...v0.71.0) (2018-07-03)


### Bug Fixes

* revert to serialized pubsub operations ([#319](https://github.com/ipfs/interface-ipfs-core/issues/319)) ([4b5534e](https://github.com/ipfs/interface-ipfs-core/commit/4b5534e))



<a name="0.70.3"></a>
## [0.70.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.70.2...v0.70.3) (2018-07-03)


### Bug Fixes

* allow passing only to suites with skip lists ([#321](https://github.com/ipfs/interface-ipfs-core/issues/321)) ([c47c4ce](https://github.com/ipfs/interface-ipfs-core/commit/c47c4ce))
* allow skip with object but no reason ([#318](https://github.com/ipfs/interface-ipfs-core/issues/318)) ([ef91026](https://github.com/ipfs/interface-ipfs-core/commit/ef91026))
* license ([#312](https://github.com/ipfs/interface-ipfs-core/issues/312)) ([8fa3e98](https://github.com/ipfs/interface-ipfs-core/commit/8fa3e98))



<a name="0.70.2"></a>
## [0.70.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.70.1...v0.70.2) (2018-06-29)



<a name="0.70.1"></a>
## [0.70.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.70.0...v0.70.1) (2018-06-27)


### Bug Fixes

* allow null skip for subsystems ([5df855c](https://github.com/ipfs/interface-ipfs-core/commit/5df855c))



<a name="0.70.0"></a>
# [0.70.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.69.1...v0.70.0) (2018-06-27)


### Features

* modularise tests by command, add tools to skip and only ([#290](https://github.com/ipfs/interface-ipfs-core/issues/290)) ([e232d8c](https://github.com/ipfs/interface-ipfs-core/commit/e232d8c))


### BREAKING CHANGES

* Consumers of this test suite now have fine grained control over what tests are run. Tests can now be skipped and "onlyed" (run only specific tests). This can be done on a test, command and sub-system level. See the updated usage guide for instructions: https://github.com/ipfs/interface-ipfs-core/blob/master/README.md#usage.

This means that tests skips depending on implementation (e.g. go/js), environment (e.g. node/browser) or platform (e.g. macOS/linux/windows) that were previously present in this suite have been removed. Consumers of this library should add their own skips based on the implementation that's being tested and the environment/platform that the tests are running on.

The following other breaking changes have been made:

1. The common object passed to test suites has changed. It must now be a function that returns a common object (same shape and functions as before).
2. The `ipfs.ls` tests (not MFS `ipfs.files.ls`) is now a root level suite. You'll need to import it and use like `tests.ls(createCommon)` to have those tests run.
3. The `generic` suite (an alias to `miscellaneous`) has been removed.

See https://github.com/ipfs/interface-ipfs-core/pull/290 for more details.

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>



<a name="0.69.1"></a>
## [0.69.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.69.0...v0.69.1) (2018-06-26)


### Bug Fixes

* do not rely on discovery for ping tests ([3acd6fd](https://github.com/ipfs/interface-ipfs-core/commit/3acd6fd)), closes [#310](https://github.com/ipfs/interface-ipfs-core/issues/310)



<a name="0.69.0"></a>
# [0.69.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.68.2...v0.69.0) (2018-06-22)



<a name="0.68.2"></a>
## [0.68.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.68.1...v0.68.2) (2018-06-19)


### Bug Fixes

* increase bitswap setup timeout for CI ([5886445](https://github.com/ipfs/interface-ipfs-core/commit/5886445))



<a name="0.68.1"></a>
## [0.68.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.68.0...v0.68.1) (2018-06-18)


### Bug Fixes

* removes error code checks for bitswap offline tests ([b152856](https://github.com/ipfs/interface-ipfs-core/commit/b152856))



<a name="0.68.0"></a>
# [0.68.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.67.0...v0.68.0) (2018-06-18)


### Bug Fixes

* improve bitswap wantlist and unwant docs ([7737546](https://github.com/ipfs/interface-ipfs-core/commit/7737546))
* linting errors ([fcc834c](https://github.com/ipfs/interface-ipfs-core/commit/fcc834c))
* removes duplicated TOC for pubsub ([a358cf7](https://github.com/ipfs/interface-ipfs-core/commit/a358cf7))


### Features

* add bitswap.unwant javascript spec ([df4e677](https://github.com/ipfs/interface-ipfs-core/commit/df4e677))
* add bitswap.unwant javascript spec ([d75a361](https://github.com/ipfs/interface-ipfs-core/commit/d75a361))
* add bitswap.unwant javascript spec ([c291ca9](https://github.com/ipfs/interface-ipfs-core/commit/c291ca9))
* add peerId param to bitswap.wantlist ([9f81bcb](https://github.com/ipfs/interface-ipfs-core/commit/9f81bcb))



<a name="0.67.0"></a>
# [0.67.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.66.4...v0.67.0) (2018-06-04)



<a name="0.66.4"></a>
## [0.66.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.66.3...v0.66.4) (2018-05-30)


### Bug Fixes

* wait for put in object.patch.addLink before hook ([31c52d1](https://github.com/ipfs/interface-ipfs-core/commit/31c52d1))



<a name="0.66.3"></a>
## [0.66.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.66.2...v0.66.3) (2018-05-25)


### Bug Fixes

* correctly differentiate pong responses ([688f4d7](https://github.com/ipfs/interface-ipfs-core/commit/688f4d7))



<a name="0.66.2"></a>
## [0.66.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.66.1...v0.66.2) (2018-05-18)


### Bug Fixes

* spawn in series ([d976699](https://github.com/ipfs/interface-ipfs-core/commit/d976699))



<a name="0.66.1"></a>
## [0.66.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.66.0...v0.66.1) (2018-05-17)


### Bug Fixes

* increase timeouts ([9cba111](https://github.com/ipfs/interface-ipfs-core/commit/9cba111))
* remove .only ([45fab1c](https://github.com/ipfs/interface-ipfs-core/commit/45fab1c))
* wait until nodes are connected before starting ping tests ([1b60f24](https://github.com/ipfs/interface-ipfs-core/commit/1b60f24))
* **pubsub:** clear interval on error ([d074e13](https://github.com/ipfs/interface-ipfs-core/commit/d074e13))



<a name="0.66.0"></a>
# [0.66.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.9...v0.66.0) (2018-05-16)



<a name="0.65.9"></a>
## [0.65.9](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.8...v0.65.9) (2018-05-16)


### Bug Fixes

* add "files." to read* headers ([8b39b12](https://github.com/ipfs/interface-ipfs-core/commit/8b39b12))
* linting warnings ([aae31b0](https://github.com/ipfs/interface-ipfs-core/commit/aae31b0))


### Features

* add utils to spawn multiple nodes and get their ID ([e77a2f6](https://github.com/ipfs/interface-ipfs-core/commit/e77a2f6))



<a name="0.65.8"></a>
## [0.65.8](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.7...v0.65.8) (2018-05-15)



<a name="0.65.7"></a>
## [0.65.7](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.6...v0.65.7) (2018-05-15)



<a name="0.65.6"></a>
## [0.65.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.5...v0.65.6) (2018-05-15)



<a name="0.65.5"></a>
## [0.65.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.4...v0.65.5) (2018-05-12)



<a name="0.65.4"></a>
## [0.65.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.3...v0.65.4) (2018-05-11)



<a name="0.65.3"></a>
## [0.65.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.2...v0.65.3) (2018-05-11)



<a name="0.65.2"></a>
## [0.65.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.1...v0.65.2) (2018-05-11)



<a name="0.65.1"></a>
## [0.65.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.65.0...v0.65.1) (2018-05-11)



<a name="0.65.0"></a>
# [0.65.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.64.3...v0.65.0) (2018-05-11)


### Bug Fixes

* many fixes for pubsub tests with new async unsubscribe ([2019c45](https://github.com/ipfs/interface-ipfs-core/commit/2019c45))
* pubsub subscribe call with options ([c43f8bc](https://github.com/ipfs/interface-ipfs-core/commit/c43f8bc))
* remove .only ([251cffd](https://github.com/ipfs/interface-ipfs-core/commit/251cffd))
* remove duplicate async.each ([f798597](https://github.com/ipfs/interface-ipfs-core/commit/f798597))



<a name="0.64.3"></a>
## [0.64.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.64.2...v0.64.3) (2018-05-06)


### Bug Fixes

* Typos on bundled libraries pull request ([2972426](https://github.com/ipfs/interface-ipfs-core/commit/2972426))


### Features

* add onlyHash option to files.add ([#259](https://github.com/ipfs/interface-ipfs-core/issues/259)) ([63179b9](https://github.com/ipfs/interface-ipfs-core/commit/63179b9))


### Performance Improvements

* **pubsub:** Change pubsub tests to do lighter load testing ([90a1520](https://github.com/ipfs/interface-ipfs-core/commit/90a1520))



<a name="0.64.2"></a>
## [0.64.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.64.1...v0.64.2) (2018-04-23)



<a name="0.64.1"></a>
## [0.64.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.64.0...v0.64.1) (2018-04-23)


### Bug Fixes

* this.skip needs to be under a function declaration ([2545ddd](https://github.com/ipfs/interface-ipfs-core/commit/2545ddd))



<a name="0.64.0"></a>
# [0.64.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.62.0...v0.64.0) (2018-04-23)


### Features

* adds pull stream tests for files.add ([d75986a](https://github.com/ipfs/interface-ipfs-core/commit/d75986a))
* better badge ([#246](https://github.com/ipfs/interface-ipfs-core/issues/246)) ([a3869bf](https://github.com/ipfs/interface-ipfs-core/commit/a3869bf))



<a name="0.63.0"></a>
# [0.63.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.62.0...v0.63.0) (2018-04-23)


### Features

* adds pull stream tests for files.add ([d75986a](https://github.com/ipfs/interface-ipfs-core/commit/d75986a))



<a name="0.62.0"></a>
# [0.62.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.61.0...v0.62.0) (2018-04-14)



<a name="0.61.0"></a>
# [0.61.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.60.1...v0.61.0) (2018-04-10)



<a name="0.60.1"></a>
## [0.60.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.60.0...v0.60.1) (2018-04-05)


### Bug Fixes

* fix wrapWithDirectory test ([a97c087](https://github.com/ipfs/interface-ipfs-core/commit/a97c087))



<a name="0.60.0"></a>
# [0.60.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.59.0...v0.60.0) (2018-04-05)


### Features

* Provide access to bundled libraries when in browser ([db83b50](https://github.com/ipfs/interface-ipfs-core/commit/db83b50))



<a name="0.59.0"></a>
# [0.59.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.58.0...v0.59.0) (2018-04-03)


### Features

* add wrapWithDirectory to files.add et al ([03eec9e](https://github.com/ipfs/interface-ipfs-core/commit/03eec9e))



<a name="0.58.0"></a>
# [0.58.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.57.0...v0.58.0) (2018-03-22)


### Bug Fixes

* wrong description ([bad70ac](https://github.com/ipfs/interface-ipfs-core/commit/bad70ac))



<a name="0.57.0"></a>
# [0.57.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.6...v0.57.0) (2018-03-16)



<a name="0.56.6"></a>
## [0.56.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.5...v0.56.6) (2018-03-16)



<a name="0.56.5"></a>
## [0.56.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.4...v0.56.5) (2018-03-16)


### Bug Fixes

* go-ipfs has not shipped withLocal yet ([58b1fe2](https://github.com/ipfs/interface-ipfs-core/commit/58b1fe2))



<a name="0.56.4"></a>
## [0.56.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.3...v0.56.4) (2018-03-16)



<a name="0.56.3"></a>
## [0.56.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.2...v0.56.3) (2018-03-16)



<a name="0.56.2"></a>
## [0.56.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.1...v0.56.2) (2018-03-16)



<a name="0.56.1"></a>
## [0.56.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.56.0...v0.56.1) (2018-03-16)


### Bug Fixes

* don't error to specific ([ec16016](https://github.com/ipfs/interface-ipfs-core/commit/ec16016))
* fix broken stat tests ([#236](https://github.com/ipfs/interface-ipfs-core/issues/236)) ([fcb8341](https://github.com/ipfs/interface-ipfs-core/commit/fcb8341)), closes [/github.com/ipfs/interface-ipfs-core/commit/c4934ca0b3b43f5bfc1ff5dd38f85d945d3244de#diff-0a6449ecfa8b9e3d807f53dde24eca71R66](https://github.com//github.com/ipfs/interface-ipfs-core/commit/c4934ca0b3b43f5bfc1ff5dd38f85d945d3244de/issues/diff-0a6449ecfa8b9e3d807f53dde24eca71R66)



<a name="0.56.0"></a>
# [0.56.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.55.1...v0.56.0) (2018-03-12)


### Features

* complete files.stat with the 'with-local' option ([#227](https://github.com/ipfs/interface-ipfs-core/issues/227)) ([5969fed](https://github.com/ipfs/interface-ipfs-core/commit/5969fed))



<a name="0.55.1"></a>
## [0.55.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.55.0...v0.55.1) (2018-03-09)


### Bug Fixes

* files.add accepts object ([88a635a](https://github.com/ipfs/interface-ipfs-core/commit/88a635a))



<a name="0.55.0"></a>
# [0.55.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.54.0...v0.55.0) (2018-03-09)


### Bug Fixes

* only skip if it is go-ipfs on Windows ([0df216f](https://github.com/ipfs/interface-ipfs-core/commit/0df216f))



<a name="0.54.0"></a>
# [0.54.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.53.0...v0.54.0) (2018-03-07)


### Bug Fixes

* fixes doc and adds test assertion that peer is a PeerId in return value from swarm.peers ([#230](https://github.com/ipfs/interface-ipfs-core/issues/230)) ([db530d7](https://github.com/ipfs/interface-ipfs-core/commit/db530d7))



<a name="0.53.0"></a>
# [0.53.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.52.0...v0.53.0) (2018-03-07)


### Bug Fixes

* adapt dag tests to current environment ([7a6fc5f](https://github.com/ipfs/interface-ipfs-core/commit/7a6fc5f))
* bwPullStream example ([59bd7ac](https://github.com/ipfs/interface-ipfs-core/commit/59bd7ac))



<a name="0.52.0"></a>
# [0.52.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.51.0...v0.52.0) (2018-02-15)


### Features

* allow stats tests to run on js-ipfs ([#216](https://github.com/ipfs/interface-ipfs-core/issues/216)) ([f6e5f55](https://github.com/ipfs/interface-ipfs-core/commit/f6e5f55))



<a name="0.51.0"></a>
# [0.51.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.50.1...v0.51.0) (2018-02-15)


### Bug Fixes

* bootstrap add test ([df01cc5](https://github.com/ipfs/interface-ipfs-core/commit/df01cc5))


### Features

* **bootstrap:** add the spec ([427338e](https://github.com/ipfs/interface-ipfs-core/commit/427338e))



<a name="0.50.1"></a>
## [0.50.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.50.0...v0.50.1) (2018-02-14)


### Bug Fixes

* add pointer to files-mfs tests ([6bc22c9](https://github.com/ipfs/interface-ipfs-core/commit/6bc22c9))



<a name="0.50.0"></a>
# [0.50.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.49.2...v0.50.0) (2018-02-14)


### Features

* factor out mfs tests to separate file ([91666ca](https://github.com/ipfs/interface-ipfs-core/commit/91666ca))



<a name="0.49.2"></a>
## [0.49.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.49.1...v0.49.2) (2018-02-14)


### Bug Fixes

* remove unnecessary console.log ([e27d3e0](https://github.com/ipfs/interface-ipfs-core/commit/e27d3e0))



<a name="0.49.1"></a>
## [0.49.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.49.0...v0.49.1) (2018-02-12)


### Bug Fixes

* remove .only ([44cdaed](https://github.com/ipfs/interface-ipfs-core/commit/44cdaed))



<a name="0.49.0"></a>
# [0.49.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.48.0...v0.49.0) (2018-02-12)


### Bug Fixes

* use latest fixture loading ([#218](https://github.com/ipfs/interface-ipfs-core/issues/218)) ([e054097](https://github.com/ipfs/interface-ipfs-core/commit/e054097))



<a name="0.48.0"></a>
# [0.48.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.47.0...v0.48.0) (2018-02-07)



<a name="0.47.0"></a>
# [0.47.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.46.0...v0.47.0) (2018-02-07)


### Features

* add stats.bwPullStream and stats.bwReadableStream ([#211](https://github.com/ipfs/interface-ipfs-core/issues/211)) ([4421eb2](https://github.com/ipfs/interface-ipfs-core/commit/4421eb2))



<a name="0.46.0"></a>
# [0.46.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.44.0...v0.46.0) (2018-02-02)



<a name="0.45.0"></a>
# [0.45.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.44.0...v0.45.0) (2018-02-02)



<a name="0.44.0"></a>
# [0.44.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.43.0...v0.44.0) (2018-02-02)


### Features

* ipfs.shutdown test ([#214](https://github.com/ipfs/interface-ipfs-core/issues/214)) ([e911c6c](https://github.com/ipfs/interface-ipfs-core/commit/e911c6c))
* Link stats.repo and stats.bitswap ([#210](https://github.com/ipfs/interface-ipfs-core/issues/210)) ([0c40084](https://github.com/ipfs/interface-ipfs-core/commit/0c40084))
* shutdown spec ([9d91267](https://github.com/ipfs/interface-ipfs-core/commit/9d91267))



<a name="0.43.0"></a>
# [0.43.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.42.1...v0.43.0) (2018-01-25)



<a name="0.42.1"></a>
## [0.42.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.42.0...v0.42.1) (2018-01-25)


### Bug Fixes

* stats not implemented on jsipfs ([#209](https://github.com/ipfs/interface-ipfs-core/issues/209)) ([af32ecf](https://github.com/ipfs/interface-ipfs-core/commit/af32ecf))



<a name="0.42.0"></a>
# [0.42.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.41.1...v0.42.0) (2018-01-25)


### Bug Fixes

* Update PUBSUB.md ([#204](https://github.com/ipfs/interface-ipfs-core/issues/204)) ([0409e3a](https://github.com/ipfs/interface-ipfs-core/commit/0409e3a))


### Features

* add stats spec ([220483f](https://github.com/ipfs/interface-ipfs-core/commit/220483f))
* REPO spec ([#207](https://github.com/ipfs/interface-ipfs-core/issues/207)) ([803a3ef](https://github.com/ipfs/interface-ipfs-core/commit/803a3ef))
* spec MFS Actions ([#206](https://github.com/ipfs/interface-ipfs-core/issues/206)) ([7431098](https://github.com/ipfs/interface-ipfs-core/commit/7431098))



<a name="0.41.1"></a>
## [0.41.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.41.0...v0.41.1) (2018-01-19)


### Bug Fixes

* Revert "feat: use new ipfsd-ctl ([#186](https://github.com/ipfs/interface-ipfs-core/issues/186))" ([#203](https://github.com/ipfs/interface-ipfs-core/issues/203)) ([67b74a3](https://github.com/ipfs/interface-ipfs-core/commit/67b74a3))



<a name="0.41.0"></a>
# [0.41.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.40.0...v0.41.0) (2018-01-19)


### Features

* use new ipfsd-ctl ([#186](https://github.com/ipfs/interface-ipfs-core/issues/186)) ([4d4ef7f](https://github.com/ipfs/interface-ipfs-core/commit/4d4ef7f))



<a name="0.40.0"></a>
# [0.40.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.39.0...v0.40.0) (2018-01-12)



<a name="0.39.0"></a>
# [0.39.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.38.0...v0.39.0) (2018-01-10)



<a name="0.38.0"></a>
# [0.38.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.37.0...v0.38.0) (2018-01-05)


### Features

* normalize KEY API ([#192](https://github.com/ipfs/interface-ipfs-core/issues/192)) ([5a21d6c](https://github.com/ipfs/interface-ipfs-core/commit/5a21d6c))
* normalize NAME API ([#190](https://github.com/ipfs/interface-ipfs-core/issues/190)) ([9670c1a](https://github.com/ipfs/interface-ipfs-core/commit/9670c1a))



<a name="0.37.0"></a>
# [0.37.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.16...v0.37.0) (2017-12-28)



<a name="0.36.16"></a>
## [0.36.16](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.15...v0.36.16) (2017-12-18)


### Bug Fixes

* key.rm test ([#185](https://github.com/ipfs/interface-ipfs-core/issues/185)) ([211e2c5](https://github.com/ipfs/interface-ipfs-core/commit/211e2c5))



<a name="0.36.15"></a>
## [0.36.15](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.14...v0.36.15) (2017-12-12)


### Bug Fixes

* cat not found message in go-ipfs ([#183](https://github.com/ipfs/interface-ipfs-core/issues/183)) ([8e3645e](https://github.com/ipfs/interface-ipfs-core/commit/8e3645e))



<a name="0.36.14"></a>
## [0.36.14](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.13...v0.36.14) (2017-12-12)



<a name="0.36.13"></a>
## [0.36.13](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.12...v0.36.13) (2017-12-10)


### Features

* key tests ([#180](https://github.com/ipfs/interface-ipfs-core/issues/180)) ([b75e13b](https://github.com/ipfs/interface-ipfs-core/commit/b75e13b))



<a name="0.36.12"></a>
## [0.36.12](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.11...v0.36.12) (2017-12-05)



<a name="0.36.11"></a>
## [0.36.11](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.10...v0.36.11) (2017-11-26)



<a name="0.36.10"></a>
## [0.36.10](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.9...v0.36.10) (2017-11-25)



<a name="0.36.9"></a>
## [0.36.9](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.8...v0.36.9) (2017-11-23)



<a name="0.36.8"></a>
## [0.36.8](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.7...v0.36.8) (2017-11-22)


### Bug Fixes

* **pubsub:** swarm connect to local servers ([#175](https://github.com/ipfs/interface-ipfs-core/issues/175)) ([09d9573](https://github.com/ipfs/interface-ipfs-core/commit/09d9573))



<a name="0.36.7"></a>
## [0.36.7](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.6...v0.36.7) (2017-11-20)



<a name="0.36.6"></a>
## [0.36.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.4...v0.36.6) (2017-11-20)



<a name="0.36.5"></a>
## [0.36.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.4...v0.36.5) (2017-11-20)



<a name="0.36.4"></a>
## [0.36.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.3...v0.36.4) (2017-11-17)



<a name="0.36.3"></a>
## [0.36.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.2...v0.36.3) (2017-11-17)



<a name="0.36.2"></a>
## [0.36.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.1...v0.36.2) (2017-11-17)



<a name="0.36.1"></a>
## [0.36.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.36.0...v0.36.1) (2017-11-17)



<a name="0.36.0"></a>
# [0.36.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.35.0...v0.36.0) (2017-11-17)



<a name="0.35.0"></a>
# [0.35.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.34.3...v0.35.0) (2017-11-16)


### Bug Fixes

* **pubsub:** topicCIDs should be topicIDs ([#169](https://github.com/ipfs/interface-ipfs-core/issues/169)) ([d357f5f](https://github.com/ipfs/interface-ipfs-core/commit/d357f5f))



<a name="0.34.3"></a>
## [0.34.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.34.2...v0.34.3) (2017-11-14)



<a name="0.34.2"></a>
## [0.34.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.34.0...v0.34.2) (2017-11-13)



<a name="0.34.1"></a>
## [0.34.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.34.0...v0.34.1) (2017-11-13)



<a name="0.34.0"></a>
# [0.34.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.33.2...v0.34.0) (2017-11-13)



<a name="0.33.2"></a>
## [0.33.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.33.1...v0.33.2) (2017-11-09)


### Bug Fixes

* **package:** aegir is a dependency ([#166](https://github.com/ipfs/interface-ipfs-core/issues/166)) ([72f2f56](https://github.com/ipfs/interface-ipfs-core/commit/72f2f56))



<a name="0.33.1"></a>
## [0.33.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.33.0...v0.33.1) (2017-10-22)



<a name="0.33.0"></a>
# [0.33.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.32.1...v0.33.0) (2017-10-22)



<a name="0.32.1"></a>
## [0.32.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.32.0...v0.32.1) (2017-10-18)


### Bug Fixes

* make tests consistent across js-ipfs/go-ipfs ([#158](https://github.com/ipfs/interface-ipfs-core/issues/158)) ([a5a4c37](https://github.com/ipfs/interface-ipfs-core/commit/a5a4c37))



<a name="0.32.0"></a>
# [0.32.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.31.19...v0.32.0) (2017-10-18)


### Features

* add progress bar tests ([#155](https://github.com/ipfs/interface-ipfs-core/issues/155)) ([fad3fa2](https://github.com/ipfs/interface-ipfs-core/commit/fad3fa2))



<a name="0.31.19"></a>
## [0.31.19](https://github.com/ipfs/interface-ipfs-core/compare/v0.31.18...v0.31.19) (2017-09-04)


### Bug Fixes

* remove superfluous console.logs ([442ea74](https://github.com/ipfs/interface-ipfs-core/commit/442ea74))



