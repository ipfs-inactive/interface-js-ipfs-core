# Files API v2

There have long been dreams of uniting the files APIs. This is a new proposal for doing so.

## Background

In IPFS there are two sets of APIs for dealing with files. At the root level there is `add`, `cat`, `get` and `ls`. Since IPFS deals with immutable data there's no APIs to change data once it has been imported. You can only retrieve data, import more data or remove data you no longer wish to store in your local repo (That last part refers to pinning and garbage collection, which is somewhat outside the scope of this proposal but elements of these things will be covered with respect to UX and performance. If you're unfamiliar with those concepts, please read https://docs.ipfs.io/guides/concepts/pinning/ before continuing).

You _could_ change a file outside of IPFS and re-import it. IPFS will do it's best to de-dupe the data, but the fact remains that you haven't changed the original file. Changing files is quite a common thing to do so there exists a separate set of API methods specifically for dealing with changing files that have already been imported into IPFS. These are the Mutable File System (or MFS) API methods that deal with the fiddly work of mutating a DAG to change it's structure while re-using as many existing nodes as possible. It is an abstraction to make the immutable nature of IPFS appear as though it is mutable, but behind the scenes the only mutation that occurs is the tracking of the CID for a root node of a DAG that contains all MFS data in _your_ IPFS repo. Nodes in the DAG are never changed, only created or removed as necessary.

The MFS API methods are `write`, `read`, `ls`, `cp`, `mv`, `mkdir`, `rm`, `mkdir`, `stat`, `flush`. These API methods reside under the `files` namespace.

### IPFS paths and MFS paths

Aside from `add`, the root level Files API methods deal with IPFS paths. They start with `/ipfs`, followed by `/QmHash` (where `QmHash` is a CID of a file or directory) and optionally end with a path to another file or directory linked to from `QmHash` e.g. `/optional/path/to/file`. Altogether this looks like `/ipfs/QmHash/optional/path/to/file`.

MFS paths do not have a `/ipfs/QmHash` component. Since IPFS deals with immutable data the only way we can "mutate" it is to make changes in our own repo. Changing (or mutating) a file changes it's CID because the CID is intrinsically linked to the file's content. Changes to any file in MFS necessitate changes all the way up the tree from the file to the root node because we count links as part of a file's content.

So you can think of MFS data in terms of an IPFS path like `/ipfs/QmMFSRoot/path/to/file` where `QmMFSRoot` is the CID of the root of the MFS DAG that changes on every "write". It would be onerous to have to remember the current MFS root CID, and IPFS is tracking it for you anyway, so we omit it from MFS paths.

You can get the current IPFS path for any file or directory in MFS using the `stat` command. However, as we just established, "writes" in MFS change CIDs, so sharing that path to the wider IPFS network does not guarantee that the content of that file will be obtainable from your node if the file is subsequently changed and garbage collection is run.

Any node linked to by the MFS root CID is immune from garbage collection, and so this is where the concept of "pinning" becomes necessary. If you need to retain an older version of a file in MFS, you must "pin" it before changing it so that parts of the file no longer in use do not get garbage collected. There are other reasons that "pinning" needs to exist, such as for lower level APIs like the `dag` API, which are also able to write to the repo.

## Problems

This arrangement has existed for a long while and there have been proposals to unite the APIs in the past. There are a few links where you can read more:

* https://github.com/ipfs/specs/issues/98
* https://github.com/ipfs/interface-js-ipfs-core/issues/284

The following attempts to enumerate the biggest issues with the current state of the files API as objectively as possible. In the next section we'll propose solutions to resolve them. Note that these are not in any particular order.

### 1. There's no name for the root files API

There are two separate APIs residing at different namespaces for dealing with files in IPFS. It's difficult to even distinguish between the two. How does one refer to the API at the root level? "Files API" causes confusion with MFS API at the "files" namespace. "Root Files API" seems to suggest this API deals with files only residing at some root level. "Regular Files API" seems to be adding a superfluous word that does nothing to distinguish it.

Furthermore, when you expand IPFS to InterPlanetary File System, it sounds unnecessary to refer to this API as InterPlanetary File System Files API since it is the _main_ API to interact with IPFS, it in itself a File System.

---

# Rough notes

* rename add -> import
* create alias add for import
* import takes dest dir and adds to mfs
* Remove pin option from add
* `add` and `write` when to use?
* MFS is `files` is confusing
* `files` is indirection in the way of interacting with core IPFS
* There's 2 `ls` methods
* A root folder in MFS called 'ipfs'!??!
* A small core API with no pinning
* Pinning is alien
* No streaming APIs