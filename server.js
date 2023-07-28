require('dotenv').config()
const express = require('express')
const app = express()
const PORT = 3000
const fruits = require('./models/fruits')
const api_key = process.env.api_key
const methodOverride = require('method-override')
//middleware example
app.use((req, res, next)=>{
    //console.log('I run for all routes')
    next()
})
//parses data from form
app.use(express.urlencoded({extended: false}))
app.use(methodOverride('_method'))

app.get('/',  (req, res) => {
    res.send('hello')
})
let giphyArr = []
const findFruit = async(item) => {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${item}&limit=25&offset=0&rating=r&lang=en`)
    const data = await response.json()
    let img = data.data[0].images.fixed_height.url
    //console.log(giphyArr.length, 'length in findFruit')
    giphyArr.push(img)

}

//index
app.get('/fruits/',  async (req, res) => {
    // giphyArr = []
    console.log(giphyArr.length, 'giphy length')
    await findFruit('apple')
    await findFruit('pear')
    await findFruit('banana')
    //can't loop through because some images push faster than others
    // fruits.forEach(async (fruit) => {
    //     console.log(fruit)
    //     await findFruit(fruit.name)
    // })
    console.log(giphyArr.length, 'giphy length after fetches')
    console.log(fruits.length, 'fruits length after fetches')
    const extraElements = giphyArr.length - fruits.length
    console.log(giphyArr, 'before splice')
    console.log(extraElements)
    if(extraElements > 0)giphyArr.splice(-extraElements)
    
    console.log(giphyArr, 'after splice')
    //console.log(giphyArr.length, 'giphy length')
    //console.log(fruits.length, 'fruit length')
    res.render('index.ejs', {
        fruits: fruits,
        giphyArr: giphyArr
    })
})
//new
app.get('/fruits/new/', (req, res)=>{
    res.render('new.ejs')
})
//delete
app.delete('/fruits/:id', (req, res)=>{
    const id = req.params.id
    fruits.splice(id, 1)
    giphyArr.splice(id, 1)
    res.redirect('/fruits')
})

//update
app.put('/fruits/:id', async(req, res)=>{
    const id = req.params.id
    req.body.readyToEat?req.body.readyToEat = true:req.body.readyToEat = false
    console.log(req.body)
    fruits[id] = req.body
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&q=${req.body.name}&limit=25&offset=0&rating=r&lang=en`)
    const data = await response.json()
    let img = data.data[0].images.fixed_height.url
    giphyArr.splice(id, 1, img)
    res.redirect('/fruits')
})
//create
app.post('/fruits',  async(req, res)=>{
    req.body.readyToEat ? req.body.readyToEat = true : req.body.readyToEat = false
    await findFruit(req.body.name)
    fruits.push(req.body)
    res.redirect('/fruits')
    // res.end()
})
//edit
app.get('/fruits/:id/edit', (req, res)=>{
    const id = req.params.id
    res.render('edit.ejs', {
        fruit: fruits[id],
        id: id
    })
})
//show
app.get('/fruits/:id', (req, res)=>{
    const id = req.params.id
    if(id < fruits.length && id >= 0)res.render('show.ejs', {
        fruit: fruits[id],
        id: id,
        giphId: giphyArr[id]
    })
    else res.send('Sorry no fruit')
})

app.listen(PORT, ()=>{
    console.log(`Listening on ${PORT}`)
})