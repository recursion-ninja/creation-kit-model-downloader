### Creation Kit model downloader

Saves models rendered by the Creation Kit framework as an OBJ file. 
After assets have been loaded by the client browser, local JavaScript
runs to connvert the current `three.js`-based WebGL rendering on the 
current page to an OBJ file (with some filtering).

#### Step 1:

Load a Creation Kit based website.

#### Step 2:

Use the website normally to render a model that you are satisfied with.

#### Step 3:

Open the JavaScript console in your browser:

X       | Windows | Mac | Linux
------- | :-----: | :-: | :---:
Chrome  | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> | <kbd>Cmd</kbd> + <kbd>Opt</kbd> + <kbd>J</kbd> | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>
Firefox | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd> | <kbd>Cmd</kbd> + <kbd>Opt</kbd> + <kbd>K</kbd> | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>K</kbd>
Opera   | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>Opt</kbd> + <kbd>I</kbd> | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
Safari  | N/A | <kbd>Cmd</kbd> + <kbd>Opt</kbd> + <kbd>C</kbd> | N/A

*Note:* There are no other browsers, don't mention Microsoft's feeble attempts at implementing web browsers.

#### Step 4:

Copy & paste the contents of the `creation-kit-model-downloader.js` file into the browser JavaScript console.

*Note:* If this is your first time invoking the JavaScript console in your browser you may be prompted to assert you are condifent in the action you're about to perform. Executing arbitray JavaScript code that you ddon't understand is a significant security risk. It's at this point you must deeply ponder whether you understand/trust this repositories code.

#### Step 5:

Invoke the function `saveCreationKitModel` defined in the `creation-kit-model-downloader.js` file you loaded.
To do this type `saveCreationKitModel('filename');` in the JavaScript console, where `filename` is the name you would like the file you're saving to labeled.

For example, the following would initiate a download for the file `my-very-first-model.obj`:

    saveCreationKitModel('my-very-first-model');
