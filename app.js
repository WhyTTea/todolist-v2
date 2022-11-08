//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
//mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://admin-whyttea:Test123@cluster0.xzi61p3.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({name: "Welcome to your todolist!"});
const item2 = new Item({name: "Hit the + button to add an item."});
const item3 = new Item({name: "<-- Select this to delete/cross an item out."});

const defaultItems = [item1, item2, item3];
// creating functionality for multiple lists with one centralized list template
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

//const day = date.getDate();

Item.find({}, function(err,foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err)=>{
        if (err){
        console.log(err);
      } else{
        console.log("Default items have been uploaded successfully.")
      }
    }); 
    res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({name: itemName});
  
  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

  
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", (req, res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err)=>{
    if (err){
      console.log(err);
    } else {
      console.log("The item has been successfully removed.")
      res.redirect("/");
    }
  });
  } else { 
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList)=>{
      if (!err){
        res.redirect("/"+listName);
      }
    });
  }
});
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, (err,foundObj)=>{
    if (!err){
      if (!foundObj){
        // Create a new list
        const list = new List({
        name: customListName,
        items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        //Show an existing list
        res.render("list", {listTitle: foundObj.name, newListItems: foundObj.items});
      }
    }
  });
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
