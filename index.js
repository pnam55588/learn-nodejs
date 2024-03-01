const express = require("express")
const PORT = 3000
const app = express()
let courses = require("./data")

app.use(express.urlencoded({ extended: true }))
app.use(express.static("./view"))

app.set('view engine', "ejs")
app.set("views", "./views")

app.get('/', (res, resp) => {
    return resp.render("index", { courses })
})


app.post('/add', (req, resp) => {
    const {id, name, course_type, semester, department} = req.body
    const course = {id, name, course_type, semester, department}
    courses.push(course)
    return resp.redirect("/")
})
app.post('/delete', (req, resp) => {
    // get list checkbox checked
    const listChecked = req.body.checkDelete
    if(listChecked.length <=0)
        return resp.redirect("/")
    if(listChecked.length == 1){
        courses = courses.filter(course => course.id != listChecked)
        return resp.redirect("/")
    }
    // delete course
    const ids = listChecked.map(id => parseInt(id)) 
    courses = courses.filter(course => !ids.includes(course.id))
    return resp.redirect("/")
})

app.listen(PORT, () => {
    console.log("port: ", PORT);
})