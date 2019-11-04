# Files API v2

There have long been dreams of uniting the files APIs. This is a new proposal for doing so.

## Table of Contents

* [Background](#background)
* [Problems](#problems)
* [Solutions](#solutions)

## Background

In IPFS there are two sets of APIs for dealing with files. At the root level there is `add`, `cat`, `get` and `ls`. Since IPFS deals with immutable data there's no way to actually change data once it has been imported. You can only retrieve data, import more data or remove data you no longer wish to store in your local repo (That last part refers to pinning and garbage collection, which is somewhat outside the scope of this proposal but elements of these things will be covered with respect to UX and performance. If you're unfamiliar with those concepts, please read https://docs.ipfs.io/guides/concepts/pinning/ before continuing).

You _could_ change a file outside of IPFS and re-import it. IPFS will do it's best to de-dupe the data, but the fact remains that you haven't changed the original file. Changing files is quite a common thing to do so there exists a separate set of API methods specifically for dealing with changing files that have already been imported into IPFS. These are the Mutable File System (or MFS) API methods that deal with the fiddly work of mutating a DAG to change it's structure while re-using as many existing nodes as possible. It is an abstraction to make the immutable nature of IPFS appear as though it is mutable, but behind the scenes the only mutation that occurs is the tracking of the CID for a root node of a DAG that contains all MFS data in _your_ IPFS repo. Nodes in the DAG are never changed, only created or removed as necessary.

The MFS API methods are `write`, `read`, `ls`, `cp`, `mv`, `mkdir`, `rm`, `mkdir`, `stat`, `flush`. These API methods reside under the `files` namespace.

### IPFS paths and MFS paths

Aside from `add`, the root level Files API methods deal with IPFS paths. They start with `/ipfs`, followed by `/QmHash` (where `QmHash` is a CID of a file or directory) and optionally end with a path to another file or directory linked to from `QmHash` e.g. `/optional/path/to/file`. Altogether this looks like `/ipfs/QmHash/optional/path/to/file`.

MFS paths do not have a `/ipfs/QmHash` component. Since IPFS deals with immutable data the only way we can "mutate" it is to make changes in our own repo. Changing (or mutating) a file changes it's CID because the CID is intrinsically linked to the file's content. Changes to any file in MFS necessitate changes all the way up the tree from the file to the root node because we count links as part of a file's content.

So you can think of MFS data in terms of an IPFS path like `/ipfs/QmMFSRoot/path/to/file` where `QmMFSRoot` is the CID of the root of the MFS DAG that changes on every "write". It would be onerous to have to remember the current MFS root CID, and IPFS is tracking it for you anyway, so we omit it from MFS paths.

You can get the current IPFS path for any file or directory in MFS using the `stat` command. However, as we just established, "writes" in MFS change CIDs, so sharing that path to the wider IPFS network does not guarantee that the content of that file will be obtainable from your node if the file is subsequently changed and garbage collection is run.

Any node linked to by the MFS root CID is immune from garbage collection, and so this is where the concept of "pinning" becomes necessary. If you need to retain an older version of a file in MFS, you must "pin" it before changing it so that parts of the file no longer in use do not get garbage collected. There are other reasons that "pinning" needs to exist, such as for lower level APIs like the `dag` API, which are also able to write to the repo.

## Problems

This arrangement has existed for a long while and there have been proposals to unite the APIs in the past. Here are a few links where you can read more:

* https://github.com/ipfs/specs/issues/98
* https://github.com/ipfs/interface-js-ipfs-core/issues/284

The following attempts to enumerate the biggest issues with the current state of the files API as objectively as possible. In the next section we'll propose solutions to resolve them. Note that these are not in any particular order.

### 1. There's two `ls` methods

The root level `ls` method works with IPFS paths and the `files.ls` works with both MFS paths _and_ IPFS paths.

There is an issue differentiating between the two different path types - there's a small possibility someone saved something in MFS at `/ipfs/QmHash/path/to/file`. MFS already deals with this in the `cp` command. If the path looks like an IPFS path it assumes it's an IPFS path even if the same path exists in MFS.

It's confusing for `cp` to be able to deal with both path types but for `ls` not to be able to do the same. Similarly, it's confusing to have two `ls` commands that deal with files in IPFS.

### 1.1 The `type` is inconsistent

The `type` field in objects returned differs between calls to `ls` and `files.ls`. In `ls`, a file is 2 and a directory is 1. In `files.ls` a file is 0 and a directory 1.

### 2. API methods are not streaming by default

API methods should, where appropriate, be streaming by default and there should only be one, perferably language native, way to stream data from IPFS.

For some directories `ls`/`files.ls` is simply unusable due to the size of the directory. The listing does not fit in memory or is so large that when it is attempted to be retrieved it takes so long that it appears to have stalled. This not only a bad user experience but makes IPFS unusable for big data storage. Streaming APIs actually play very well with the way that data is stored and retrieved from peers in IPFS and improves UX by providing user with feedback as soon as the first chunk arrives, rather than waiting (potentially forever) for an operation to complete.

In js-ipfs we have alternatives to non-streaming APIs using Node.js streams and pull streams. However, neither of those are browser native, the latter is less widely used and we've ended up with a bloated API surface area, large bundle size, and user confusion around which to use by offering 3 different versions of a single API method.

A multitude of libraries exist to collect or transform data from streams and it's possible that in the near future async iterators in JavaScript will actually support many of them [natively](https://github.com/tc39/proposal-iterator-helpers).

### 3. API methods are not abortable (and by virtue have no timeout)

This is a problem for all IPFS APIs but is probably most frustrating when using IPFS files APIs to retrieve content from peers. There's currently no way to abort a call to an API method. This wastes resources and does not help with the smooth running of the node, especially if it has been asked to retrieve a HUGE file that is not well hosted on the network. Typically the only way to find this out is to call the method and observe it being unresponsive.

The very least we can do is offer a way of cancelling (or aborting) a method call and a default timeout that expires after a reasonable period of inactivity.

### 3.1. No progress visibility

There's no visibility into what is being done internally to deal with method calls. Since API calls are not streaming by default there's not even a way of knowing if IPFS has the data locally or is searching for peers who have the data or has even begun retrieving it at all.

In go-ipfs the log API can be used for this to some extent, but this puts the burden on the application developer to pick out log lines that are relevant to their method call. It would be more useful if some sort of progress indication was available on a method level to more easily give the user an indication of what's happening so that they can make an informed decision about whether to abort the request or leave it running.

### 4. There's no name for the root files API

There are two separate APIs residing at different namespaces for dealing with files in IPFS. It's difficult to even distinguish between the two. How does one refer to the API at the root level? "Files API" causes confusion with MFS API at the "files" namespace. "Root Files API" seems to suggest this API deals with files only residing at some root level. "Regular Files API" just adds a superfluous word that does nothing to distinguish it.

Furthermore, when you expand IPFS to InterPlanetary File System, it sounds unnecessary to refer to this API as InterPlanetary File System Files API since it is the _main_ API to interact with IPFS, it in itself a File System.

### 4.1. `files` is indirection in the way of interacting with core IPFS

Subjectively, namespacing APIs designed to interact with files in a `files` namespace is a nice way to compartmentalise them from other APIs in IPFS. Objectively though, the fact remains that typing `ipfs files read` is significantly longer than typing `ipfs read`. Considering that IPFS is primarily a file system, it makes sense for all the file system APIs to be "front and center" and thus available on the root namespace as `add`, `cat`, `get` and `ls` already are.

### 5. Users do not understand when to use `add` vs `files.write`

The `add` and `write` API methods are a little too similar in name and cause confusion amongst users who do not understand the difference or in what situations one or the other should be used. This is because `write` effectively adds content to IPFS as well. The current `add` API method is more synonymous to importing data into IPFS from an outside source and could perhaps be renamed to more accurately reflect this.

### 6. Pinning is an alien concept

The act of pinning, even though the concept is relatively simple, is not widely recognised by anyone outside of the IPFS world. As mentioned earlier, the pin APIs are necessary for lower level APIs present in IPFS but we could remove the need for pinning and the overhead it creates when importing files if imported files were simply added to MFS.

### 6.1. IPFS is not a small focused core

IPFS is super modular in architecture but it is bundled with almost everything by default. This arrangement is reasonable for a binary distribution designed to run on servers or desktops but in browsers or on mobile where bandwidth and system resources are constrained a bundle that includes all functionalities is far from ideal. Note that this also applies to go-ipfs as well as js-ipfs because webassembly. A small core that is focused on the file system may allow us to exclude many user facing APIs.

If imported files are added to MFS, we _could_ remove `pin` in it's entirety from a small focused "core". Other APIs like `config`, `bitswap`, `block`, `bootstrap`, `dag`, `dht`, `object`, `pin`, `ping`, `pubsub`, `refs` could also be removed to create an even leaner core (although in some cases aspects of these APIs would still be in use behind the scenes).

This problem requires further definition and reasoning and consequently it is outside the scope of the solutions in this proposal, but it's worth entertaining nethertheless!

### 7. `cat` and `files.read` are the same

These methods perform the same operation, and `files.read` also already works with both MFS and IPFS paths.

### 8. A single imported file loses it's name

The common case of importing a single file to IPFS gives us back a CID but the file loses it's file name in the process unless the user explicitly asks for it to be "wrapped" in a directory. This is a big hurdle to overcome mentally and a significant WTF moment for people new to IPFS. This also means that the file extension is lost, losing any hint of what is inside. Also, exporting a file out of IPFS to a user's OS yields a file that the OS does not know how to open. Finally, having no name is bad for SEO both on the gateway or otherwise.

---

## Solutions

### 1. Rename `add` to `import`

"Import" more accurately describes what is occurring and will prevent confusion with `write`.

```sh
ipfs import --help
# ...
```

It's also the [current name of the API method to import data into `go-filecoin`](https://github.com/filecoin-project/go-filecoin/blob/204837f72d20bd89889fcf92061c8846b238ccf4/cmd/go-filecoin/client.go#L62).

#### 1.1 Add to MFS

Adding files to MFS removes any performance overhead of creating/maintaining pinset DAG nodes, unburdens the user from understanding pinning, improves visibility of added files and makes it significantly easier to find or remove files that were previously imported.

The `ipfs import` command _optionally_ takes a MFS path option `--dest`, a directory into which imported files are placed. Note the destination directory is automatically created (but not any parents). If the destination directory exists already then an error is thrown, unless the `--overwrite` flag is set. This causes any existing files with the same name as the imported files to be overwritten.

If the destination directory is not specified, IPFS creates a new directory for the import with a timestamp (to aid the user in finding previously imported files). e.g. `/imports/2019103114555959/[imported files]`. If the directory already exists, it wll be suffixed with a number, e.g. `2019103114555959-1`.

```sh
ipfs import document.txt --dest=/my-docs
```

Adding imported files to MFS also solves the problem of files not having names, since they will always be added to a directory from which they can be accessed.

#### 1.2 Changes to returned values

1. Importing a single file will now yield two entries, one for the imported file and one for the containing directory. Note this change is actually backwards compatible: in the current API you'd receive an array of one value which you would access like `files[0]`.
2. Instead of a `hash` property, entries will instead have a `cid` property. In entries yielded from core it will be a CID instance, not a string (as agreed in [ipfs/interface-js-ipfs-core#394](https://github.com/ipfs/interface-js-ipfs-core/issues/394)). In the HTTP API/CLI it will necessarily be a string, encoded in base32 by default or whatever `?cid-base`/`--cid-base` option value was requested.

Example:

```js
{
  path: '/imports/2019103114555959/myfile',
  cid: CID,
  size: 1234
},
{
  path: '/imports/2019103114555959',
  cid: CID,
  size: 1234
}
```

#### 1.3 Remove `pin` option

If users actually want to pin the data _as well_ they should use the pinning API after importing.

#### 1.4 Remove `wrap-with-directory` option

Every import will effectively be "wrapped" in a directory so this option is no longer required.

### 2. Remove `cat`

For people for which cat means 🐈, the API method will be named `read`, which is the more obvious opposite to `write` anyway. It will also be streaming by default.

### 3. Hoist all methods in the `files` namespace to the root level

Methods that are integral for interacting with the InterPlanetary File System will reside on the root namespace. The reasoning is that these commands are important and will be used often so need to be given priority and ease of access over other APIs that IPFS exposes. It will more effectively advertise what the IPFS core functionality is to aid onboarding and understanding of IPFS in general.

For clarity, the API movement/renaming changes are as follows:

| Old name | New name |
|---|---|
| `ipfs add` | `ipfs import` |
| `ipfs cat` | (removed) |
| `ipfs get` | `ipfs get` |
| `ipfs ls` | (removed) |
| `ipfs files cp` | `ipfs cp` |
| `ipfs files flush` | `ipfs flush` |
| `ipfs files ls` | `ipfs ls` |
| `ipfs files mkdir` | `ipfs mkdir` |
| `ipfs files mv` | `ipfs mv` |
| `ipfs files read` | `ipfs read` |
| `ipfs files rm` | `ipfs rm` |
| `ipfs files stat` | `ipfs stat` |
| `ipfs files write` | `ipfs write` |

### 5. Allow both IPFS and MFS paths in API methods

Rather than explicitly splitting MFS from the rest of IPFS, we can use MFS paths to refer to content on our local node and IPFS paths to refer to content on the wider IPFS network. We can draw an analogy here with way we use Unix paths and URLs today for working with our OS and the Internet. Where it makes sense, we can allow MFS paths in the root level API methods and IPFS paths in the MFS API methods. This has already been proven possible as many MFS API methods already accept IPFS paths.

| Method | Accepts IPFS paths | Accepts MFS paths |
|---|---|---|
| `ipfs import` | ❌ | ❌ |
| `ipfs cp` | ✅ | ✅ |
| `ipfs get` | ✅ | ✅ |
| `ipfs flush` | ❌ | ✅ |
| `ipfs ls` | ✅ | ✅ |
| `ipfs mkdir` | ❌ | ✅ |
| `ipfs mv` | ✅ | ✅ |
| `ipfs read` | ✅ | ✅ |
| `ipfs rm` | ❌ | ✅ |
| `ipfs stat` | ✅ | ✅ |
| `ipfs write` | ❌ | ✅ |

### 4. Streaming APIs by default

---

# Rough notes

## Solutions

* Distinguish by path type - anything that doesn't start with `/ipfs` is MFS.