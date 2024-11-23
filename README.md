# Group-project-6
Node.JS + React + CSS + HTML


Creation of a backend server for monitoring water consumption in an application

The goal of the project is to develop a backend server for a mobile or web application designed to track and control the amount of water drunk by a user. The server will process user data, manage application functionality and ensure stable operation of all necessary APIs.

collection users:
name:
email:
password:
avaterUrl
gender
weight
activeTime
dailyNorm
createdAt
updatedAt

collection session :
userId
accessToken
refreshToken
accessTokenValidUntil
refreshTokenValidUntill

collection water:
amount
userId
date  = 'YYYY-MM-DDThh:mm:ss'
currentDailyNorm
createdAt
updatedAt
