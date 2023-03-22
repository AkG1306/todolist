const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const _ = require("lodash")
const app = express();
const port = 3000;

// const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://admin-akshay:test123@atlascluster.27rkylj.mongodb.net/todolistDB');

const itemsSchema = new mongoose.Schema({
  name:String
});

const items = mongoose.model("items",itemsSchema);

//var items = ["buyfood", "make food", "eat food"];
//var workItem = [];

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));
app.set("view engine", "ejs");

const item1 = new items({
  name : "namaste"
});
const item2 = new items({
  name : "hi"
});
const item3 = new items({
  name : "hello"
});

const ListSchema = new mongoose.Schema({
  name:String,
  ListItems : [itemsSchema]
})

const List = mongoose.model("List",ListSchema)
const defaultItems = [item1,item2,item3]

async function insert(){
  try {
  await items.insertMany(defaultItems);
   console.log("successfully saved to db")
    
  } catch (error) {
    console.log("error")
  }
}
//insert()





app.get("/", function (req, res) {


  async function findItems(){
    try {
      const found = await items.find({});
      if(found==0){
        insert();
        res.redirect("/")
      }else{
        res.render("list", { listTitle: "Today", newListItems: found});
      }
      
    } catch (error) {
      console.log("error in finding")
    }
  }
  findItems()
  
  
  
});

app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  let listName = req.body.list;
  const inputItem = new items({
    name: itemName
  })
  if(listName == "Today"){
    
    inputItem.save()
    res.redirect("/")
  }else{
    async function findOne(listName){
      try {
        const found = await List.findOne({name : listName});
        found.ListItems.push(inputItem)
        found.save();
        res.redirect("/" + listName)
      } catch (error) {
        console.log(error)
      }
    }
    findOne(listName);
  }

  

  // if (req.body.list == "work") {
  //   workItem.push(inputItem);
  //   res.redirect("/work");
  // } else {
  //   items.push(inputItem);
  //   res.redirect("/");
  // }

  // console.log(req.body);
});



app.post("/delete", function(req,res){
  const delItem = req.body.checkbox;
  const listName = req.body.ListName;
  

  

  async function deleteItem(delItem){
    try {
      await items.findByIdAndRemove(delItem);
      console.log("deleted successfuly")
      res.redirect("/")
    } catch (error) {
      console.log(error)
    }
  }

  async function delFromOtherList(listName,delItem){
    try {
      await List.findOneAndUpdate({name:listName},{$pull:{ListItems:{_id:delItem}}})
      res.redirect("/"+listName)
    } catch (error) {
      console.log("error");
    }
    
  }

 

  if(listName=="Today"){
    deleteItem(delItem);
  }else{
  //   List.findOneAndUpdate({name: listName}, {$pull: {ListItems: {_id: delItem}}}).then(function (foundList)
  // {
  //   res.redirect("/" + listName);
  // });

    delFromOtherList(listName,delItem)
   
  }
 
})

//app.post("/work", function (req, res) {});

app.get("/:costumListName",function(req,res){
  const customListName = _.capitalize(req.params.costumListName);
  console.log(customListName)

  
async function FindOne(customListName){
try {
  const foundList = await List.findOne({name : customListName}).exec();
  if(!foundList){
    console.log("doesnt exist");
    const list  = new List({
      name: customListName,
      ListItems : defaultItems
    })
    list.save();
    res.redirect("/"+ customListName);


  }else{
  console.log("exists")
  res.render("list", { listTitle: foundList.name , newListItems: foundList.ListItems});

  }
} catch (error) {
  console.log("error")
}
}
FindOne(customListName)


  
})

app.listen(port, function () {
  console.log("server working fine on the port : " + port);
});
