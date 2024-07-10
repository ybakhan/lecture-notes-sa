# Lecture Notes Assistant 

A web app to record a live lecture, generate a summary, and AI chat about the lecture.

## Start app server

```
cd ./server
yarn install
yarn bundle:prod
node ./dist/index.js
```

## Start app client

```
cd ./client
npm install
npm start
```
Access web app on [localhost:1234](http://localhost:1234)

Allow your browser to access the microphone. 

Powered by [AWS Transcribe](https://aws.amazon.com/pm/transcribe/) and OpenAI [gpt-3.5-turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo)
