This setup is configured to use nw.js 0.34.5 to reproduce the crash. All unnecessary code of our app is stripped away and renamed.
The structure did not change and with the stripped code might look a bit silly. 
There is also some code currently awaiting refactoring as it uses horrible syntax. I did not change the code structure for this crash test.


nwjs is installed via npm using `npm i -D nw@0.34.5-sdk`. Additionally for dependecy compilation the property `build.nwVersion` is set to match the installed version 0.34.5 in the package.json.
To update nwjs both need to point to the new version (see further down).

I kept a logger in the code to see log messages even after crash as they are written to a file as well as outputted into the browser console. And I left a trail of logs to follow.
Start with the `src/vies/launch.vue` file and follow th trail.

you find the log files in:
mac: ~/Library/Logs/crash-test-dummy-dev/
win: current users AppData\Local\crash-test-dummy-dev\Logs\ folder

# Setup

Make sure you have `Node 10.0.0` or newer installed as well as `npm 6` or newer installed. We also need a few compilation tools for compiling sqlite3:

```
npm i -g npm@6 node-pre-gyp node-gyp nw-gyp
```

Inside your local repository clone run:

```
npm ci
npm run compile
```

to make sure all binary dependencies a build against the correct version execute the script `scripts/compile-binary-dependencies.js` via `npm run compile`.
This script needs to know the nwjs version used. That version can be configured in teh package.json. There you find a property `build.nwVersion`. 
For development we always use the sdk version.We configured it this way so our build servers will always pick up the right verison for nwjs and compile the dependencies automatically for us.
Since v0.35.0 is not yet public you need to extend the `scripts/compile-binary-dependencies.js` in line 40 to pass in the tarball of the nwjs header files in case you want to run it against 0.35.0.
the `npm run start` script uses a nw.js verison downloaded via npm so here too you need to manually change things using node 0.35.0. You need to replace the files in `node_modules/nw/nwjs/`.
We do it like this so our build servers do not need a globally installed nwjs version and can therefore build with multiple nwjs versions as they are capable in downloading the right version automatically.


*Note:* We use `npm ci` to not update our dependencies during install.

# Launch

```
npm run build
npm run start
```

Once the code is build there should be a new folder `dist` this contains the whole program nwjs will launch and `npm run start` points to the source files of that folder.

