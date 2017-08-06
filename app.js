var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressSanitizer = require("express-sanitizer");

//=============================
//     APP CONFIG
//=============================
//connect to DB
mongoose.connect("mongodb://localhost/restful_blog_app");

//set view engine
app.set("view engine", "ejs");

//set body-parser
app.use(bodyParser.urlencoded({extended:true}));

//set static dir
app.use(express.static("public"));

//set method override
app.use(methodOverride("_method"));

//set express-sanitizer (must after body-parser!!)
app.use(expressSanitizer());

//=============================
//    MONGOOSE/MODEL CONFIG
//=============================
var blogSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default: "http://www.skyradio.nl/img/placeholder_600x450.jpg"},
    body: String,
    created: {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog",blogSchema);

// testing input data
// Blog.create({
//     title: "Test Blog",
//     image: "http://letu.soundofhope.org/wp-content/uploads/2015/10/14452107477118.jpeg",
//     body: "The Yong Philosopher Shiba Inu TESTING"
// });

//=============================
//       RESTFUL ROUTES
//=============================

//如果url是跟目錄，導向blogs頁面
app.get("/",function(req,res){
    res.redirect("/blogs");
});
app.get("/blogs", function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log("INDEX ERROR!");
            console.log(err);
        }else{
            res.render("index",{blogs});
        }
    });
});

// NEW
app.get("/blogs/new",function(req,res){
    res.render("new");
});

//CREATE <---add sanitizer!
app.post("/blogs",function(req,res){
    //sanitize Data
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //create blog
    Blog.create(req.body.blog,function(err, NewBlog){
        if(err){
            console.log(err);
            res.render("new");
        }else{
            //return to index
            res.redirect("/blogs");
        }
    });
})

//SHOW more info with specific id
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.render("show",{blog: foundBlog});
        }
    });
});

//EDIT
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err, foundBlog){
        if(err){ 
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.render("edit",{blog: foundBlog});
        }
    });
});

//UPDATE
app.put("/blogs/:id",function(req,res){
    
     req.body.blog.body = req.sanitize(req.body.blog.body);
    
    // Blog.findByIdAndUpdate(id, newData, callback);
    
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DELETE
app.delete("/blogs/:id", function(req,res){
    //delete data
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            //redirect to index
            res.redirect("/blogs");
        }
    });
});

//=============================
//     Launch Server
//=============================
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Restful Blog Started!");
});