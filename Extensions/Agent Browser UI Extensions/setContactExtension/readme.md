# Set Contact Extension

In the CX service site, the contact field is a read-only field. When a new incident workspace is opened, the Contact field is automatically populated using details of the logged-in user account. In case a contact does not exist for an account, a new contact is created, and this value is assigned to the contact field.

## Working
Rest calls are used to 
  i)Get details of logged-in account details
  ii)Check whether contact exists with same email as logged-in account
  iii)In case no contact exist, a new contact is created
Extensibility is used for
  i)Getting account ID, session token, interface URL
  ii)Updating contact field with existing/new contact id.

## Installation
- Open add-in manager on .net console
- Create new BUI extension
- Upload the extension as a zip file.
- Choose index.html as the Init file.
- Select Extension type as Workspace and give a proper name to the extension.
- Assign profile access
- Click Save & Close
- Adding extension to workspace
  - Open the required Incident workspace in workspace designer
  - Drag the extension into the required place
  - Double click the extension and open design tab in object tools
  - Click the size set it to 1*1

## Error Logging
 The errors/warning messages will be logged to the Extension Log Viewer
