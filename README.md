# File-Manager
GUI File Manager, access both local and ssh files, X-OS (Built on electron), Tested for Windows and Ubuntu

## Build package

```
  cd main
  npm install
  cd server
  npm install
  npm run electron-generate-win           // for windows 64bit
  npm run electron-generate-linux         // for linux 64bit
  // output package will be inside of build folder
  // or run electron packager commands to generate for other operating systems
```

## Run in development mode (In browser)

```
  // terminal 1
  cd main/server
  npm run server // or npm run dev-server (make sure to install nodemon)
  
  // terminal 2
  cd main
  npm run start
```
## Run in production mode (In browser)

```
  cd main
  npm run prod
  // open http://localhost:4500/ in browser
```

## Screenshots


### Local Drives
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(1).png)



### Local Drives - Dark Mode
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(2).png)



### Directory Contents
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(3).png)



### Directory Contents - Dark Mode
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(4).png)



### Right Click Options (Context menu)
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(5).png)



### Create New Folder
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(6).png)



### Success Notification
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(7).png)



### Created new Folder (Auto renames non existing name with unique numbers)
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(8).png)



### Edit path
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(9).png)



### Move to path
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(10).png)



### Add Connection
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(11).png)



### Test Connection
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(12).png)



### Connect to SSH
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(13).png)



### Delete Connection
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(14).png)



### Folder right click
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(15).png)



### Drag Select folders and files
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(16).png)



### Drag Select folders and files 2
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(17).png)



### Drag Select folders and files 3
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(18).png)



### Background Task queue
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(19).png)



### History
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(20).png)



### Background task in progress
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(21).png)



### Shift + Select
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(22).png)



### Ctrl + Select
![Screenshot1](https://raw.githubusercontent.com/27px/Remote-File-Manager/main/docs/Screenshots/screenshot%20(23).png)


#### Icons used are opensource
GIT : [feathericons](https://github.com/feathericons/feathericons.com)
Website : [feathericons.com](https://feathericons.com/)
