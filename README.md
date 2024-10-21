# LinkWarden Connection for Chrome Browsers

## Goal of this Extension

1. View all links saved in LinkWarden through the extension with a tree structure.
2. Add/Delete/Modify all links saved in LinkWarden through the extension.
3. Add/Delete/Modify tags for each link.
4. Add/Delete/Modify folders.

## Installation

1. Clone the repository.
2. Run `yarn install`.
3. Run `yarn build` to build the extension files while watching for changes.
4. Open Chrome and go to `chrome://extensions/`.
5. Enable Developer mode by toggling the switch in the top right corner.
6. Click on `Load unpacked` and select the `build` folder in the cloned repository.
7. Refresh the extension if it is already open or if it isn't showing the updated version.

## Feature Status

| Feature                   | Status      |
| ------------------------- | ----------- |
| View all links            | Working     |
| Add/Delete/Modify links   | Working     |
| Add tags                  | Working     |
| Delete/Modify tags        | Not Working |
| Add/Delete/Modify folders | Not Working |

## Known Issues

1. The extension does work, but after saving the credentials in the extension, the user needs to refresh the extension to see the links.
