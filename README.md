# TinyApp Project

A simple link shortening Node web app a la TinyURL and bit.ly.

## Dependencies
***

In order to successfully run the web app, please ensure that you have installed the required dependencies outlined in the package.json file, namely:

- [bcryptjs - 2.4.3](https://www.npmjs.com/package/bcryptjs)
- [cookie-session - 2.0.0](https://www.npmjs.com/package/cookie-session)
- [ejs - 3.1.8](https://www.npmjs.com/package/ejs)
- [express - 4.18.2](https://www.npmjs.com/package/express)

Also:

- [node - v16.18.0 (minimum)](https://nodejs.org/en/download/)

Optional:

- [nodemon - 2.0.20](https://www.npmjs.com/package/nodemon)
  - useful if you wish to tinker with/alter the source files


## Getting Started
***

Start by installing this repo locally by [forking](https://docs.github.com/en/get-started/quickstart/fork-a-repo) and [cloning](https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository) this repo onto your machine. 

In a terminal of your choice, navigate to the installed repo on your machine and run the following command:
```
node express_server.js
```
_or, if you installed [nodemon](https://www.npmjs.com/package/nodemon):_

```
npm start
```

>Server-side up and running at this point! Next is the client-side ↴

In a browser of your choice, in the address bar, navigate to: 
```
localhost:8080/
```
You will be met with a login page:
!["login-page"](/assets/images/TinyApp-login.png)

Click on the register button, which will bring you to the following registration page:
!["registration-page"](/assets/images/TinyApp-register.png)

Upon creating an account, you will now have access to all the features and functionality the web app has to offer!
!["demo"](/assets/images/TinyApp-demo.gif)