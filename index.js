const express = require('express')
const deHelper = require('./dbHelper')
const app = express()

app.user(express.static("views"))

app.listen(8848)