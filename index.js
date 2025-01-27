import express from "express"
import cors from "cors"
import apiRouter from "./src/api/mainRouter.js"
import globalErrorHandler from "./src/utils/globalErrorHandler.js"

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1', apiRouter)

app.use('*', (req, res) => {
    res.status(404).json({
        status: false,
        message: "URL does not exist"
    })
})

app.use(globalErrorHandler)

app.listen(2000, () => {
    console.log('Server has been started')
})