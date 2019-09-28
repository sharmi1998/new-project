const Express=require('express');
var app=new Express();
var bodyparser=require('body-parser');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
const session=require('express-session');
app.use(session({secret: 'ssshhhhh'}));
app.set('view engine','ejs');
app.use(Express.static(__dirname+"/public"));
var request=require('request');
var mongoose=require('mongoose');
// var nav=[{
//     item:"Home",
//     link:"/"

// },
// {
//     item:"Registration",
//     link:"/registration"
// }];
 mongoose.connect("mongodb://localhost:27017/recipe");
// mongoose.connect("mongodb+srv://mongodb:mongodb@mycluster-rfooj.mongodb.net/test?retryWrites=true&w=majority/recipe");
var LoginModel=mongoose.model("login",{
    username:String,
    password:String,
    utype:String
});
var RegistrationModel=mongoose.model("registration",{
    name:String,
    mailid:String,
    password:String
});
//Recipe model
var RecipeModel=mongoose.model("recipe",{
    name:String,
    ingredients:String,
    description:String,
    image:String,
    user:String,
    flag:String
});

//-----------------
app.get('/',(req,res)=>
{
    var viewrecipe="http://localhost:3000/viewall";
   //var viewrecipe="https://dashboard.heroku.com/apps/mini-project-recipe/viewall";
     request(viewrecipe,(error,response,body)=>{
         var data=JSON.parse(body);
         res.render('index',{title:"home",data:data});

     });


   
});
app.get('/index',(req,res)=>
{
    var viewrecipe="http://localhost:3000/viewall";
  //var viewrecipe="https://dashboard.heroku.com/apps/mini-project-recipe/viewall";
    request(viewrecipe,(error,response,body)=>{
        var data=JSON.parse(body);
        res.render('index',{title:"home",data:data});

    });

   
});

app.get('/registration',(req,res)=>{
    res.render('registration',{title:"Registration",val:"",emsg:""});
});
app.get('/login',(req,res)=>{
    res.render('login',{title:"Login page"});
});
app.get('/admin',(req,res)=>
{
    res.render('admin',{title:"Admin page"});
});
app.get('/user',(req,res)=>
{
    res.render('user',{title:"user page"});
});

//Read and save data from Registration page
app.post('/RegistrationApi',(req,res)=>
{
var regdata=new RegistrationModel(req.body);
var logdata=new LoginModel();
logdata.username=regdata.mailid;
logdata.password=regdata.password;
logdata.utype="user";

//---------------------------------------------

// //Save data to login collection

var resultlog=logdata.save((error)=>
{
    if(error)
    {
        throw error;
    }
    else{
        console.log(logdata);
    }
});
// //----------------------------------------------
//Save data to registration collection
var result=regdata.save((error)=>
{
   if(error)
   {
       throw error;
   }
   else{
       console.log(regdata);
       console.log("Name:"+regdata.name);
       console.log("Mailid"+regdata.mailid);
   }
});
 res.send("<script> window.location.href='/registration' </script>");
 //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/registration' </script>");
});

//---------------------------------------------------------------------

//Checking mail id already exist or not
app.get('/checkMailIdApi/:id',(req,res)=>
{
    var mail=req.params.id;
    var result=RegistrationModel.find({mailid:mail},(error,data)=>{
        if(error)
        {
            throw error;
        }
        else
        {
           
           res.send(data);

        }
    });

});
//Check login details
var sess;
app.post('/readlogin',(req,res)=>{
sess=req.session;
sess.username=req.body.username;
sess.password=req.body.password;
console.log("Username:"+sess.username);
console.log("Password:"+sess.password);
var result=LoginModel.find({$and:[{username:sess.username},{password:sess.password}]},(error,data)=>{
    if(error)
    {
        throw error;
    }
    else{
        if(data.length==1)
        {
           // console.log("usertype:"+data.utype);
            //console.log(data);
           if(data[0].utype=="user")
           {
                res.send("<script> window.location.href='/user' </script>");
              //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/user' </script>");


           }
           else{
            res.send("<script> window.location.href='/admin' </script>");
         //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/admin' </script>");
           }
        }
    }
});
});

//readRecipeApi for recipes to be approved Admin

app.get('/readRecipeApi',(req,res)=>{
    RecipeModel.find({flag:0},(error,data)=>
    {
        if(error)
        {
            throw error;
        }
        else{
            console.log(data);
            res.send(data);
        }
    });

});

//-----------------------

//View recipes Admin
app.get('/viewRecipeAdmin',(req,res)=>{

   var viewrecipe="http://localhost:3000/readRecipeApi";
 // var viewrecipe="https://dashboard.heroku.com/apps/mini-project-recipe/readRecipeApi";
  request(viewrecipe,(error,response,body)=>
  {
     var result=JSON.parse(body);
    res.render('viewRecipeAdmin',{title:"Admin page",result});
  });
});

//---------------------------

//Approve Recipe Api

// app.get('/approverecipe/:id',(req,res)=>{

//     var x=req.params.id;
//     var approvelink="http://localhost:3000/approveApi"+x;
//     request(approvelink,(error,response,body)=>{
//        // var data=JSON.parse(body);
//         if(error)
//         {
//             throw error;
//         }
//         else{

//             res.send("<script> window.location.href='/viewrecipeAdmin' </script>")

//         }
//     });
    
// });


app.get('/approveApi/:id',(req,res)=>{
   
    var id=req.params.id;  
    RecipeModel.update({_id:id},{$set:{flag:1}},(error,data)=>
    {
        if(error)
        {
            throw error;
        }
        else
        {
           
           res.send("<script> window.location.href='/viewrecipeAdmin' </script>")
         //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/viewrecipeAdmin' </script>")

        }
    });
});

//Delete a recipe

app.get('/deleterecipe/:id',(req,res)=>
{
    var id=req.params.id;
    RecipeModel.remove({_id:id},(error,data)=>{
        if(error)
        {
            throw error;
        }
        else{
            res.send("<script> window.location.href='/viewrecipeuser' </script>");
           //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/viewrecipeuser' </script>");
        }
    });
});






//-----------------------------------

//Add recipe

app.post('/addrecipe',(req,res)=>
{
    var recipe=new RecipeModel(req.body);
    recipe.user=sess.username;
    recipe.flag=0;
    var result=recipe.save((error)=>
    {
        if(error)
        {
            throw error;
        }
        else{
            console.log(recipe);
            

        }
    });
    res.send("<script> window.location.href='/user' </script>")
   //res.send("<script> window.location.href='https://mini-project-recipe.herokuapp.com/user' </script>")
});

//-------------------------------------

//Select recipes of a particular user
app.get('/viewRecipeU',(req,res)=>{
    var username=sess.username;
    var result=RecipeModel.find({user:username},(error,data)=>{
        if(error)
            {
              throw error;
            }
            else{
                res.render('viewrecipeuser',{data,title:"Recipes"});
            }

    });
});

//--------------------------------
app.get('/viewrecipeuser',(req,res)=>
{
    var username=sess.username;
    var result=RecipeModel.find({user:username},(error,data)=>{
        if(error)
            {
              throw error;
            }
            else{
                res.render('viewrecipeuser',{data,title:"Recipes"});
            }

    });
});
//view all recipes home page
app.get('/viewall',(req,res)=>
{
    RecipeModel.find({flag:1},(error,data)=>
    {
        if(error)
        {
            throw error;
        }
        else{
            console.log(data);
            res.send(data);
        }
    });
})


//--------------------------------


app.listen(process.env.PORT || 3000,()=>
{
    console.log("Server is running on localhost 3000");
});