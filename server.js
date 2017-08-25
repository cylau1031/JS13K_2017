const express = require('express'); 
const app = express(); 

app.get('/',function(req,res){   
     res.sendFile(__dirname + '/index.html');
});


app.use("/lib", express.static(__dirname + '/lib'));
app.use("/src", express.static(__dirname + '/src'));
app.use("/stylesheets", express.static(__dirname + '/stylesheets'));
app.use("/assets/images/", express.static(__dirname + '/assets/images/'));


app.listen(3000, function() {
	console.log('App is listening on port 3000'); 
})